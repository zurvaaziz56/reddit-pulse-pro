import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all keywords
    const { data: keywords, error: kwErr } = await supabase.from("keywords").select("id, keyword");
    if (kwErr) throw kwErr;
    if (!keywords?.length) {
      return new Response(JSON.stringify({ message: "No keywords to fetch" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalInserted = 0;

    for (const kw of keywords) {
      try {
        const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(kw.keyword)}&sort=new&t=day&limit=25`;
        const resp = await fetch(url, {
          headers: { "User-Agent": "RedditTrendRadar/1.0" },
        });

        if (!resp.ok) {
          console.error(`Reddit API error for "${kw.keyword}": ${resp.status}`);
          continue;
        }

        const json = await resp.json();
        const posts = json?.data?.children ?? [];

        for (const item of posts) {
          const post = item.data;
          const { error: insertErr } = await supabase.from("reddit_posts").upsert(
            {
              post_id: post.id,
              title: post.title,
              subreddit: post.subreddit_name_prefixed || `r/${post.subreddit}`,
              author: post.author,
              score: post.score,
              num_comments: post.num_comments,
              url: `https://reddit.com${post.permalink}`,
              created_utc: new Date(post.created_utc * 1000).toISOString(),
              keyword_id: kw.id,
            },
            { onConflict: "post_id" }
          );

          if (!insertErr) totalInserted++;
        }

        // Rate limit: wait 1s between keyword fetches
        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) {
        console.error(`Error fetching "${kw.keyword}":`, e);
      }
    }

    return new Response(JSON.stringify({ message: `Fetched ${totalInserted} posts for ${keywords.length} keywords` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-reddit error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
