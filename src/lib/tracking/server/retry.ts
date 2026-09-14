import { logTrackingIssue, trackingErrorMessage } from "@/lib/tracking/log";

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
      if (attempt < 3) {
        await sleep(100 * 2 ** attempt);
      }
    }
  }

  throw lastError;
}

function statusFromError(error: unknown) {
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
