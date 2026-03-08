import TrendingPostsPanel from "@/components/dashboard/TrendingPostsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import SubredditChart from "@/components/dashboard/SubredditChart";

const DashboardHome = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Your Reddit trend overview</p>
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

export default DashboardHome;
