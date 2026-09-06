import { Radar } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Radar className="w-4 h-4" />
          <span className="text-sm">© 2026 Reddit Trend Radar</span>
        </div>

      </div>
    </footer>
  );
};

export default FooterSection;
