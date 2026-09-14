import { describe, expect, test } from "bun:test";
import {
  isRetryableProviderError,
  RetryableProviderError,
} from "@/lib/tracking/server/retry";

describe("provider retries", () => {
  test("retries 5xx and 429, not other 4xx", () => {
    expect(
      isRetryableProviderError(
        new RetryableProviderError("Meta CAPI request failed (500).", {
          retryable: true,
          status: 500,
        }),
      ),
    ).toBe(true);
    expect(
      isRetryableProviderError(
        new RetryableProviderError("Meta CAPI request failed (429).", {
          retryable: true,
          status: 429,
        }),
      ),
    ).toBe(true);
    expect(
      isRetryableProviderError(
        new RetryableProviderError("Meta CAPI request failed (400).", {
          retryable: false,
          status: 400,
        }),
      ),
    ).toBe(false);
    expect(
      isRetryableProviderError(new Error("GA4 request failed (400).")),
    ).toBe(false);
    expect(isRetryableProviderError(new Error("network down"))).toBe(true);
  });
});
