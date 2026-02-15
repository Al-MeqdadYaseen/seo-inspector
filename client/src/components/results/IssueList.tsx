import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/hooks/use-seo";

interface IssueListProps {
  issues: AnalyzeResponse["issues"];
}

export function IssueList({ issues }: IssueListProps) {
  const groupedIssues = {
    error: issues.filter((i) => i.type === "error"),
    warning: issues.filter((i) => i.type === "warning"),
    info: issues.filter((i) => i.type === "info"),
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "info": return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "error": return "bg-destructive/5 border-destructive/10";
      case "warning": return "bg-amber-500/5 border-amber-500/10";
      case "info": return "bg-blue-500/5 border-blue-500/10";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Score / Overview could go here */}
      
      <div className="grid gap-4">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Perfect Score!</h3>
            <p className="text-emerald-600/80 dark:text-emerald-500/80">No significant SEO issues found.</p>
          </div>
        ) : (
          issues.map((issue, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                getBgColor(issue.type)
              )}
            >
              <div className="mt-0.5 shrink-0">
                {getIcon(issue.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    issue.type === "error" ? "text-destructive" :
                    issue.type === "warning" ? "text-amber-600 dark:text-amber-500" :
                    "text-blue-600 dark:text-blue-500"
                  )}>
                    {issue.type}
                  </span>
                  {issue.tag && (
                    <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background rounded border border-border/50 font-mono">
                      {issue.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                  {issue.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
