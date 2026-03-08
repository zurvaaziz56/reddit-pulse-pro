import { Brain, Lightbulb, Loader2 } from "lucide-react";
import { useInsights } from "@/hooks/use-dashboard-data";
import { aiInsights as mockInsights } from "@/lib/mockData";

const InsightsPanel = ({ keywordId }: { keywordId?: string }) => {
  const { data: insights, isLoading } = useInsights("trend", keywordId);
  const hasData = insights && insights.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">AI Insights</h2>
        </div>
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const displayInsights = hasData ? insights.map((i) => i.content) : mockInsights;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">AI Insights</h2>
      </div>

      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <p className="text-sm text-muted-foreground">
          {hasData ? `${insights.length} trends detected` : "Sample data — add keywords and fetch posts to generate real insights"}
        </p>
        <ul className="space-y-3">
          {displayInsights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <span className="text-secondary-foreground leading-relaxed">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InsightsPanel;
