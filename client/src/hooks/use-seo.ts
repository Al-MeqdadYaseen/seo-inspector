import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// Define response types explicitly based on the Zod schema in routes
export type AnalyzeResponse = z.infer<typeof api.analyze.responses[200]>;
export type HistoryResponse = z.infer<typeof api.history.list.responses[200]>;
export type AnalyzeInput = z.infer<typeof api.analyze.input>;

export function useAnalyze() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AnalyzeInput) => {
      // Client-side validation
      const validated = api.analyze.input.parse(data);
      
      const res = await fetch(api.analyze.path, {
        method: api.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Invalid URL provided");
        }
        throw new Error("Failed to analyze website. Please check the URL and try again.");
      }

      const result = await res.json();
      return api.analyze.responses[200].parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.history.list.path] });
    },
  });
}

export function useHistory() {
  return useQuery({
    queryKey: [api.history.list.path],
    queryFn: async () => {
      const res = await fetch(api.history.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return api.history.list.responses[200].parse(data);
    },
  });
}
