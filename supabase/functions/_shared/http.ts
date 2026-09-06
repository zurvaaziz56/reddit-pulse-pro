import { createClient } from "npm:@supabase/supabase-js@2.98.0";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
export function endpoint(handler: (req: Request) => Promise<Response>) {
  return async (req: Request) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    try { return await handler(req); }
    catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error("Request failed", error instanceof Error ? error.name : "Unknown error");
      return json({ error: "The request could not be completed. Please try again." }, 500);
    }
  };
}
export function required(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(503, `Server configuration missing: ${name}`);
  return value;
}
export async function authenticate(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new HttpError(401, "Please sign in again.");
  const db = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const { data, error } = await db.auth.getUser(header.slice(7));
  if (error || !data.user) throw new HttpError(401, "Please sign in again.");
  return { db, user: data.user };
}
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch { throw new HttpError(400, "Invalid request body."); }
}
export async function keywordContext(req: Request, action: "fetch" | "insights") {
  const { db, user } = await authenticate(req);
  const body = await readBody(req);
  if (typeof body.keywordId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.keywordId)) throw new HttpError(400, "Select a keyword first.");
  const { data: keyword, error } = await db.from("keywords").select("id, keyword").eq("id", body.keywordId).eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  if (!keyword) throw new HttpError(404, "Keyword not found.");
  const { data: allowed, error: limitError } = await db.rpc("claim_processing_run", { owner_id: user.id, run_action: action });
  if (limitError) throw limitError;
  if (!allowed) throw new HttpError(429, "Please wait a minute between runs. Each account can run each action 30 times per day.");
  return { db, user, keyword };
}
