import { AlertTriangle, Loader2 } from "lucide-react";
import { useInsights } from "@/hooks/use-dashboard-data";
import { painPoints as mockPainPoints } from "@/lib/mockData";

const PainPointsPanel = () => {
  const { data: insights, isLoading } = useInsights("pain_point");
  const hasData = insights && insights.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-bold">Pain Points</h2>
        </div>
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="text-xl font-bold">Pain Points</h2>
      </div>

      {!hasData && <p className="text-xs text-muted-foreground">Sample data shown below</p>}

      <div className="space-y-3">
        {hasData
          ? insights.map((point) => (
              <div key={point.id} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium mb-2">{point.content}</p>
                <span className="text-xs text-muted-foreground">{(point as any).keywords?.keyword}</span>
              </div>
            ))
          : mockPainPoints.map((point, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium mb-2">{point.text}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{point.mentions} mentions</span>
                  <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">{point.sentiment}</span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default PainPointsPanel;
