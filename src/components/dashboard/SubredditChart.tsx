import { Loader2 } from "lucide-react";
import { useRedditPosts } from "@/hooks/use-dashboard-data";
import { subredditData as mockData } from "@/lib/mockData";

const SubredditChart = () => {
  const { data: posts, isLoading } = useRedditPosts();

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Top Subreddits</h3>
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const hasPosts = posts && posts.length > 0;

  // Aggregate subreddit counts from real data
  const subredditCounts: Record<string, number> = {};
  if (hasPosts) {
    for (const p of posts) {
      subredditCounts[p.subreddit] = (subredditCounts[p.subreddit] || 0) + 1;
    }
  }

  const chartData = hasPosts
    ? Object.entries(subredditCounts)
        .map(([name, posts]) => ({ name, posts }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 8)
    : mockData.map((s) => ({ name: s.name, posts: s.posts }));

  const maxPosts = Math.max(...chartData.map((s) => s.posts), 1);

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h3 className="font-semibold mb-4">Top Subreddits</h3>
      {!hasPosts && <p className="text-xs text-muted-foreground mb-3">Sample data</p>}
      <div className="space-y-3">
        {chartData.map((sub) => (
          <div key={sub.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-mono text-primary/80">{sub.name}</span>
              <span className="text-muted-foreground">{sub.posts} posts</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${(sub.posts / maxPosts) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubredditChart;
