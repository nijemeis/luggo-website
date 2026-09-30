import Stripe from "stripe";

export function stripeEnabled(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3020").replace(/\/$/, "");
}
