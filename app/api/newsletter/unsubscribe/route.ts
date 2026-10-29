import { readBoundedJson, readToken } from "../shared";
import {
  unsubscribeNewsletterToken,
  type TokenFailureKind,
} from "@/lib/newsletter/server";

export const runtime = "nodejs";

/**
 * First-party boundary for the emailed unsubscribe link.
 *
 *   browser -> POST /api/newsletter/unsubscribe { token } -> authenticated
 *   server-to-server POST {base}/api/newsletter/unsubscribe
 *
 * Wire result mirrors /api/newsletter/confirm.
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

  const outcome = await unsubscribeNewsletterToken(token);
  if (!outcome.ok) return failure(outcome.kind);
  return Response.json({ ok: true });
}
