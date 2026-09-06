import { useInsights } from "@/hooks/use-dashboard-data";
export default function InsightList({ type, title, keywordId }: { type: "trend" | "pain_point" | "opportunity" | "content_idea"; title: string; keywordId?: string }) {
  const { data = [], isLoading, error, refetch } = useInsights(type, keywordId);
  return <section className="space-y-4"><h2 className="text-xl font-bold">{title}</h2>
    {isLoading ? <p role="status">Loading…</p> : error ? <div role="alert">Could not load insights. <button onClick={() => refetch()} className="underline">Try again</button></div> : !data.length ? <p className="text-muted-foreground text-sm">No insights yet. Fetch posts and generate insights from the dashboard.</p> : data.map(item => <article key={item.id} className="p-5 border rounded-xl space-y-3">
      <p>{item.content}</p><p className="text-xs text-muted-foreground">{item.keywords?.keyword} · {new Date(item.generated_at).toLocaleString()}</p>
      <div className="flex flex-wrap gap-3">{item.source_urls?.map((url, i) => /^https:\/\/(www\.)?reddit\.com\/r\//.test(url) && <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Source {i + 1}</a>)}</div>
    </article>)}
  </section>;
}
