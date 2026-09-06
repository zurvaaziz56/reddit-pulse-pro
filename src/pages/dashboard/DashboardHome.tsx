import { useState } from "react";
import { RefreshCw, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useKeywords, useRedditPosts } from "@/hooks/use-dashboard-data";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { functionError } from "@/lib/function-error";
import TrendingPostsPanel from "@/components/dashboard/TrendingPostsPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";

const DashboardHome = () => {
  const [selected, setSelected] = useState<string>();
  const [running, setRunning] = useState<string | null>(null);
  const { data: keywords = [], isLoading, error } = useKeywords();
  const keywordId = keywords.some(k => k.id === selected) ? selected : keywords[0]?.id;
  const { data: posts = [] } = useRedditPosts(keywordId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  async function run(name: "fetch-reddit" | "generate-insights") {
    if (!keywordId || running) return;
    setRunning(name);
    try {
      const { data, error } = await supabase.functions.invoke(name, { body: { keywordId } });
      if (error) throw error;
      toast({ title: name === "fetch-reddit" ? "Reddit posts fetched" : "Insights generated", description: data.message });
      await queryClient.invalidateQueries({ queryKey: [name === "fetch-reddit" ? "reddit_posts" : "insights"] });
    } catch (error) { toast({ title: "Request failed", description: await functionError(error), variant: "destructive" }); }
    finally { setRunning(null); }
  }
  return <div className="space-y-8 max-w-4xl">
    <div><h1 className="text-2xl font-bold mb-1">Dashboard</h1><p className="text-muted-foreground text-sm">Your Reddit trend overview</p></div>
    {isLoading ? <p role="status">Loading keywords…</p> : error ? <p role="alert">Could not load keywords. Please refresh.</p> : !keywords.length ?
      <div className="p-6 border rounded-xl"><p>Add a keyword to start researching Reddit discussions.</p><Button asChild className="mt-4"><Link to="/dashboard/keywords">Add a keyword</Link></Button></div> : <>
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={keywordId} onValueChange={setSelected} disabled={!!running}><SelectTrigger className="w-64" aria-label="Research keyword"><SelectValue /></SelectTrigger><SelectContent>{keywords.map(k => <SelectItem key={k.id} value={k.id}>{k.keyword}</SelectItem>)}</SelectContent></Select>
        <Button variant="outline" onClick={() => run("fetch-reddit")} disabled={!!running}>{running === "fetch-reddit" ? <Loader2 className="animate-spin"/> : <RefreshCw/>}Fetch Posts</Button>
        <Button onClick={() => run("generate-insights")} disabled={!!running || !posts.length}>{running === "generate-insights" ? <Loader2 className="animate-spin"/> : <Zap/>}Generate Insights</Button>
      </div>
      <p className="text-sm text-muted-foreground">Searches up to 25 recent posts from the past month. Analysis uses post text, not comment text.</p>
      {running && <p role="status" className="text-sm">{running === "fetch-reddit" ? "Fetching posts…" : "Analyzing posts… This may take a minute."}</p>}
      <TrendingPostsPanel keywordId={keywordId}/><InsightsPanel keywordId={keywordId}/>
    </>}
  </div>;
};
export default DashboardHome;
