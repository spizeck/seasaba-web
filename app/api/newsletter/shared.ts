import {
  isValidIdempotencyKey,
  type NewsletterAttribution,
  type NewsletterSubscriptionDraft,
  sanitizeAttributionValue,
  sanitizeAttributionAudience,
  validateNewsletterDraft,
} from "@/lib/newsletter/contract";
import { randomUUID } from "node:crypto";

/**
 * Shared helpers for the /api/newsletter/* first-party boundaries.
 *
 * The browser posts here; each route forwards an authenticated
 * server-to-server request to the contract-builder backend
 * (lib/newsletter/server.ts). Wire results use a small safe vocabulary —
 * no internals, no subscriber data.
 */

// A newsletter draft caps out well under 4 KB; 16 KB is generous headroom
// and still small enough to blunt payload-stuffing abuse.
export const MAX_BODY_BYTES = 16 * 1024;

export async function readBoundedJson(
  req: Request
): Promise<
  { ok: true; body: unknown } | { ok: false; reason: "too_large" | "invalid" }
> {
  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { ok: false, reason: "too_large" };
  }
  if (!req.body) return { ok: false, reason: "invalid" };
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return { ok: false, reason: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, body: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, reason: "invalid" };
  }
}

/** Read a submitted `subscription` object into a draft, or null when the
 * wire shape is wrong. Optional `organization` stays ""-valued. */
export function readSubscriptionDraft(
  value: unknown
): NewsletterSubscriptionDraft | null {
  if (typeof value !== "object" || value === null) return null;
  const r = value as Record<string, unknown>;
  if (typeof r.email !== "string") return null;
  if (!Array.isArray(r.audiences)) return null;
  const audiences = r.audiences.filter(
    (a): a is NewsletterSubscriptionDraft["audiences"][number] =>
      a === "individual" || a === "group"
  );
  if (typeof r.organization !== "string") return null;
  if (typeof r.consent !== "boolean") return null;
  if (typeof r.consentVersion !== "string") return null;
  if (typeof r.consentText !== "string") return null;
  return {
    email: r.email,
    audiences,
    organization: r.organization,
    consent: r.consent,
    consentVersion: r.consentVersion,
    consentText: r.consentText,
  };
}

export function readAttribution(value: unknown): NewsletterAttribution {
  const a =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  return {
    campaign: sanitizeAttributionValue(a.campaign),
    source: sanitizeAttributionValue(a.source),
    placement: sanitizeAttributionValue(a.placement),
    audience: sanitizeAttributionAudience(a.audience),
  };
}

export function readToken(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const token = (value as Record<string, unknown>).token;
  return typeof token === "string" && /^nl[cu]_[A-Za-z0-9_-]{43}$/.test(token)
    ? token
    : null;
}

export { isValidIdempotencyKey, validateNewsletterDraft };

export function freshIdempotencyKey(): string {
  return randomUUID();
}
