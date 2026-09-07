import Stripe from "stripe";

/** Fake-door wallets only run with test keys. Live keys are refused. */
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key.startsWith("sk_test_")) {
    return null;
  }
  return new Stripe(key);
}
