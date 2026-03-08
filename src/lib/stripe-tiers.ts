export const STRIPE_TIERS = {
  starter: {
    name: "Starter",
    price: "$19/mo",
    keywords: 3,
    price_id: "price_1T8oy2BmkVHgnBP58AR4X3ey",
    product_id: "prod_U734C5235S8I6z",
  },
  pro: {
    name: "Pro",
    price: "$49/mo",
    keywords: 10,
    price_id: "price_1T8p0yBmkVHgnBP5kWEdBG90",
    product_id: "prod_U737H3gpSP3wsa",
  },
  agency: {
    name: "Agency",
    price: "$149/mo",
    keywords: 50,
    price_id: "price_1T8p1YBmkVHgnBP5YmdqWwJx",
    product_id: "prod_U737EsyAsaBfJ0",
  },
} as const;

export type PlanKey = keyof typeof STRIPE_TIERS;
