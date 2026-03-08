

# Phase 7: Stripe Billing Integration

Stripe is enabled and three subscription products have been created:

| Plan | Product ID | Price ID | Monthly |
|------|-----------|----------|---------|
| Starter | prod_U734C5235S8I6z | price_1T8oy2BmkVHgnBP58AR4X3ey | $19 |
| Pro | prod_U737H3gpSP3wsa | price_1T8p0yBmkVHgnBP5kWEdBG90 | $49 |
| Agency | prod_U737EsyAsaBfJ0 | price_1T8p1YBmkVHgnBP5YmdqWwJx | $149 |

## What will be built

### 1. Three Edge Functions

- **`create-checkout`** — Accepts a `priceId`, creates a Stripe Checkout session in subscription mode, redirects user to Stripe
- **`check-subscription`** — Looks up user's Stripe customer by email, checks for active subscription, maps product ID to plan name (starter/pro/agency), syncs plan to `profiles` table
- **`customer-portal`** — Creates a Stripe billing portal session so users can manage/cancel subscriptions

All three will have `verify_jwt = false` in `config.toml` and validate auth in code.

### 2. AuthContext Update

Add subscription state (`plan`, `subscribed`, `subscriptionEnd`) to the global auth context. Call `check-subscription` on login and periodically (every 60s). This ensures keyword limits are enforced based on the real Stripe subscription.

### 3. Settings Page — Billing Section

Add upgrade/manage buttons to the existing Settings page:
- If not subscribed or on starter: show "Upgrade" buttons for Pro and Agency
- If subscribed: show "Manage Subscription" button that opens Stripe Customer Portal
- Display current plan, price, and subscription end date

### 4. Landing Page Pricing Section

Wire the pricing CTA buttons to invoke `create-checkout` with the correct `priceId` (for logged-in users) or redirect to signup (for guests).

### 5. Plan Enforcement

The `check-subscription` function syncs the plan to the `profiles` table, so the existing keyword limit logic in `KeywordsPanel.tsx` will automatically enforce the correct limits.

## Technical Details

- Product-to-plan mapping hardcoded in `check-subscription` and a shared `STRIPE_TIERS` const on the frontend
- No webhooks needed — subscription status is checked on demand
- `config.toml` updated with three new function entries

