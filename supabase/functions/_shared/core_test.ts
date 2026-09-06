import { deepStrictEqual, rejects, throws } from "node:assert/strict";
import { endpoint, authenticate, json } from "./http.ts";
import { normalizePosts, searchReddit } from "./reddit.ts";
import { validateInsights } from "./insights.ts";
Deno.test("reject unauthenticated calls before any database or network access", async () => {
  const handler = endpoint(async req => { await authenticate(req); return json({ ok: true }); });
  const response = await handler(new Request("http://localhost", { method: "POST" }));
  deepStrictEqual(response.status, 401);
  deepStrictEqual((await handler(new Request("http://localhost"))).status, 405);
});
Deno.test("Reddit 403 and rate limiting cannot become successful empty results", async () => {
  Deno.env.delete("REDDIT_CLIENT_ID"); Deno.env.delete("REDDIT_CLIENT_SECRET");
  await rejects(() => searchReddit("test", (() => Promise.resolve(new Response(null, { status: 403 }))) as typeof fetch), /blocked/);
  await rejects(() => searchReddit("test", (() => Promise.resolve(new Response(null, { status: 429 }))) as typeof fetch), /rate-limiting/);
});
Deno.test("normalization retains body, keyword ownership and canonical links", () => {
  const rows = normalizePosts({ data: { children: [{ data: { id: "abc", title: "A question", selftext: "Detailed problem", subreddit: "test", permalink: "/r/test/comments/abc/title/", created_utc: 1700000000 } }] } }, "keyword-a");
  deepStrictEqual(rows[0].body, "Detailed problem"); deepStrictEqual(rows[0].keyword_id, "keyword-a");
  deepStrictEqual(rows[0].url, "https://www.reddit.com/r/test/comments/abc/title/");
  throws(() => normalizePosts({}, "a"), /unexpected/);
});
Deno.test("AI findings require actual source IDs and valid categories", () => {
  const posts = [{ post_id: "abc", url: "https://www.reddit.com/r/test/comments/abc" }];
  const valid = { insights: [{ type: "trend", content: "A finding", source_ids: ["abc"] }] };
  deepStrictEqual(validateInsights(valid, posts)[0].source_urls, [posts[0].url]);
  throws(() => validateInsights({ insights: [{ ...valid.insights[0], source_ids: ["invented"] }] }, posts), /unsupported/);
  throws(() => validateInsights({ insights: [] }, posts), /invalid/);
});

Deno.test("fetch handler scopes the query and upsert to the authenticated owner", async () => {
  const { handler } = await import("../fetch-reddit/index.ts");
  Deno.env.set("SUPABASE_URL", "http://localhost:54321"); Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-service-key");
  const original = globalThis.fetch;
  const keywordId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  let saved = false;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.pathname === "/auth/v1/user") return json({ id: "owner-a", email: "test@example.test" });
    if (url.pathname === "/rest/v1/keywords") {
      deepStrictEqual(url.searchParams.get("user_id"), "eq.owner-a");
      deepStrictEqual(url.searchParams.get("id"), `eq.${keywordId}`);
      return json({ id: keywordId, keyword: "planning" });
    }
    if (url.pathname === "/rest/v1/rpc/claim_processing_run") return json(true);
    if (url.hostname === "www.reddit.com") return json({ data: { children: [{ data: { id: "abc", title: "Question", selftext: "A problem", subreddit: "test", permalink: "/r/test/comments/abc", created_utc: 1700000000 } }] } });
    if (url.pathname === "/rest/v1/reddit_posts") {
      deepStrictEqual(url.searchParams.get("on_conflict"), "keyword_id,post_id");
      deepStrictEqual(JSON.parse(String(init?.body))[0].keyword_id, keywordId);
      saved = true; return new Response(null, { status: 201 });
    }
    throw new Error(`Unexpected request: ${url.pathname}`);
  }) as typeof fetch;
  try {
    const response = await handler(new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer test-user" }, body: JSON.stringify({ keywordId }) }));
    deepStrictEqual(response.status, 200); deepStrictEqual((await response.json()).count, 1); deepStrictEqual(saved, true);
  } finally { globalThis.fetch = original; }
});
Deno.test("another owner's keyword is rejected before Reddit is contacted", async () => {
  const { handler } = await import("../fetch-reddit/index.ts");
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    if (url.pathname === "/auth/v1/user") return json({ id: "owner-a" });
    if (url.pathname === "/rest/v1/keywords") return json(null);
    throw new Error("Should not access any other endpoint");
  }) as typeof fetch;
  try {
    const response = await handler(new Request("http://localhost", { method: "POST", headers: { Authorization: "Bearer test-user" }, body: JSON.stringify({ keywordId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" }) }));
    deepStrictEqual(response.status, 404);
  } finally { globalThis.fetch = original; }
});
