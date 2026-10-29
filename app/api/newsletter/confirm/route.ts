import { readBoundedJson, readToken } from "../shared";
import {
  confirmNewsletterToken,
  type TokenFailureKind,
} from "@/lib/newsletter/server";

export const runtime = "nodejs";

/**
 * First-party boundary for the emailed confirmation link (double opt-in).
 *
 *   browser -> POST /api/newsletter/confirm { token } -> authenticated
 *   server-to-server POST {base}/api/newsletter/confirm
 *
 * Wire result:
 *   200 { ok: true }
 *   400 { ok: false, kind: "invalid_token" }
 *   410 { ok: false, kind: "expired" }
 *   429 { ok: false, kind: "rate_limited" }
 *   503 { ok: false, kind: "unavailable" }
 */

const STATUS_BY_KIND: Record<TokenFailureKind, number> = {
  invalid_token: 400,
  expired: 410,
  rate_limited: 429,
  unavailable: 503,
};

function failure(kind: TokenFailureKind): Response {
  return Response.json({ ok: false, kind }, { status: STATUS_BY_KIND[kind] });
}

export async function POST(req: Request) {
  const parsed = await readBoundedJson(req);
  if (!parsed.ok) {
    return failure("invalid_token");
  }
  const token = readToken(parsed.body);
  if (!token) return failure("invalid_token");

  const outcome = await confirmNewsletterToken(token);
  if (!outcome.ok) return failure(outcome.kind);
  return Response.json({ ok: true });
}
