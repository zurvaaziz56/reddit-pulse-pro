import { useState } from "react";
import OpportunitiesPanel from "@/components/dashboard/OpportunitiesPanel";
import { useKeywords } from "@/hooks/use-dashboard-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OpportunitiesPage = () => {
  const [keywordId, setKeywordId] = useState<string>();
  const { data: keywords = [] } = useKeywords();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Opportunities</h1>
          <p className="text-muted-foreground text-sm">Market opportunities scored by potential</p>
        </div>
        {keywords.length > 0 && (
          <Select value={keywordId ?? "all"} onValueChange={(v) => setKeywordId(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All keywords" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All keywords</SelectItem>
              {keywords.map((kw) => (
                <SelectItem key={kw.id} value={kw.id}>{kw.keyword}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <OpportunitiesPanel keywordId={keywordId} />
    </div>
  );
};

export default OpportunitiesPage;
