
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes"; // Use shared/routes for API definition
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";
import https from "https";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Use shared API definitions
  app.post(api.analyze.path, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string" || url.trim() === "") {
        return res.status(400).json({ message: "URL is required." });
      }

      // Normalize URL: strip any existing protocol (including malformed ones) and re-add https://
      let normalized = url.trim();
      normalized = normalized.replace(/^[a-zA-Z][a-zA-Z0-9+\-.]*:[\\/]*/i, "");
      normalized = normalized.replace(/^\/+/, "");
      const targetUrl = "https://" + normalized;

      // Basic sanity check — must look like a hostname
      try {
        const parsed = new URL(targetUrl);
        if (!parsed.hostname || !parsed.hostname.includes(".")) {
          return res.status(400).json({ message: "Please enter a valid website URL." });
        }
      } catch {
        return res.status(400).json({ message: "Please enter a valid website URL." });
      }

      console.log(`Fetching URL: ${targetUrl}`);
      
      // Fetch the HTML (limit to 5MB to prevent memory abuse)
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOVisualizer/1.0; +https://seovision.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
        maxContentLength: 5 * 1024 * 1024, // 5MB
        maxBodyLength: 5 * 1024 * 1024,
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false
        })
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract Meta Tags
      const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
      
      const ogTitle = $('meta[property="og:title"]').attr('content') || '';
      const ogDescription = $('meta[property="og:description"]').attr('content') || '';
      const ogImage = $('meta[property="og:image"]').attr('content') || '';
      
      const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
      const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
      const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
      const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';

      // Extract Favicon (basic heuristic)
      let favicon = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico';
      if (favicon && !favicon.startsWith('http')) {
        // Handle relative URLs
        const urlObj = new URL(targetUrl);
        if (favicon.startsWith('//')) {
            favicon = urlObj.protocol + favicon;
        } else if (favicon.startsWith('/')) {
            favicon = urlObj.origin + favicon;
        } else {
            // Path relative to current path - simplified for now
            favicon = urlObj.origin + '/' + favicon; 
        }
      }

      // Analyze & Generate Issues
      const issues: { type: "error" | "warning" | "info", message: string, tag?: string }[] = [];

      // Title Analysis
      if (!title) {
        issues.push({ type: "error", message: "Missing <title> tag.", tag: "title" });
      } else if (title.length < 30) {
        issues.push({ type: "warning", message: `Title is too short (${title.length} chars). Recommended: 50-60 chars.`, tag: "title" });
      } else if (title.length > 60) {
        issues.push({ type: "warning", message: `Title is too long (${title.length} chars). Google may truncate it.`, tag: "title" });
      } else {
        issues.push({ type: "info", message: "Title length is optimal.", tag: "title" });
      }

      // Description Analysis
      if (!description) {
        issues.push({ type: "error", message: "Missing meta description.", tag: "description" });
      } else if (description.length < 120) {
        issues.push({ type: "warning", message: `Description is too short (${description.length} chars). Recommended: 150-160 chars.`, tag: "description" });
      } else if (description.length > 160) {
        issues.push({ type: "warning", message: `Description is too long (${description.length} chars). Google may truncate it.`, tag: "description" });
      } else {
        issues.push({ type: "info", message: "Description length is optimal.", tag: "description" });
      }

      // OG Tags Analysis
      if (!ogTitle) issues.push({ type: "warning", message: "Missing Open Graph Title (og:title).", tag: "og:title" });
      if (!ogDescription) issues.push({ type: "warning", message: "Missing Open Graph Description (og:description).", tag: "og:description" });
      if (!ogImage) {
        issues.push({ type: "error", message: "Missing Open Graph Image (og:image). Link previews will look plain.", tag: "og:image" });
      } else {
         issues.push({ type: "info", message: "Open Graph Image is present.", tag: "og:image" });
      }

      // Twitter Tags Analysis
      if (!twitterCard) issues.push({ type: "info", message: "Missing Twitter Card type (twitter:card). Twitter may fall back to OG tags.", tag: "twitter:card" });

      // Save to History (Fire and forget, or await if critical)
      try {
        await storage.createAnalysis({
          url: targetUrl,
          metaTitle: title,
          metaDescription: description,
          ogTitle: ogTitle,
          ogDescription: ogDescription,
          ogImage: ogImage,
          twitterCard: twitterCard,
          analysisData: {
            missingTags: issues.filter(i => i.type === 'error').map(i => i.tag || ''),
            warnings: issues.filter(i => i.type === 'warning').map(i => i.message),
            recommendations: issues.map(i => i.message)
          }
        });
      } catch (dbError) {
        console.error("Failed to save analysis history:", dbError);
        // Continue, don't fail the request
      }

      res.json({
        url: targetUrl,
        title,
        description,
        ogTitle,
        ogDescription,
        ogImage,
        twitterCard,
        twitterTitle,
        twitterDescription,
        twitterImage,
        favicon,
        issues
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const code = (error.cause as any)?.code || error.code;
        if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
          return res.status(400).json({ message: "Domain not found. Please check the URL and try again." });
        }
        if (code === "ECONNREFUSED" || code === "ECONNRESET") {
          return res.status(400).json({ message: "Connection refused by the server. The site may be down." });
        }
        if (code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
          return res.status(400).json({ message: "Request timed out. The site took too long to respond." });
        }
        if (error.response?.status === 403 || error.response?.status === 401) {
          return res.status(400).json({ message: "The website blocked access. Try a different URL." });
        }
        return res.status(400).json({ message: "Could not reach the URL. Please check it and try again." });
      }
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  app.get(api.history.list.path, async (req, res) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (error) {
       console.error("History fetch error:", error);
       res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  return httpServer;
}
