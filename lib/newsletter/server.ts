import "server-only";

import {
  NEWSLETTER_SCHEMA_VERSION,
  NEWSLETTER_SOURCE,
  type NewsletterAttribution,
  type NewsletterSubscribePayload,
  type NewsletterSubscriptionDraft,
  type NewsletterTokenPayload,
} from "./contract";

/**
 * Server-only Newsletter client — the browser never talks to the backend
 * directly: the signup form posts to app/api/newsletter/subscribe (and
 * the emailed confirm/unsubscribe links post to their own routes), which
 * call into this module.
 *
 * Configuration (server-only, never NEXT_PUBLIC_*):
 *   NEWSLETTER_API_BASE_URL  e.g. https://seasaba.app — falls back to
 *                            COMMUNITY_SUPPORT_API_BASE_URL (same backend)
 *   NEWSLETTER_INGEST_KEY    shared secret for POST /api/newsletter/*
 * Both fail closed: no base URL or key -> no request is attempted.
 *
 * PII discipline: nothing in this module logs request bodies or
 * subscriber data — only status codes and safe error codes.
 */

const REQUEST_TIMEOUT_MS = 10_000;

// Env reads stay literal (not via constants) so scripts/check-env-vars.mjs
// can see them.
function isLoopbackHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  );
}

function baseUrl(): string | null {
  const raw =
    process.env.NEWSLETTER_API_BASE_URL?.trim() ||
    process.env.COMMUNITY_SUPPORT_API_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    // http is allowed only for loopback development against a local
    // backend — the Bearer key and subscriber data must never cross the
    // network in plaintext to a remote host.
    if (url.protocol === "https:") return url.origin;
    if (url.protocol === "http:" && isLoopbackHostname(url.hostname)) {
      return url.origin;
    }
    return null;
  } catch {
    return null;
  }
}

function ingestKey(): string | null {
  const key = process.env.NEWSLETTER_INGEST_KEY;
  // The backend requires >= 16 chars and fails closed below that — mirror
  // the check so a truncated/placeholder value never reaches the wire.
  return typeof key === "string" && key.length >= 16 ? key : null;
}

/** Safe error vocabulary the routes may surface — no internals. */
export type SubscribeFailureKind = "validation" | "rate_limited" | "unavailable";
export type TokenFailureKind = "invalid_token" | "expired" | "rate_limited" | "unavailable";

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: SubscribeFailureKind; fields?: Record<string, string> };

export type TokenResult =
  | { ok: true }
  | { ok: false; kind: TokenFailureKind };

async function postToBackend(
  path: string,
  payload: unknown,
  event: string
): Promise<
  | { ok: true; status: number; body: unknown }
  | { ok: false; kind: "unavailable" }
> {
  const base = baseUrl();
  const key = ingestKey();
  if (!base || !key) {
    // Fail closed — a missing secret must never mean "allow" or "skip".
    console.error(`${event}.not_configured`);
    return { ok: false, kind: "unavailable" };
  }

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    console.error(`${event}.transport_failure`);
    return { ok: false, kind: "unavailable" };
  }

  const body: unknown = await res.json().catch(() => null);
  return { ok: true, status: res.status, body };
}

function backendErrorCode(body: unknown): string {
  const code =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).error
      : undefined;
  return typeof code === "string" ? code : "unknown";
}

function safeFields(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Persist a newsletter subscription via
 * POST {base}/api/newsletter/subscribe. The caller supplies the
 * idempotency key so retries of the same draft replay safely.
 */
export async function submitSubscription(
  draft: NewsletterSubscriptionDraft,
  attribution: NewsletterAttribution,
  opts: { idempotencyKey: string; submittedAt?: string }
): Promise<SubmitResult> {
  const payload: NewsletterSubscribePayload = {
    schemaVersion: NEWSLETTER_SCHEMA_VERSION,
    idempotencyKey: opts.idempotencyKey,
    source: NEWSLETTER_SOURCE,
    ...(opts.submittedAt ? { submittedAt: opts.submittedAt } : {}),
    subscription: draft,
    attribution,
  };

  const res = await postToBackend(
    "/api/newsletter/subscribe",
    payload,
    "newsletter.subscribe"
  );
  if (!res.ok) return { ok: false, kind: "unavailable" };

  if (res.status === 200) return { ok: true };
  if (res.status === 400 || res.status === 413) {
    return {
      ok: false,
      kind: "validation",
      fields: safeFields(
        (res.body as Record<string, unknown> | null)?.fields
      ),
    };
  }
  if (res.status === 429) return { ok: false, kind: "rate_limited" };

  console.error("newsletter.subscribe.backend_error", {
    status: res.status,
    code: backendErrorCode(res.body),
  });
  return { ok: false, kind: "unavailable" };
}

/**
 * Redeem a confirmation (`nlc_…`) token via
 * POST {base}/api/newsletter/confirm.
 */
export async function confirmNewsletterToken(token: string): Promise<TokenResult> {
  return redeemToken("/api/newsletter/confirm", token, "newsletter.confirm");
}

/**
 * Redeem an unsubscribe (`nlu_…`) token via
 * POST {base}/api/newsletter/unsubscribe.
 */
export async function unsubscribeNewsletterToken(token: string): Promise<TokenResult> {
  return redeemToken(
    "/api/newsletter/unsubscribe",
    token,
    "newsletter.unsubscribe"
  );
}

async function redeemToken(
  path: string,
  token: string,
  event: string
): Promise<TokenResult> {
  const payload: NewsletterTokenPayload = { token };
  const res = await postToBackend(path, payload, event);
  if (!res.ok) return { ok: false, kind: "unavailable" };

  if (res.status === 200) return { ok: true };
  const code = backendErrorCode(res.body);
  if (res.status === 400 && code === "token_invalid") {
    return { ok: false, kind: "invalid_token" };
  }
  if (res.status === 400 || res.status === 413) {
    return { ok: false, kind: "invalid_token" };
  }
  if (res.status === 410 || code === "token_expired") {
    return { ok: false, kind: "expired" };
  }
  if (res.status === 429) return { ok: false, kind: "rate_limited" };

  console.error(`${event}.backend_error`, { status: res.status, code });
  return { ok: false, kind: "unavailable" };
}
