import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Facebook, Twitter, Globe } from "lucide-react";
import type { AnalyzeResponse } from "@/hooks/use-seo";

interface SocialPreviewProps {
  data: AnalyzeResponse;
}

export function SocialPreview({ data }: SocialPreviewProps) {
  return (
    <Tabs defaultValue="facebook" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold font-display">Social Previews</h3>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="facebook" className="gap-2">
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">Facebook / OG</span>
          </TabsTrigger>
          <TabsTrigger value="twitter" className="gap-2">
            <Twitter className="w-4 h-4" />
            <span className="hidden sm:inline">Twitter</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="facebook">
        <div className="max-w-[500px] mx-auto bg-[#F0F2F5] dark:bg-[#18191A] p-4 rounded-xl">
          <Card className="overflow-hidden border border-border/40 shadow-sm rounded-lg">
            {/* Image Area */}
            <div className="aspect-[1.91/1] bg-muted relative flex items-center justify-center overflow-hidden">
              {data.ogImage ? (
                <img 
                  src={data.ogImage} 
                  alt="OG Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <Globe className="w-12 h-12 opacity-20" />
                  <span className="text-sm font-medium">No Image Found</span>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="p-3 bg-[#F2F3F5] dark:bg-[#242526] border-t border-black/5">
              <div className="uppercase text-[11px] text-[#606770] dark:text-[#B0B3B8] font-medium truncate mb-0.5">
                {new URL(data.url).hostname}
              </div>
              <div className="font-bold text-[#1d2129] dark:text-[#E4E6EB] leading-tight mb-1 line-clamp-2">
                {data.ogTitle || data.title || "No Title"}
              </div>
              <div className="text-sm text-[#606770] dark:text-[#B0B3B8] line-clamp-1">
                {data.ogDescription || data.description || "No description available"}
              </div>
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="twitter">
        <div className="max-w-[500px] mx-auto bg-white dark:bg-black p-4 rounded-xl border border-border/10">
          <Card className="overflow-hidden border border-border/40 shadow-sm rounded-xl">
            {/* Image Area */}
            <div className="aspect-[2/1] bg-muted relative flex items-center justify-center overflow-hidden">
              {data.twitterImage || data.ogImage ? (
                <img 
                  src={data.twitterImage || data.ogImage || ""} 
                  alt="Twitter Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center gap-2">
                  <Twitter className="w-12 h-12 opacity-20" />
                  <span className="text-sm font-medium">No Image Found</span>
                </div>
              )}
            </div>
            
            {/* Content Area */}
            <div className="p-3 bg-white dark:bg-black">
              <div className="text-[15px] font-bold text-foreground leading-tight mb-0.5 truncate">
                {data.twitterTitle || data.ogTitle || data.title || "No Title"}
              </div>
              <div className="text-[15px] text-[#536471] dark:text-[#71767B] leading-snug line-clamp-2 mb-1">
                {data.twitterDescription || data.ogDescription || data.description || "No description available"}
              </div>
              <div className="text-[15px] text-[#536471] dark:text-[#71767B] flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {new URL(data.url).hostname}
              </div>
            </div>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
