import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";

export class RetryableProviderError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(
    message: string,
    options: { retryable: boolean; status?: number },
  ) {
    super(message);
    this.name = "RetryableProviderError";
    this.retryable = options.retryable;
    this.status = options.status;
  }
}

export async function withProviderRetry(
  provider: "posthog" | "meta" | "ga4",
  eventName: string,
  eventId: string,
  task: () => Promise<void>,
) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await task();
      return;
    } catch (error) {
      lastError = error;
      logTrackingIssue({
        provider,
        eventName,
        eventId,
        attempt,
        reason: trackingErrorMessage(error),
        status: statusFromError(error),
      });
      if (!isRetryableProviderError(error) || attempt === 3) {
        throw error;
      }
      await sleep(100 * 2 ** attempt);
    }
  }

  throw lastError;
}

export function isRetryableProviderError(error: unknown) {
  if (error instanceof RetryableProviderError) {
    return error.retryable;
  }

  const status = Number(statusFromError(error));
  if (!Number.isFinite(status)) {
    return true;
  }
  return status === 408 || status === 429 || status >= 500;
}

function statusFromError(error: unknown) {
  if (error instanceof RetryableProviderError && error.status) {
    return error.status;
  }
  if (error instanceof Error) {
    const match = error.message.match(/\((\d{3})\)/);
    return match?.[1] ?? "error";
  }
  return "error";
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
