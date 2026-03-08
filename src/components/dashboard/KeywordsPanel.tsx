import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Minus, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { keywords as initialKeywords } from "@/lib/mockData";

const trendIcons = {
  up: <TrendingUp className="w-3.5 h-3.5 text-success" />,
  down: <TrendingDown className="w-3.5 h-3.5 text-destructive" />,
  stable: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
};

const KeywordsPanel = () => {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [newKeyword, setNewKeyword] = useState("");

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords([
      ...keywords,
      { id: Date.now().toString(), keyword: newKeyword.trim(), posts: 0, trend: "stable" as const },
    ]);
    setNewKeyword("");
  };

  const removeKeyword = (id: string) => {
    setKeywords(keywords.filter((k) => k.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Keywords</h2>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add a keyword to track..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          className="flex-1"
        />
        <Button variant="hero" size="default" onClick={addKeyword}>
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {keywords.map((kw) => (
          <div key={kw.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-medium text-sm">{kw.keyword}</span>
              <span className="text-xs text-muted-foreground">{kw.posts.toLocaleString()} posts</span>
            </div>
            <div className="flex items-center gap-3">
              {trendIcons[kw.trend]}
              <button onClick={() => removeKeyword(kw.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeywordsPanel;
