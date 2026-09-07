import { loadStripe } from "@stripe/stripe-js";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const stripePublishableKey = publishableKey.startsWith("pk_test_")
  ? publishableKey
  : "";

export const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey, {
      developerTools: {
        assistant: { enabled: false },
      },
    })
  : null;
