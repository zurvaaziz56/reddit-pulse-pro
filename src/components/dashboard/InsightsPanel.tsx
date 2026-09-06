import InsightList from "./InsightList";
export default function InsightsPanel({ keywordId }: { keywordId?: string }) { return <InsightList type="trend" title="AI Insights" keywordId={keywordId}/>; }
