
import { z } from "zod";
import { insertAnalysisSchema, analysis_results } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  analyze: {
    method: "POST" as const,
    path: "/api/analyze" as const,
    input: z.object({
      url: z.string().url(),
    }),
    responses: {
      200: z.object({
        url: z.string(),
        title: z.string().nullable(),
        description: z.string().nullable(),
        ogTitle: z.string().nullable(),
        ogDescription: z.string().nullable(),
        ogImage: z.string().nullable(),
        twitterCard: z.string().nullable(),
        twitterTitle: z.string().nullable(),
        twitterDescription: z.string().nullable(),
        twitterImage: z.string().nullable(),
        favicon: z.string().nullable(),
        issues: z.array(z.object({
          type: z.enum(["error", "warning", "info"]),
          message: z.string(),
          tag: z.string().optional(),
        })),
      }),
      400: errorSchemas.validation,
      500: errorSchemas.internal,
    },
  },
  history: {
    list: {
      method: "GET" as const,
      path: "/api/history" as const,
      responses: {
        200: z.array(z.custom<typeof analysis_results.$inferSelect>()),
      },
    },
  },
};
