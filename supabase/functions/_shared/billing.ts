import Stripe from "https://esm.sh/stripe@18.5.0?target=denonext";
import { HttpError, required } from "./http.ts";
export function stripeClient() {
  if (Deno.env.get("ENABLE_BILLING") !== "true") throw new HttpError(503, "Payments are not enabled for this preview.");
  return new Stripe(required("STRIPE_SECRET_KEY"), { apiVersion: "2025-08-27.basil" });
}
export function appUrl() {
  const url = new URL(required("APP_URL"));
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") throw new HttpError(503, "Invalid app URL configuration.");
  return url.origin;
}
export const prices: Record<string, string> = {
  starter: "price_1T8oy2BmkVHgnBP58AR4X3ey", pro: "price_1T8p0yBmkVHgnBP5kWEdBG90", agency: "price_1T8p1YBmkVHgnBP5YmdqWwJx"
};
