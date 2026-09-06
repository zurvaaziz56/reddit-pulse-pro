import InsightList from "./InsightList";
export default function OpportunitiesPanel({ keywordId }: { keywordId?: string }) { return <InsightList type="opportunity" title="Opportunities" keywordId={keywordId}/>; }
