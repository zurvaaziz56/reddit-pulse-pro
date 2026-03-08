import { useState } from "react";
import { Radar, BarChart3, Brain, Target, Compass, Tag, Settings, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { Progress } from "@/components/ui/progress";
import { useKeywords } from "@/hooks/use-dashboard-data";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: BarChart3, label: "Trending", path: "/dashboard" },
  { icon: Brain, label: "AI Insights", path: "/dashboard/insights" },
  { icon: Target, label: "Pain Points", path: "/dashboard/painpoints" },
  { icon: Compass, label: "Opportunities", path: "/dashboard/opportunities" },
  { icon: Tag, label: "Keywords", path: "/dashboard/keywords" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user, plan } = useAuth();
  const { data: keywords = [] } = useKeywords();
  const [open, setOpen] = useState(false);

  const tier = STRIPE_TIERS[plan] ?? STRIPE_TIERS.starter;
  const usagePercent = Math.min((keywords.length / tier.keywords) * 100, 100);
  const nearLimit = usagePercent >= 80;

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Radar className="w-5 h-5 text-primary" />
          <span>Trend Radar</span>
        </Link>
        <button onClick={() => setOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
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

      {/* Usage bar */}
      <div className="px-4 pb-3">
        <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Keywords</span>
            <span>{keywords.length}/{tier.keywords}</span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
          {nearLimit && plan !== "agency" && (
            <Button
              variant="hero"
              size="sm"
              className="w-full text-xs h-7 mt-1"
              onClick={() => { navigate("/dashboard/settings"); setOpen(false); }}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-border space-y-1">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          <p className="text-xs text-primary/80 font-medium mt-0.5">{tier.name} Plan</p>
        </div>
        <Link
          to="/dashboard/settings"
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
            location.pathname === "/dashboard/settings"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          } w-full`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3">
        <button onClick={() => setOpen(true)} className="text-foreground">
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold text-sm">
          <Radar className="w-4 h-4 text-primary" />
          <span>Trend Radar</span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-60 bg-card min-h-screen flex flex-col border-r border-border">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-border bg-card min-h-screen flex-col flex-shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default DashboardSidebar;
