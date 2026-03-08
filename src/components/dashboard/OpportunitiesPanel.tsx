import { Compass, Loader2 } from "lucide-react";
import { useInsights } from "@/hooks/use-dashboard-data";
import { opportunities as mockOpps } from "@/lib/mockData";

const OpportunitiesPanel = () => {
  const { data: insights, isLoading } = useInsights("opportunity");
  const hasData = insights && insights.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-success" />
          <h2 className="text-xl font-bold">Opportunities</h2>
        </div>
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-success" />
        <h2 className="text-xl font-bold">Opportunities</h2>
      </div>

      {!hasData && <p className="text-xs text-muted-foreground">Sample data shown below</p>}

      <div className="space-y-3">
        {hasData
          ? insights.map((opp) => (
              <div key={opp.id} className="p-4 rounded-xl bg-card border border-border">
                <p className="text-sm font-medium">{opp.content}</p>
                <span className="text-xs text-muted-foreground mt-1 block">{(opp as any).keywords?.keyword}</span>
              </div>
            ))
          : mockOpps.map((opp, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between gap-4">
                <p className="text-sm font-medium flex-1">{opp.text}</p>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{opp.score}</span>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default OpportunitiesPanel;
