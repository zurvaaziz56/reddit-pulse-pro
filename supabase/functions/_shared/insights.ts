import { HttpError } from "./http.ts";
export const insightTypes = ["trend", "pain_point", "opportunity", "content_idea"] as const;
export type Insight = { type: typeof insightTypes[number]; content: string; source_ids: string[] };
export function validateInsights(value: unknown, posts: { post_id: string; url: string }[]) {
  const items = (value as { insights?: Insight[] })?.insights;
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) throw new HttpError(502, "AI returned an invalid report. Your previous insights are unchanged.");
  const sources = new Map(posts.map(p => [p.post_id, p.url]));
  return items.map(item => {
    if (!item || !insightTypes.includes(item.type) || typeof item.content !== "string" || !item.content.trim() || item.content.length > 2000 || !Array.isArray(item.source_ids) || !item.source_ids.length || item.source_ids.some(id => !sources.has(id))) throw new HttpError(502, "AI returned unsupported findings. Your previous insights are unchanged.");
    return { type: item.type, content: item.content.trim(), source_urls: [...new Set(item.source_ids.map(id => sources.get(id)!))] };
  });
}
