import InsightList from "./InsightList";
export default function PainPointsPanel({ keywordId }: { keywordId?: string }) { return <InsightList type="pain_point" title="Pain Points" keywordId={keywordId}/>; }
