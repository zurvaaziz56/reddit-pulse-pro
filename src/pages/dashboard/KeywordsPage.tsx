import KeywordsPanel from "@/components/dashboard/KeywordsPanel";

const KeywordsPage = () => (
  <div className="max-w-3xl">
    <h1 className="text-2xl font-bold mb-1">Keywords</h1>
    <p className="text-muted-foreground text-sm mb-8">Manage your tracked keywords</p>
    <KeywordsPanel />
  </div>
);

export default KeywordsPage;
