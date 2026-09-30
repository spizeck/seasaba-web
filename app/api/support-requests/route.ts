import { randomUUID } from "node:crypto";
import {
  draftEnumErrors,
  isValidIdempotencyKey,
  readSupportRequestDraft,
} from "@/lib/community-support/contract";
import {
  submitSupportRequest,
  type SubmitFailureKind,
} from "@/lib/community-support/server";
import { validateSupportRequest } from "@/lib/support-request";

export const runtime = "nodejs";

/**
 * First-party submission boundary for the /donate "Request Support from
 * Sea Saba" form (seasaba-web#189).
 *
 *   browser -> POST /api/support-requests -> authenticated server-to-server
 *   POST {COMMUNITY_SUPPORT_API_BASE_URL}/api/community-support/requests
 *
 * The browser posts `{ request, idempotencyKey?, submittedAt?, website? }`:
 *  - `request` is the form draft (same field contract as the backend)
 *  - `idempotencyKey` lets the client retry an identical draft safely; an
 *    absent/invalid one is replaced server-side so a malformed key can
 *    never reach the backend
 *  - `website` is a honeypot — real users can't see or fill it, so any
 *    value means a bot and is rejected before the draft is even read
 *
 * Wire result (small safe vocabulary, no internals):
 *   200 { ok: true, reference }
 *   400 { ok: false, kind: "validation", fields? }
 *   429 { ok: false, kind: "rate_limited" }
 *   503 { ok: false, kind: "unavailable" }
 *
 * PII: this route never logs request bodies or applicant data.
 */

// The full draft caps out under ~4 KB; 16 KB is generous headroom and
// still small enough to blunt payload-stuffing abuse.
const MAX_BODY_BYTES = 16 * 1024;

const STATUS_BY_KIND: Record<SubmitFailureKind, number> = {
  validation: 400,
  rate_limited: 429,
  unavailable: 503,
};

function failure(
  kind: SubmitFailureKind,
  fields?: Record<string, string>
): Response {
  return Response.json(
    { ok: false, kind, ...(fields ? { fields } : {}) },
    { status: STATUS_BY_KIND[kind] }
  );
}

async function readBoundedJson(
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

  const draft = readSupportRequestDraft(b.request);
  if (!draft) return failure("validation");

  const errors: Record<string, string> = { ...draftEnumErrors(draft) };
  for (const [field, message] of Object.entries(validateSupportRequest(draft))) {
    if (message) errors[field] = message;
  }
  if (Object.keys(errors).length > 0) {
    return failure("validation", errors);
  }

  const idempotencyKey = isValidIdempotencyKey(b.idempotencyKey)
    ? b.idempotencyKey
    : randomUUID();
  const submittedAt =
    typeof b.submittedAt === "string" &&
    !Number.isNaN(Date.parse(b.submittedAt))
      ? b.submittedAt
      : undefined;

  const outcome = await submitSupportRequest(draft, {
    idempotencyKey,
    submittedAt,
  });

  if (!outcome.ok) {
    return failure(outcome.kind, outcome.fields);
  }
  return Response.json({ ok: true, reference: outcome.reference });
}
