import { HttpError } from "./http.ts";

type RedditPost = { id: string; title: string; subreddit: string; permalink: string; selftext?: string; author?: string; score?: number; num_comments?: number; created_utc: number };
export function normalizePosts(payload: unknown, keywordId: string) {
  const children = (payload as { data?: { children?: { data: RedditPost }[] } })?.data?.children;
  if (!Array.isArray(children)) throw new HttpError(502, "Reddit returned an unexpected response.");
  return children.flatMap(({ data: post }) => {
    if (!post || typeof post.id !== "string" || typeof post.title !== "string" || typeof post.subreddit !== "string" || typeof post.permalink !== "string" || !post.permalink.startsWith("/r/") || !Number.isFinite(post.created_utc)) return [];
    const date = new Date(post.created_utc * 1000);
    if (!Number.isFinite(date.getTime())) return [];
    return [{ post_id: post.id, keyword_id: keywordId, title: post.title.slice(0, 1000), subreddit: `r/${post.subreddit}`, author: post.author || null,
      body: (post.selftext || "").slice(0, 6000), score: Math.trunc(post.score || 0), num_comments: Math.trunc(post.num_comments || 0),
      url: `https://www.reddit.com${post.permalink}`, created_utc: date.toISOString(), fetched_at: new Date().toISOString() }];
  });
}
export async function searchReddit(keyword: string, fetcher: typeof fetch = fetch) {
  const headers: Record<string, string> = { "User-Agent": Deno.env.get("REDDIT_USER_AGENT") || "RedditTrendRadar/1.0" };
  const clientId = Deno.env.get("REDDIT_CLIENT_ID");
  const secret = Deno.env.get("REDDIT_CLIENT_SECRET");
  let base = "https://www.reddit.com/search.json";
  if (clientId && secret) {
    const auth = await fetcher("https://www.reddit.com/api/v1/access_token", { method: "POST", headers: { ...headers, Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", signal: AbortSignal.timeout(15000) });
    if (!auth.ok) throw new HttpError(502, "Reddit authentication failed. Check the server's Reddit credentials.");
    const token = await auth.json();
    if (!token.access_token) throw new HttpError(502, "Reddit did not return an access token.");
    headers.Authorization = `Bearer ${token.access_token}`;
    base = "https://oauth.reddit.com/search";
  }
  const query = new URLSearchParams({ q: keyword, sort: "new", t: "month", limit: "25", type: "link", raw_json: "1" });
  let response: Response;
  try { response = await fetcher(`${base}?${query}`, { headers, signal: AbortSignal.timeout(20000) }); }
  catch { throw new HttpError(504, "Reddit did not respond in time. Please try again later."); }
  if (response.status === 403 || response.status === 401) throw new HttpError(502, "Reddit blocked this request. The server needs working Reddit API access before posts can be fetched.");
  if (response.status === 429) throw new HttpError(503, "Reddit is rate-limiting requests. Please try again later.");
  if (!response.ok) throw new HttpError(502, `Reddit search failed (${response.status}). Please try again later.`);
  return response.json();
}
