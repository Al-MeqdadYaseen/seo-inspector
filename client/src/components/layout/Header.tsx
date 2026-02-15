import { Link } from "wouter";
import { Search, History, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl text-primary transition-colors hover:text-primary/80">
            <Search className="w-6 h-6" />
            <span>SEO Vision</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              New Analysis
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
          </Link>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
