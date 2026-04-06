import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAnalyze, type AnalyzeResponse } from "@/hooks/use-seo";
import { Header } from "@/components/layout/Header";
import { GooglePreview } from "@/components/previews/GooglePreview";
import { SocialPreview } from "@/components/previews/SocialPreview";
import { IssueList } from "@/components/results/IssueList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Search, ArrowRight, Loader2, Sparkles, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  url: z.string().min(1, "Please enter a URL"),
});

type FormInput = z.input<typeof formSchema>;

function normalizeUrl(raw: string): string {
  let url = raw.trim();
  // Strip any existing protocol including malformed ones (http:\\ https:\\ etc.)
  url = url.replace(/^[a-zA-Z][a-zA-Z0-9+\-.]*:[\\/]*/i, "");
  // Remove any leading slashes left over
  url = url.replace(/^\/+/, "");
  return "https://" + url;
}

export default function Home() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const { mutate, isPending } = useAnalyze();
  const { toast } = useToast();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" }
  });

  const onSubmit = (data: FormInput) => {
    setResult(null);
    const normalizedUrl = normalizeUrl(data.url);
    mutate({ url: normalizedUrl }, {
      onSuccess: (data) => setResult(data),
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Analysis failed",
          description: error instanceof Error
            ? error.message
            : "Could not fetch the URL. Please check it and try again.",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="w-full max-w-3xl text-center space-y-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground mb-4">
              See your site through <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Search Engine Eyes
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Instantly preview how your website appears on Google, Facebook, and Twitter. 
              Get actionable SEO recommendations in seconds.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto relative group"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                {...form.register("url")}
                placeholder="https://example.com"
                className="pl-10 h-14 text-lg rounded-xl border-2 border-border focus-visible:ring-0 focus-visible:border-primary transition-all shadow-sm"
                disabled={isPending}
              />
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="h-14 px-8 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.form>
          
          {form.formState.errors.url && (
            <p className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
              {form.formState.errors.url.message}
            </p>
          )}
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column: Previews */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold font-display">Search Preview</h2>
                </div>
                <GooglePreview data={result} />

                <div className="my-8 h-px bg-border/50" />

                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold font-display">Social Cards</h2>
                </div>
                <SocialPreview data={result} />
              </div>

              {/* Right Column: Analysis */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                      <Loader2 className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold font-display">Analysis Report</h2>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {result.issues.length} Issues Found
                  </span>
                </div>

                <Card className="p-6 border shadow-sm">
                  <IssueList issues={result.issues} />
                </Card>

                {/* Raw Meta Data Summary could go here */}
                <Card className="p-6 bg-muted/30 border-dashed">
                  <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Detected Tags</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Title Length</span>
                      <span className="font-mono font-medium">{result.title?.length || 0} chars</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Desc. Length</span>
                      <span className="font-mono font-medium">{result.description?.length || 0} chars</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">OG Image</span>
                      <span className={cn("font-mono font-medium", result.ogImage ? "text-emerald-600" : "text-destructive")}>
                        {result.ogImage ? "Present" : "Missing"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Twitter Card</span>
                      <span className="font-mono font-medium">{result.twitterCard || "None"}</span>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State / Initial Placeholder */}
        {!result && !isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              Try analyzing <span className="font-mono text-foreground">github.com</span> or <span className="font-mono text-foreground">stripe.com</span>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
