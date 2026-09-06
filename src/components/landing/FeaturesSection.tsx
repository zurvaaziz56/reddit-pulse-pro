import { motion } from "framer-motion";
import { TrendingUp, Brain, Search, Mail, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Keyword Tracking",
    description: "Monitor any keyword across Reddit. Track AI tools, supplements, SaaS products — anything.",
  },
  {
    icon: TrendingUp,
    title: "Trending Posts",
    description: "Surface the most upvoted, most commented, and fastest-growing discussions in real time.",
  },
  {
    icon: Brain,
    title: "AI Insights",
    description: "AI analyzes posts to extract trends, pain points, and market opportunities automatically.",
  },
  {
    icon: BarChart3,
    title: "Subreddit Discovery",
    description: "Find which subreddits discuss your topic most — discover communities you didn't know existed.",
  },
  {
    icon: Mail,
    title: "Daily Digest",
    description: "Get a daily email summary of top discussions, trending ideas, and customer pain points.",
  },
  {
    icon: Zap,
    title: "Actionable Data",
    description: "Turn Reddit noise into structured insights you can act on for product and marketing decisions.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 border-t border-border">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to decode Reddit</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From keyword tracking to AI-powered insights, get the full picture of what your market is talking about.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.filter(feature => ["Keyword Tracking", "Subreddit Discovery", "Actionable Data"].includes(feature.title)).map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
