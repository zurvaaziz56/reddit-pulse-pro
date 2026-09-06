// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
let db: PGlite;
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const keywordA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const keywordB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY, email text, raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO authenticated, anon, service_role;`);
  for (const file of ["20260308211407_c4c5f3e6-a2f5-49df-b484-4e408f1b0e06.sql", "20260308211839_1ccb46f1-190e-4d3c-b2d7-f9ab0968b74b.sql"])
    await db.exec(readFileSync(resolve("supabase/migrations", file), "utf8"));
  await db.exec("GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;");
  await db.exec(readFileSync(resolve("supabase/migrations/20260906030000_functional_preview.sql"), "utf8"));
  await db.exec(`INSERT INTO auth.users(id,email) VALUES ('${alice}','a@example.test'),('${bob}','b@example.test');
    INSERT INTO keywords(id,user_id,keyword) VALUES ('${keywordA}','${alice}','planning'),('${keywordB}','${bob}','planning');`);
}, 30000);
afterAll(async () => { await db.close(); });
async function asAlice(sql: string) {
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '${alice}';`);
  try { return await db.query(sql); } finally { await db.exec("RESET ROLE;"); }
}
describe("database boundaries", () => {
  it("prevents owners from upgrading their own billing plan", async () => {
    await expect(asAlice(`UPDATE profiles SET plan='agency' WHERE user_id='${alice}'`)).rejects.toThrow(/permission denied/);
    await asAlice(`UPDATE profiles SET display_name='Alice' WHERE user_id='${alice}'`);
  });
  it("rejects duplicates and enforces server quotas", async () => {
    await expect(asAlice(`INSERT INTO keywords(user_id,keyword) VALUES ('${alice}',' PLANNING ')`)).rejects.toThrow(/already tracked/);
    await asAlice(`INSERT INTO keywords(user_id,keyword) VALUES ('${alice}','one'),('${alice}','two')`);
    await expect(asAlice(`INSERT INTO keywords(user_id,keyword) VALUES ('${alice}','four')`)).rejects.toThrow(/limit/);
  });
  it("keeps the same Reddit post independent for two owners and enforces RLS", async () => {
    await db.exec(`INSERT INTO reddit_posts(post_id,title,subreddit,url,created_utc,keyword_id) VALUES
      ('shared','A title','r/test','https://reddit.com/r/test',now(),'${keywordA}'),
      ('shared','B title','r/test','https://reddit.com/r/test',now(),'${keywordB}')
      ON CONFLICT(keyword_id,post_id) DO UPDATE SET title=excluded.title;`);
    const result = await asAlice("SELECT title FROM reddit_posts");
    expect(result.rows).toEqual([{ title: "A title" }]);
    await expect(asAlice(`INSERT INTO keywords(user_id,keyword) VALUES ('${bob}','stolen')`)).rejects.toThrow();
  });
  it("preserves previous insights if replacement fails", async () => {
    await db.exec(`INSERT INTO insights(keyword_id,type,content) VALUES ('${keywordA}','trend','Keep me')`);
    await expect(db.query("SELECT replace_keyword_insights($1,$2)", [keywordA, JSON.stringify([{ type: "invalid", content: "bad", source_urls: [] }])])).rejects.toThrow();
    expect((await db.query("SELECT content FROM insights WHERE keyword_id=$1", [keywordA])).rows).toEqual([{ content: "Keep me" }]);
    await db.query("SELECT replace_keyword_insights($1,$2)", [keywordA, JSON.stringify([{ type: "trend", content: "New finding", source_urls: ["https://reddit.com/r/test"] }])]);
    expect((await db.query("SELECT content FROM insights WHERE keyword_id=$1", [keywordA])).rows).toEqual([{ content: "New finding" }]);
  });
  it("restricts processing RPCs and applies cooldown plus daily cap", async () => {
    await expect(asAlice(`SELECT claim_processing_run('${alice}','fetch')`)).rejects.toThrow(/permission denied/);
    await expect(asAlice(`SELECT replace_keyword_insights('${keywordB}','[]')`)).rejects.toThrow(/permission denied/);
    expect((await db.query("SELECT claim_processing_run($1,'fetch') AS allowed", [alice])).rows).toEqual([{ allowed: true }]);
    expect((await db.query("SELECT claim_processing_run($1,'fetch') AS allowed", [alice])).rows).toEqual([{ allowed: false }]);
    await db.exec(`UPDATE processing_limits SET next_run_at=now()-interval '1 minute',runs=30`);
    expect((await db.query("SELECT claim_processing_run($1,'fetch') AS allowed", [alice])).rows).toEqual([{ allowed: false }]);
    await db.exec(`UPDATE processing_limits SET usage_day=current_date-1`);
    expect((await db.query("SELECT claim_processing_run($1,'fetch') AS allowed", [alice])).rows).toEqual([{ allowed: true }]);
  });
});
