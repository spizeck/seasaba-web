import * as Sentry from "@sentry/nextjs";
import { isSentryActive } from "@/lib/sentry";
import {
  clientKeyFromRequest,
  cookieValue,
  createRateLimiter,
  SENTRY_CHECK_COOKIE,
  verifySessionValue,
} from "@/lib/sentry-check";

/**
 * POST /sentry-check/server-error — the server half of the ops check (#129).
 *
 * Emits one recognizable controlled error through the server SDK, then
 * flushes so it survives serverless teardown. Gated three ways: a valid
 * signed session cookie (SENTRY_CHECK_TOKEN-verified), a per-IP rate limit,
 * and the shared production-only Sentry gate — outside Vercel Production it
 * reports `sentry_inactive` instead of touching the project.
 */
const testLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });

export const SENTRY_CHECK_SERVER_ERROR_MESSAGE =
  "Sea Saba Sentry server check — controlled test event from /sentry-check";

export async function POST(request: Request): Promise<Response> {
  if (
    !verifySessionValue(
      cookieValue(request, SENTRY_CHECK_COOKIE),
      process.env.SENTRY_CHECK_TOKEN
    )
  ) {
    return Response.json({ sent: false, reason: "unauthorized" }, { status: 401 });
  }

  if (!testLimiter(clientKeyFromRequest(request))) {
    return Response.json({ sent: false, reason: "rate_limited" }, { status: 429 });
  }

  if (!isSentryActive()) {
    return Response.json(
      { sent: false, reason: "sentry_inactive" },
      { status: 503 }
    );
  }

  const eventId = Sentry.captureException(
    new Error(SENTRY_CHECK_SERVER_ERROR_MESSAGE),
    { tags: { source: "sentry-check", surface: "server" } }
  );
  await Sentry.flush(2000);

  return Response.json({ sent: true, eventId });
}
