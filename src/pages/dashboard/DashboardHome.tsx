import { useState, useEffect } from "react";
import { RefreshCw, Loader2, BarChart3, Tag, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useKeywords, useRedditPosts, useInsights } from "@/hooks/use-dashboard-data";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TrendingPostsPanel from "@/components/dashboard/TrendingPostsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import SubredditChart from "@/components/dashboard/SubredditChart";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import SubredditChart from "@/components/dashboard/SubredditChart";

const DashboardHome = () => {
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { data: keywords = [] } = useKeywords();
  const { data: posts = [] } = useRedditPosts();
  const { data: insights = [] } = useInsights();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshSubscription } = useAuth();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast({ title: "🎉 Subscription activated!", description: "Your plan has been upgraded successfully." });
      refreshSubscription();
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    } else if (checkout === "cancelled") {
      toast({ title: "Checkout cancelled", description: "No changes were made to your plan." });
      searchParams.delete("checkout");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleFetchReddit = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-reddit");
      if (error) throw error;
      toast({ title: "Reddit posts fetched", description: data?.message });
      queryClient.invalidateQueries({ queryKey: ["reddit_posts"] });
    } catch (e: any) {
      toast({ title: "Fetch failed", description: e.message, variant: "destructive" });
    }
    setFetching(false);
  };

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights");
      if (error) throw error;
      toast({ title: "Insights generated", description: data?.message });
      queryClient.invalidateQueries({ queryKey: ["insights"] });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Your Reddit trend overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleFetchReddit} disabled={fetching || keywords.length === 0}>
            {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Fetch Posts
          </Button>
          <Button variant="hero" size="sm" onClick={handleGenerateInsights} disabled={generating || posts.length === 0}>
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate Insights
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Tag} label="Keywords" value={keywords.length} />
        <StatCard icon={BarChart3} label="Posts Tracked" value={posts.length} />
        <StatCard icon={Brain} label="Insights" value={insights.length} />
        <StatCard icon={Zap} label="Subreddits" value={new Set(posts.map((p) => p.subreddit)).size} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendingPostsPanel />
        </div>
        <div className="space-y-6">
          <SubredditChart />
        </div>
      </div>

      <InsightsPanel />
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <div className="p-4 rounded-xl bg-card border border-border">
    <div className="flex items-center gap-2 text-muted-foreground mb-1">
      <Icon className="w-4 h-4" />
      <span className="text-xs">{label}</span>
    </div>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default DashboardHome;
