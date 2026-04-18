import Stripe from "stripe";

let client;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY must be set");
    client = new Stripe(key, { apiVersion: "2024-06-20" });
  }
  return client;
}
