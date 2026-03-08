import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    key: "starter" as const,
    name: "Starter",
    price: "$19",
    period: "/mo",
    keywords: "3 keywords",
    features: ["3 keyword tracking", "Trending posts dashboard", "Basic AI insights", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$49",
    period: "/mo",
    keywords: "10 keywords",
    features: ["10 keyword tracking", "Full AI analysis", "Pain point detection", "Daily email digest", "Subreddit discovery", "Priority support"],
    cta: "Start Pro",
    highlighted: true,
  },
  {
    key: "agency" as const,
    name: "Agency",
    price: "$149",
    period: "/mo",
    keywords: "50 keywords",
    features: ["50 keyword tracking", "Advanced AI insights", "Opportunity scoring", "Custom reports", "API access", "Dedicated support"],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const PricingSection = () => {
  const { user, plan: currentPlan } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanClick = async (planKey: "starter" | "pro" | "agency") => {
    if (!user) {
      navigate("/signup");
      return;
    }
    const tier = STRIPE_TIERS[planKey];
    setLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: tier.price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="py-24 border-t border-border">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg">Start free, scale as you grow.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => {
            const isCurrentPlan = user && currentPlan === plan.key;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-xl border flex flex-col ${
                  plan.highlighted
                    ? "bg-card border-primary/40 card-glow"
                    : "bg-card border-border"
                }`}
              >
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.keywords}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-secondary-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <Button variant="hero-outline" disabled className="w-full">
                    Your Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? "hero" : "hero-outline"}
                    className="w-full"
                    disabled={!!loading}
                    onClick={() => handlePlanClick(plan.key)}
                  >
                    {loading === plan.key && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {plan.cta}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
