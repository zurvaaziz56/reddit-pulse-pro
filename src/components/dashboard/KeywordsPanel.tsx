import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, Minus, X, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PLAN_LIMITS: Record<string, number> = { starter: 3, pro: 10, agency: 50 };

const KeywordsPanel = () => {
  const [newKeyword, setNewKeyword] = useState("");
  const { user, plan } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("plan").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: keywords = [], isLoading, error: loadError } = useQuery({
    queryKey: ["keywords", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("keywords").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const limit = PLAN_LIMITS[plan] ?? 3;
      if (keywords.length >= limit) {
        throw new Error(`You've reached the ${limit} keyword limit on your ${plan} plan. Upgrade to add more.`);
      }
      if (keyword.length < 2 || keyword.length > 100) throw new Error("Use 2–100 characters for a keyword.");
      const { error } = await supabase.from("keywords").insert({ keyword, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords"] });
      setNewKeyword("");
    },
    onError: (err: Error) => {
      toast({ title: "Cannot add keyword", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("keywords").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries(); },
    onError: (err: Error) => toast({ title: "Could not delete keyword", description: err.message, variant: "destructive" }),
  });

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    addMutation.mutate(newKeyword.trim());
  };

  const limit = PLAN_LIMITS[plan] ?? 3;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Keywords</h2>
        <span className="text-xs text-muted-foreground ml-auto">{keywords.length}/{limit} monitors</span>
      </div>

      <div className="flex gap-2">
        <Input
          aria-label="Keyword to track"
          maxLength={100}
          placeholder="Add a keyword to track..."
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addKeyword()}
          className="flex-1"
        />
        <Button variant="hero" size="default" onClick={addKeyword} disabled={addMutation.isPending}>
          {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </Button>
      </div>

      {loadError ? <p role="alert">Could not load keywords. Please refresh.</p> : isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : keywords.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">No keywords yet. Add one above to start tracking.</div>
      ) : (
        <div className="space-y-2">
          {keywords.map((kw) => (
            <div key={kw.id} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">{kw.keyword}</span>
                <span className="text-xs text-muted-foreground">
                  Added {new Date(kw.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                aria-label={`Delete ${kw.keyword}`}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(kw.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KeywordsPanel;
