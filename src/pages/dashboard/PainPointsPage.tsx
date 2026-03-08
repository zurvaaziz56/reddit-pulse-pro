import PainPointsPanel from "@/components/dashboard/PainPointsPanel";

const PainPointsPage = () => (
  <div className="max-w-3xl">
    <h1 className="text-2xl font-bold mb-1">Pain Points</h1>
    <p className="text-muted-foreground text-sm mb-8">Customer frustrations detected across Reddit</p>
    <PainPointsPanel />
  </div>
);

export default PainPointsPage;
