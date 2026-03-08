import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useKeywords = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["keywords", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("keywords").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useRedditPosts = (keywordId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reddit_posts", user?.id, keywordId],
    queryFn: async () => {
      let query = supabase.from("reddit_posts").select("*").order("score", { ascending: false }).limit(50);
      if (keywordId) query = query.eq("keyword_id", keywordId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useInsights = (type?: string, keywordId?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["insights", user?.id, type, keywordId],
    queryFn: async () => {
      let query = supabase.from("insights").select("*, keywords(keyword)").order("generated_at", { ascending: false });
      if (type) query = query.eq("type", type);
      if (keywordId) query = query.eq("keyword_id", keywordId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
