import type {
  PaymentMethodCreateParams,
  Stripe,
  StripeElements,
} from "@stripe/stripe-js";
import { checkoutConfig } from "@/lib/checkout-config";
import {
  type CheckoutContact,
  splitCheckoutName,
} from "@/lib/checkout-contact";

export type CheckoutBilling = {
  email: string;
  name: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
};

type IntentResponse = {
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
};

type VoidResponse = CheckoutContact & {
  name?: string;
  ok?: boolean;
  error?: string;
};

function paymentMethodBilling(
  billing: CheckoutBilling,
): PaymentMethodCreateParams.BillingDetails {
  const city = billing.address.city;
  return {
    email: billing.email,
    name: billing.name,
    phone: billing.phone,
    address: {
      line1: billing.address.line1,
      line2: billing.address.line2 ?? "",
      city,
      state: billing.address.state || city,
      postal_code: billing.address.postal_code,
      country: billing.address.country,
    },
  };
}

export class PaymentValidationError extends Error {
  override name = "PaymentValidationError";

  constructor() {
    super("Payment details are incomplete.");
  }
}

export async function validatePaymentElement(elements: StripeElements) {
  const { error } = await elements.submit();
  if (!error) {
    return;
  }
  if (error.type === "validation_error") {
    throw new PaymentValidationError();
  }
  throw new Error(error.message ?? "Payment details are incomplete.");
}

export async function confirmAndVoidPayment(options: {
  stripe: Stripe;
  elements: StripeElements;
  amountCents: number;
  returnUrl: string;
  billing: CheckoutBilling;
}): Promise<CheckoutContact> {
  await validatePaymentElement(options.elements);

  const intentResponse = await fetch("/api/checkout/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amountCents: options.amountCents,
      currency: checkoutConfig.currency.toLowerCase(),
      email: options.billing.email,
      name: options.billing.name,
      phone: options.billing.phone,
    }),
  });
  const intent = (await intentResponse.json()) as IntentResponse;

  if (!intentResponse.ok || !intent.clientSecret || !intent.paymentIntentId) {
    throw new Error(intent.error ?? "Could not start payment.");
  }

  const { error: confirmError } = await options.stripe.confirmPayment({
    elements: options.elements,
    clientSecret: intent.clientSecret,
    confirmParams: {
      return_url: options.returnUrl,
      receipt_email: options.billing.email,
      payment_method_data: {
        billing_details: paymentMethodBilling(options.billing),
      },
    },
    redirect: "if_required",
  });

  if (confirmError) {
    throw new Error(confirmError.message ?? "Payment was not completed.");
  }

  return voidPayment(intent.paymentIntentId, options.billing);
}

export async function voidPayment(
  paymentIntentId: string,
  fallback?: Partial<CheckoutBilling>,
): Promise<CheckoutContact> {
  const response = await fetch("/api/checkout/void", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paymentIntentId }),
  });
  const data = (await response.json()) as VoidResponse;
  if (!response.ok) {
    throw new Error(data.error ?? "Could not cancel the authorization.");
  }

  const names = splitCheckoutName(data.name || fallback?.name || "");
  return {
    firstName: data.firstName || names.firstName,
    lastName: data.lastName || names.lastName,
    email: data.email || fallback?.email || "",
    phone: data.phone || fallback?.phone || "",
  };
}
