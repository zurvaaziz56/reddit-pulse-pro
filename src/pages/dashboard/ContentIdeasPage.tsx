import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { useInsights, useKeywords } from "@/hooks/use-dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContentIdeasPage = () => {
  const [keywordId, setKeywordId] = useState<string>();
  const { data: keywords = [] } = useKeywords();
  const { data: insights, isLoading, error } = useInsights("content_idea", keywordId);
  const hasData = insights && insights.length > 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Content Ideas</h1>
          <p className="text-muted-foreground text-sm">AI-generated content ideas from Reddit discussions</p>
        </div>
        {keywords.length > 0 && (
          <Select value={keywordId ?? "all"} onValueChange={(v) => setKeywordId(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All keywords" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All keywords</SelectItem>
              {keywords.map((kw) => (
                <SelectItem key={kw.id} value={kw.id}>{kw.keyword}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {error ? <p role="alert">Could not load content ideas. Please refresh.</p> : isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : !hasData ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No content ideas yet. Add keywords and generate insights to see ideas here.
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((idea) => (
            <div key={idea.id} className="p-4 rounded-xl bg-card border border-border flex gap-3">
              <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{idea.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">{idea.keywords?.keyword}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentIdeasPage;
