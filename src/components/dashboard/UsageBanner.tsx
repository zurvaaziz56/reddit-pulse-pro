import { useAuth } from "@/contexts/AuthContext";
import { useKeywords } from "@/hooks/use-dashboard-data";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UsageBanner = () => {
  const { plan } = useAuth();
  const { data: keywords = [] } = useKeywords();
  const navigate = useNavigate();

  const tier = STRIPE_TIERS[plan] ?? STRIPE_TIERS.starter;
  const usagePercent = Math.min((keywords.length / tier.keywords) * 100, 100);
  const atLimit = keywords.length >= tier.keywords;
  const nearLimit = usagePercent >= 80;

  if (!nearLimit || plan === "agency") return null;

  return (
    <div className={`p-4 rounded-xl border ${atLimit ? "border-destructive/30 bg-destructive/5" : "border-warning/30 bg-warning/5"} flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {atLimit ? (
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
        ) : (
          <Zap className="w-4 h-4 text-warning flex-shrink-0" />
        )}
        <div className="text-sm">
          <span className="font-medium">
            {atLimit
              ? `You've reached your ${tier.keywords} keyword limit.`
              : `${keywords.length}/${tier.keywords} keywords used — nearing your limit.`}
          </span>
          <span className="text-muted-foreground ml-1">Upgrade to track more.</span>
        </div>
      </div>
      <Button variant="hero" size="sm" className="flex-shrink-0 text-xs" onClick={() => navigate("/dashboard/settings")}>
        Upgrade Now
      </Button>
    </div>
  );
};

export default UsageBanner;
