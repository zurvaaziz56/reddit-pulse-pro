import { authenticate, endpoint, json } from "../_shared/http.ts";
import { stripeClient, prices } from "../_shared/billing.ts";
export const handler = endpoint(async req => {
  const { db, user } = await authenticate(req);
  let plan = "starter";
  let subscribed = false;
  let subscription_end: string | null = null;
  if (Deno.env.get("ENABLE_BILLING") === "true" && user.email) {
    const stripe = stripeClient();
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data[0]) {
      const subscriptions = await stripe.subscriptions.list({ customer: customers.data[0].id, status: "active", limit: 100 });
      for (const subscription of subscriptions.data) {
        const item = subscription.items.data[0];
        const match = Object.entries(prices).find(([, id]) => id === item?.price.id);
        if (match) { plan = match[0]; subscribed = true; subscription_end = new Date(item.current_period_end * 1000).toISOString(); break; }
      }
    }
  }
  const { error } = await db.from("profiles").update({ plan }).eq("user_id", user.id);
  if (error) throw error;
  return json({ plan, subscribed, subscription_end });
});
if (import.meta.main) Deno.serve(handler);
