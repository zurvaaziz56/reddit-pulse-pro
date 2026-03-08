import { Radar, BarChart3, Brain, Target, Compass, Tag, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: BarChart3, label: "Trending", path: "/dashboard" },
  { icon: Brain, label: "AI Insights", path: "/dashboard/insights" },
  { icon: Target, label: "Pain Points", path: "/dashboard/painpoints" },
  { icon: Compass, label: "Opportunities", path: "/dashboard/opportunities" },
  { icon: Tag, label: "Keywords", path: "/dashboard/keywords" },
];

const DashboardSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-60 border-r border-border bg-card min-h-screen flex flex-col">
      <div className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Radar className="w-5 h-5 text-primary" />
          <span>Trend Radar</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path === "/dashboard" && location.pathname === "/dashboard");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-colors">
          <LogOut className="w-4 h-4" />
          Log out
        </Link>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
