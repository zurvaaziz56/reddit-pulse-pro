import { authenticate, endpoint, HttpError, json, readBody } from "../_shared/http.ts";
import { stripeClient, appUrl, prices } from "../_shared/billing.ts";
export const handler = endpoint(async req => {
  const { user } = await authenticate(req);
  const stripe = stripeClient();
  const { priceId } = await readBody(req);
  if (typeof priceId !== "string" || !Object.values(prices).includes(priceId)) throw new HttpError(400, "Unknown price.");
  if (!user.email) throw new HttpError(400, "An email is required.");
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  const customer = customers.data[0];
  if (customer) {
    const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: "all", limit: 100 });
    if (subscriptions.data.some((s: { status: string }) => ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(s.status))) throw new HttpError(409, "Manage your existing subscription from Settings.");
  }
  const session = await stripe.checkout.sessions.create({ customer: customer?.id, customer_email: customer ? undefined : user.email, client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }], mode: "subscription", success_url: `${appUrl()}/dashboard/settings`, cancel_url: `${appUrl()}/dashboard/settings` },
    { idempotencyKey: `${user.id}:${priceId}:${Math.floor(Date.now() / 300000)}` });
  return json({ url: session.url });
});
if (import.meta.main) Deno.serve(handler);
