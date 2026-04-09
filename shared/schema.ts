
import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analysisDataSchema = z.object({
  missingTags: z.array(z.string()),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const analysis_results = pgTable("analysis_results", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterCard: text("twitter_card"),
  screenshot: text("screenshot"), // URL to a screenshot if we can generate one, otherwise null
  rawHtml: text("raw_html"), // Store a snippet or full HTML if needed, maybe truncated
  analysisData: jsonb("analysis_data").$type<z.infer<typeof analysisDataSchema>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysis_results, {
  analysisData: analysisDataSchema.optional(),
}).omit({
  id: true,
  createdAt: true
});

export type AnalysisResult = typeof analysis_results.$inferSelect;
export type InsertAnalysisResult = z.infer<typeof insertAnalysisSchema>;
