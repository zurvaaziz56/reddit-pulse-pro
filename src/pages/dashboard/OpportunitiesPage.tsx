import OpportunitiesPanel from "@/components/dashboard/OpportunitiesPanel";

const OpportunitiesPage = () => (
  <div className="max-w-3xl">
    <h1 className="text-2xl font-bold mb-1">Opportunities</h1>
    <p className="text-muted-foreground text-sm mb-8">Market opportunities scored by potential</p>
    <OpportunitiesPanel />
  </div>
);

export default OpportunitiesPage;
