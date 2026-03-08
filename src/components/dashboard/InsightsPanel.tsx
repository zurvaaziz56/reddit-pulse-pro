import { Brain, Lightbulb } from "lucide-react";
import { aiInsights } from "@/lib/mockData";

const InsightsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">AI Insights</h2>
      </div>

      <div className="p-5 rounded-xl bg-card border border-border space-y-4">
        <p className="text-sm text-muted-foreground">
          Generated from analysis of <span className="text-foreground font-medium">2,340 posts</span> across <span className="text-foreground font-medium">12 subreddits</span>
        </p>
        <ul className="space-y-3">
          {aiInsights.map((insight, i) => (
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
