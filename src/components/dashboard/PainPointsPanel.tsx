import { AlertTriangle } from "lucide-react";
import { painPoints } from "@/lib/mockData";

const PainPointsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="text-xl font-bold">Pain Points</h2>
      </div>

      <div className="space-y-3">
        {painPoints.map((point, i) => (
          <div key={i} className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm font-medium mb-2">{point.text}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{point.mentions} mentions</span>
              <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                {point.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PainPointsPanel;
