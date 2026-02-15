import { useHistory, type HistoryResponse } from "@/hooks/use-seo";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Globe, ArrowRight, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function History() {
  const { data: history, isLoading, error } = useHistory();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-muted rounded-full" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading History</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight">Analysis History</h1>
            <p className="text-muted-foreground mt-1">Review your past SEO reports</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              New Analysis
            </Button>
          </Link>
        </div>

        <div className="grid gap-4">
          {history?.length === 0 ? (
            <Card className="p-12 text-center bg-muted/20 border-dashed">
              <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No history yet</h3>
              <p className="text-muted-foreground mb-6">Analyze your first website to see it here.</p>
              <Link href="/">
                <Button>Start Analyzing</Button>
              </Link>
            </Card>
          ) : (
            history?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group p-5 hover:shadow-md transition-all border-border/60 hover:border-primary/50">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          ID: {item.id}
                        </span>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'Just now'}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                        {item.metaTitle || item.url}
                      </h3>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-sm text-muted-foreground hover:underline flex items-center gap-1 mt-1 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {item.ogImage && (
                          <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                            Has OG Image
                          </span>
                        )}
                        {!item.metaDescription && (
                          <span className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-800">
                            No Description
                          </span>
                        )}
                      </div>
                      
                      {/* 
                         Ideally this would navigate to a details page /history/:id 
                         But for now we just show the data in the list or maybe re-analyze
                      */}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
