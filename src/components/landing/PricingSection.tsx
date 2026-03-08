import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$19",
    period: "/mo",
    keywords: "3 keywords",
    features: ["3 keyword tracking", "Trending posts dashboard", "Basic AI insights", "Email support"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    keywords: "10 keywords",
    features: ["10 keyword tracking", "Full AI analysis", "Pain point detection", "Daily email digest", "Subreddit discovery", "Priority support"],
    cta: "Start Pro",
    highlighted: true,
  },
  {
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
          {plans.map((plan, i) => (
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
              <Button
                variant={plan.highlighted ? "hero" : "hero-outline"}
                asChild
                className="w-full"
              >
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
