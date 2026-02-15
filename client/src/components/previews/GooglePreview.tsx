import { Card } from "@/components/ui/card";
import type { AnalyzeResponse } from "@/hooks/use-seo";

interface GooglePreviewProps {
  data: AnalyzeResponse;
}

export function GooglePreview({ data }: GooglePreviewProps) {
  const title = data.title || "No Title Found";
  const desc = data.description || "No meta description found for this page.";
  const url = data.url;
  
  // Format URL for Google-style display (e.g. example.com > blog > post)
  const displayUrl = (() => {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname === '/' ? '' : ` › ${urlObj.pathname.slice(1).replace(/\//g, ' › ')}`;
      return `${urlObj.hostname}${path}`;
    } catch {
      return url;
    }
  })();

  return (
    <Card className="p-6 bg-white dark:bg-[#202124] border-none shadow-sm font-sans">
      <div className="flex flex-col gap-1 max-w-[600px]">
        {data.favicon && (
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-gray-100 p-1 rounded-full">
              <img src={data.favicon} alt="Favicon" className="w-4 h-4" />
            </div>
            <span className="text-sm text-[#202124] dark:text-[#bdc1c6] truncate">
              {new URL(url).hostname}
            </span>
            <div className="w-1 h-1 bg-gray-500 rounded-full" />
          </div>
        )}
        
        <div className="group cursor-pointer">
          <cite className="google-preview-link text-sm not-italic block mb-1">
            {displayUrl}
          </cite>
          <h3 className="google-preview-title text-xl hover:underline truncate">
            {title}
          </h3>
        </div>
        
        <p className="google-preview-desc text-sm leading-6 line-clamp-2">
          {desc}
        </p>
      </div>
    </Card>
  );
}
