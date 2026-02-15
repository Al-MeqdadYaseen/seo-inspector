
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes"; // Use shared/routes for API definition
import { z } from "zod";
import axios from "axios";
import * as cheerio from "cheerio";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Use shared API definitions
  app.post(api.analyze.path, async (req, res) => {
    try {
      const { url } = api.analyze.input.parse(req.body);

      // Validate URL format (ensure http/https)
      let targetUrl = url;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      }

      console.log(`Fetching URL: ${targetUrl}`);
      
      // Fetch the HTML
      // Add a User-Agent to avoid being blocked by some sites
      const response = await axios.get(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOVisualizer/1.0;)'
        },
        timeout: 10000 // 10s timeout
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
      console.error("Analysis error:", error);
      if (axios.isAxiosError(error)) {
         return res.status(400).json({ message: `Failed to fetch URL: ${error.message}` });
      }
      res.status(500).json({ message: "Internal server error during analysis" });
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
