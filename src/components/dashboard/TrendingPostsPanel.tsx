import { ArrowUpRight, MessageSquare, ThumbsUp, TrendingUp } from "lucide-react";
import { trendingPosts } from "@/lib/mockData";

const TrendingPostsPanel = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Trending Posts</h2>
        <span className="text-sm text-muted-foreground">Last 24 hours</span>
      </div>

      <div className="space-y-3">
        {trendingPosts.map((post) => (
          <div
            key={post.id}
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-snug mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono text-primary/80">{post.subreddit}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.upvotes.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.comments}
                  </span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-mono text-success flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {post.growth}
                </span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPostsPanel;
