import { subredditData } from "@/lib/mockData";

const SubredditChart = () => {
  const maxPosts = Math.max(...subredditData.map((s) => s.posts));

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <h3 className="font-semibold mb-4">Top Subreddits</h3>
      <div className="space-y-3">
        {subredditData.map((sub) => (
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
