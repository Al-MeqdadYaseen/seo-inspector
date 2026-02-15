
import { analysis_results, type InsertAnalysisResult, type AnalysisResult } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysisResult): Promise<AnalysisResult>;
  getHistory(): Promise<AnalysisResult[]>;
}

export class DatabaseStorage implements IStorage {
  async createAnalysis(insertAnalysis: InsertAnalysisResult): Promise<AnalysisResult> {
    const [analysis] = await db
      .insert(analysis_results)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getHistory(): Promise<AnalysisResult[]> {
    return await db
      .select()
      .from(analysis_results)
      .orderBy(desc(analysis_results.createdAt))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
