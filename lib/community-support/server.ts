import "server-only";

import type { SupportRequestDraft } from "@/lib/support-request";
import {
  COMMUNITY_SUPPORT_SOURCE,
  SUPPORT_REQUEST_SCHEMA_VERSION,
  type CommunitySupportErrorCode,
  type SupportRequestIngestPayload,
  type SupportRequestIngestResult,
} from "./contract";

/**
 * Server-only Community Support client (seasaba-web#189).
 *
 * The browser never talks to the backend directly: the /donate form posts
 * to the first-party route `app/api/support-requests/route.ts`, which calls
 * submitSupportRequest() here. Donation-recipient content is deliberately
 * NOT sourced from the backend — it stays code-owned in
 * `data/donations.ts`.
 *
 * Configuration (server-only, never NEXT_PUBLIC_*):
 *   COMMUNITY_SUPPORT_API_BASE_URL  e.g. https://seasaba.app
 *   COMMUNITY_SUPPORT_INGEST_KEY    shared secret for POST .../requests
 * Both fail closed: no base URL or key -> no request is attempted.
 *
 * PII discipline: nothing in this module logs request bodies or applicant
 * data — only status codes, error codes, and returned references.
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
  const raw = process.env.COMMUNITY_SUPPORT_API_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    // http is allowed only for loopback development against a local
    // backend — the Bearer key and applicant data must never cross the
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
  const key = process.env.COMMUNITY_SUPPORT_INGEST_KEY;
  // The backend requires >= 16 chars and fails closed below that — mirror
  // the check so a truncated/placeholder value never reaches the wire.
  return typeof key === "string" && key.length >= 16 ? key : null;
}

/** Safe error codes the route may surface to the form — no internals. */
export type SubmitFailureKind =
  | "validation"
  | "rate_limited"
  | "unavailable";

export type SubmitSupportRequestResult =
  | { ok: true; reference: string; duplicate: boolean }
  | {
      ok: false;
      kind: SubmitFailureKind;
      /** Field-name -> message map (names only, never values). */
      fields?: Record<string, string>;
    };

function safeFields(value: unknown): Record<string, string> | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "string") out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Persist a support request via POST {base}/api/community-support/requests.
 * Authenticated with the shared ingest key; the caller supplies the
 * idempotency key so retries of the same draft replay safely.
 */
export async function submitSupportRequest(
  draft: SupportRequestDraft,
  opts: { idempotencyKey: string; submittedAt?: string }
): Promise<SubmitSupportRequestResult> {
  const base = baseUrl();
  const key = ingestKey();
  if (!base || !key) {
    // Fail closed — a missing secret must never mean "allow" or "skip".
    console.error("community_support.submit.not_configured");
    return { ok: false, kind: "unavailable" };
  }

  const payload: SupportRequestIngestPayload = {
    schemaVersion: SUPPORT_REQUEST_SCHEMA_VERSION,
    idempotencyKey: opts.idempotencyKey,
    source: COMMUNITY_SUPPORT_SOURCE,
    ...(opts.submittedAt ? { submittedAt: opts.submittedAt } : {}),
    request: draft,
  };

  let res: Response;
  try {
    res = await fetch(`${base}/api/community-support/requests`, {
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
    // Network failure, DNS, or timeout — never claim success.
    console.error("community_support.submit.transport_failure");
    return { ok: false, kind: "unavailable" };
  }

  const body: unknown = await res.json().catch(() => null);
  const errorCode =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>).error
      : undefined;

  if (res.status === 200 || res.status === 201) {
    const result = body as Partial<SupportRequestIngestResult> | null;
    if (result && typeof result.reference === "string" && result.reference) {
      return {
        ok: true,
        reference: result.reference,
        duplicate: result.duplicate === true,
      };
    }
    // A 2xx without the promised reference is not a success.
    console.error("community_support.submit.malformed_success", {
      status: res.status,
    });
    return { ok: false, kind: "unavailable" };
  }

  if (res.status === 400 || res.status === 413) {
    return {
      ok: false,
      kind: "validation",
      fields: safeFields((body as Record<string, unknown> | null)?.fields),
    };
  }
  if (res.status === 409) {
    // idempotency_conflict / invalid_transition — the caller regenerates
    // the key when the draft changes, so surfacing as retryable is right.
    console.error("community_support.submit.conflict", {
      status: res.status,
      code: typeof errorCode === "string" ? errorCode : "unknown",
    });
    return { ok: false, kind: "unavailable" };
  }
  if (res.status === 429) {
    return { ok: false, kind: "rate_limited" };
  }

  // 401/403 (credential problem), 503 not_configured, 500 internal, or any
  // unexpected status — the requester sees one honest "unavailable".
  console.error("community_support.submit.backend_error", {
    status: res.status,
    code:
      typeof errorCode === "string"
        ? (errorCode as CommunitySupportErrorCode)
        : "unknown",
  });
  return { ok: false, kind: "unavailable" };
}
