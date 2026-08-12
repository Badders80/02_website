// FIX: audit C3/C5 — server-side PostHog for API routes and server components
// Separate from posthog-client.ts — never import this in client code

import { PostHog as PostHogNode } from "posthog-node";

let _client: PostHogNode | null = null;

function getClient(): PostHogNode | null {
  if (_client) return _client;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !process.env.POSTHOG_PERSONAL_API_KEY) {
    return null; // graceful no-op if not configured
  }
  _client = new PostHogNode(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    personalApiKey: process.env.POSTHOG_PERSONAL_API_KEY,
  });
  return _client;
}

function isLiveClient(client: PostHogNode | null): client is PostHogNode {
  return client != null && typeof client.capture === "function";
}

// Server-side feature flag check (async — PostHog decide API)
export async function isFeatureEnabledServer(
  flagKey: string,
  distinctId: string = "system"
): Promise<boolean> {
  const client = getClient();
  if (!isLiveClient(client)) return false; // no-op client
  try {
    return (await client.isFeatureEnabled(flagKey, distinctId)) ?? false;
  } catch {
    return false; // fail closed
  }
}

// Server-side error capture (FIX: audit C5 — no captureException, use capture)
export function captureServerError(
  error: Error | string,
  context: Record<string, unknown> = {}
): void {
  const client = getClient();
  if (!isLiveClient(client)) return; // no-op
  try {
    client.capture({
      distinctId: typeof context.user_id === "string" ? context.user_id : "server",
      event: "error",
      properties: {
        error: typeof error === "string" ? error : error.message,
        stack: typeof error === "object" ? error.stack : undefined,
        ...context,
      },
    });
  } catch {
    // never let error tracking crash the request
  }
}

// Server-side event capture (e.g. payment_succeeded)
export function captureServerEvent(
  event: string,
  properties: Record<string, unknown> = {}
): void {
  const client = getClient();
  if (!isLiveClient(client)) return; // no-op
  try {
    client.capture({
      distinctId: typeof properties.user_id === "string" ? properties.user_id : "server",
      event,
      properties,
    });
  } catch {
    // never let tracking crash the request
  }
}

export { getClient as posthogServer };
