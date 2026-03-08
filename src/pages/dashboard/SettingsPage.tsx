import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { User, CreditCard, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user, plan, subscribed, subscriptionEnd, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

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

  const tier = STRIPE_TIERS[plan] ?? STRIPE_TIERS.starter;

  const handleCheckout = async (priceId: string, planKey: string) => {
    setCheckoutLoading(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Portal error", description: err.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

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
            <span className="font-medium text-primary">{tier.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span>{tier.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords Used</span>
            <span>{keywords.length} / {tier.keywords}</span>
          </div>
          {subscriptionEnd && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Renews On</span>
              <span>{new Date(subscriptionEnd).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-wrap gap-3">
          {subscribed ? (
            <Button variant="hero-outline" onClick={handlePortal} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
              Manage Subscription
            </Button>
          ) : (
            <>
              {plan !== "pro" && (
                <Button variant="hero" onClick={() => handleCheckout(STRIPE_TIERS.pro.price_id, "pro")} disabled={!!checkoutLoading}>
                  {checkoutLoading === "pro" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Upgrade to Pro — $49/mo
                </Button>
              )}
              {plan !== "agency" && (
                <Button variant="hero-outline" onClick={() => handleCheckout(STRIPE_TIERS.agency.price_id, "agency")} disabled={!!checkoutLoading}>
                  {checkoutLoading === "agency" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Upgrade to Agency — $149/mo
                </Button>
              )}
            </>
          )}
          <Button variant="ghost" size="sm" onClick={refreshSubscription} className="ml-auto text-xs text-muted-foreground">
            Refresh status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
