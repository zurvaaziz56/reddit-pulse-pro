import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, CreditCard, Shield } from "lucide-react";

const PLAN_DETAILS: Record<string, { name: string; keywords: number; price: string }> = {
  starter: { name: "Starter", keywords: 3, price: "$19/mo" },
  pro: { name: "Pro", keywords: 10, price: "$49/mo" },
  agency: { name: "Agency", keywords: 50, price: "$149/mo" },
};

const SettingsPage = () => {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ["keywords", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("keywords").select("id");
      return data ?? [];
    },
    enabled: !!user,
  });

  const plan = PLAN_DETAILS[profile?.plan ?? "starter"] ?? PLAN_DETAILS.starter;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your account</p>
      </div>

      {/* Profile */}
      <div className="p-6 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Display Name</span>
            <span>{profile?.display_name ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member Since</span>
            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="p-6 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Subscription</h2>
        </div>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Plan</span>
            <span className="font-medium text-primary">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>{plan.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords Used</span>
            <span>{keywords.length} / {plan.keywords}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
