import { ArrowUpRight, MessageSquare, ThumbsUp, TrendingUp, Loader2 } from "lucide-react";
import { useRedditPosts } from "@/hooks/use-dashboard-data";
import { trendingPosts as mockPosts } from "@/lib/mockData";

const TrendingPostsPanel = () => {
  const { data: posts, isLoading } = useRedditPosts();
  const hasPosts = posts && posts.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Trending Posts</h2>
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  const displayPosts = hasPosts
    ? posts.map((p) => ({
        id: p.id,
        title: p.title,
        subreddit: p.subreddit,
        upvotes: p.score,
        comments: p.num_comments,
        link: p.url,
        timestamp: getTimeAgo(p.created_utc),
        growth: "",
      }))
    : mockPosts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Trending Posts</h2>
        <span className="text-sm text-muted-foreground">
          {hasPosts ? `${posts.length} posts` : "Sample data"}
        </span>
      </div>

      <div className="space-y-3">
        {displayPosts.slice(0, 10).map((post) => (
          <a
            key={post.id}
            href={post.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors group"
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
                {post.growth && (
                  <span className="text-xs font-mono text-success flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {post.growth}
                  </span>
                )}
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default TrendingPostsPanel;
