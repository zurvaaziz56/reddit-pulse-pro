import { authenticate, endpoint, HttpError, json } from "../_shared/http.ts";
import { stripeClient, appUrl } from "../_shared/billing.ts";
export const handler = endpoint(async req => {
  const { user } = await authenticate(req);
  const stripe = stripeClient();
  if (!user.email) throw new HttpError(400, "An email is required.");
  const customers = await stripe.customers.list({ email: user.email, limit: 1 });
  if (!customers.data[0]) throw new HttpError(404, "No billing account found.");
  return json({ url: (await stripe.billingPortal.sessions.create({ customer: customers.data[0].id, return_url: `${appUrl()}/dashboard/settings` })).url });
});
if (import.meta.main) Deno.serve(handler);
