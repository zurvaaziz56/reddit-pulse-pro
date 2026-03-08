import { Compass } from "lucide-react";
import { opportunities } from "@/lib/mockData";

const OpportunitiesPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Compass className="w-5 h-5 text-success" />
        <h2 className="text-xl font-bold">Opportunities</h2>
      </div>

      <div className="space-y-3">
        {opportunities.map((opp, i) => (
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
