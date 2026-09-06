import { endpoint, json, keywordContext } from "../_shared/http.ts";
import { normalizePosts, searchReddit } from "../_shared/reddit.ts";

export const handler = endpoint(async (req) => {
  const { db, keyword } = await keywordContext(req, "fetch");
  const posts = normalizePosts(await searchReddit(keyword.keyword), keyword.id);
  if (posts.length) {
    const { error } = await db.from("reddit_posts").upsert(posts, { onConflict: "keyword_id,post_id" });
    if (error) throw error;
  }
  return json({ count: posts.length, message: posts.length ? `Saved ${posts.length} posts for “${keyword.keyword}”.` : "No matching posts found in the past month. Try a broader keyword." });
});
if (import.meta.main) Deno.serve(handler);
