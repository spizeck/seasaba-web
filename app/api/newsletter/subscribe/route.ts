import {
  isValidIdempotencyKey,
  readAttribution,
  readBoundedJson,
  readSubscriptionDraft,
  validateNewsletterDraft,
  MAX_BODY_BYTES,
} from "../shared";
import { randomUUID } from "node:crypto";
import {
  submitSubscription,
  type SubscribeFailureKind,
} from "@/lib/newsletter/server";

export const runtime = "nodejs";

/**
 * First-party submission boundary for the /newsletter signup form.
 *
 *   browser -> POST /api/newsletter/subscribe -> authenticated
 *   server-to-server POST {base}/api/newsletter/subscribe
 *
 * The browser posts `{ subscription, attribution, idempotencyKey?,
 * submittedAt?, website? }`:
 *  - `subscription` is the form draft (same field contract as the backend)
 *  - `attribution` is sanitized campaign tracking metadata
 *  - `idempotencyKey` lets the client retry an identical draft safely; an
 *    absent/invalid one is replaced server-side so a malformed key can
 *    never reach the backend
 *  - `website` is a honeypot — real users can't see or fill it, so any
 *    value means a bot and is rejected before the draft is even read
 *
 * Wire result (small safe vocabulary, no internals, no existence leaks):
 *   200 { ok: true }
 *   400 { ok: false, kind: "validation", fields? }
 *   429 { ok: false, kind: "rate_limited" }
 *   503 { ok: false, kind: "unavailable" }
 *
 * PII: this route never logs request bodies or subscriber data.
 */

const STATUS_BY_KIND: Record<SubscribeFailureKind, number> = {
  validation: 400,
  rate_limited: 429,
  unavailable: 503,
};

function failure(
  kind: SubscribeFailureKind,
  fields?: Record<string, string>
): Response {
  return Response.json(
    { ok: false, kind, ...(fields ? { fields } : {}) },
    { status: STATUS_BY_KIND[kind] }
  );
}

export async function POST(req: Request) {
  const parsed = await readBoundedJson(req);
  if (!parsed.ok) {
    return Response.json(
      { ok: false, kind: "validation" },
      { status: parsed.reason === "too_large" ? 413 : 400 }
    );
  }
  const body = parsed.body;
  if (typeof body !== "object" || body === null) {
    return failure("validation");
  }
  const b = body as Record<string, unknown>;

  // Honeypot — the field is invisible and unreachable to humans.
  if (typeof b.website === "string" && b.website.trim() !== "") {
    return failure("validation");
  }

  const draft = readSubscriptionDraft(b.subscription);
  if (!draft) return failure("validation");

  const errors = validateNewsletterDraft(draft);
  if (Object.keys(errors).length > 0) {
    return failure("validation", errors);
  }

  const attribution = readAttribution(b.attribution);

  const idempotencyKey = isValidIdempotencyKey(b.idempotencyKey)
    ? b.idempotencyKey
    : randomUUID();
  const submittedAt =
    typeof b.submittedAt === "string" &&
    !Number.isNaN(Date.parse(b.submittedAt))
      ? b.submittedAt
      : undefined;

  const outcome = await submitSubscription(draft, attribution, {
    idempotencyKey,
    submittedAt,
  });

  if (!outcome.ok) {
    return failure(outcome.kind, outcome.fields);
  }
  return Response.json({ ok: true });
}

// Read cap is enforced inside readBoundedJson; the constant is re-exported
// for tests asserting the bound exists.
export { MAX_BODY_BYTES };
