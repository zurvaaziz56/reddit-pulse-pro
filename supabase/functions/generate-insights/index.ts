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
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all keywords
    const { data: keywords, error: kwErr } = await supabase.from("keywords").select("id, keyword");
    if (kwErr) throw kwErr;
    if (!keywords?.length) {
      return new Response(JSON.stringify({ message: "No keywords" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalInsights = 0;

    for (const kw of keywords) {
      // Get recent posts for this keyword
      const { data: posts } = await supabase
        .from("reddit_posts")
        .select("title, subreddit, score, num_comments")
        .eq("keyword_id", kw.id)
        .order("score", { ascending: false })
        .limit(30);

      if (!posts?.length) continue;

      const postSummary = posts
        .map((p) => `- "${p.title}" (${p.subreddit}, ${p.score} upvotes, ${p.num_comments} comments)`)
        .join("\n");

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a market research analyst. Analyze Reddit posts about a specific keyword and extract actionable insights. Be concise and specific.`,
            },
            {
              role: "user",
              content: `Analyze these Reddit posts about "${kw.keyword}":\n\n${postSummary}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "save_insights",
                description: "Save the extracted insights from Reddit analysis",
                parameters: {
                  type: "object",
                  properties: {
                    trends: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 top trends observed",
                    },
                    pain_points: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 customer pain points or frustrations",
                    },
                    opportunities: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 product/business opportunities",
                    },
                    content_ideas: {
                      type: "array",
                      items: { type: "string" },
                      description: "3-5 content ideas based on discussions",
                    },
                  },
                  required: ["trends", "pain_points", "opportunities", "content_ideas"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "save_insights" } },
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error(`AI error for "${kw.keyword}": ${aiResp.status} ${errText}`);
        continue;
      }

      const aiJson = await aiResp.json();
      const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        console.error(`No tool call for "${kw.keyword}"`);
        continue;
      }

      const args = JSON.parse(toolCall.function.arguments);

      // Delete old insights for this keyword
      await supabase.from("insights").delete().eq("keyword_id", kw.id);

      // Insert new insights
      const insightRows = [
        ...args.trends.map((c: string) => ({ keyword_id: kw.id, type: "trend" as const, content: c })),
        ...args.pain_points.map((c: string) => ({ keyword_id: kw.id, type: "pain_point" as const, content: c })),
        ...args.opportunities.map((c: string) => ({ keyword_id: kw.id, type: "opportunity" as const, content: c })),
        ...args.content_ideas.map((c: string) => ({ keyword_id: kw.id, type: "content_idea" as const, content: c })),
      ];

      const { error: insertErr } = await supabase.from("insights").insert(insightRows);
      if (insertErr) {
        console.error(`Insert error for "${kw.keyword}":`, insertErr);
      } else {
        totalInsights += insightRows.length;
      }
    }

    return new Response(JSON.stringify({ message: `Generated ${totalInsights} insights` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-insights error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
