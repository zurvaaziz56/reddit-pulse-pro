import InsightsPanel from "@/components/dashboard/InsightsPanel";

const InsightsPage = () => (
  <div className="max-w-3xl">
    <h1 className="text-2xl font-bold mb-1">AI Insights</h1>
    <p className="text-muted-foreground text-sm mb-8">AI-generated analysis from Reddit discussions</p>
    <InsightsPanel />
  </div>
);

export default InsightsPage;
