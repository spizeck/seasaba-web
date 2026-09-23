import * as Sentry from "@sentry/nextjs";
import { isSentryActive } from "@/lib/sentry";

/**
 * POST /sentry-check/server-error — the server half of the temporary
 * verification page (#129).
 *
 * Emits one recognizable controlled error through the server SDK, then
 * flushes so it survives serverless teardown. Guarded by the shared
 * production-only Sentry gate — outside Vercel Production it reports
 * `sentry_inactive` instead of touching the project. There is deliberately
 * no auth layer: this is short-lived verification tooling removed in an
 * immediate cleanup PR once capture is confirmed.
 */
export const SENTRY_CHECK_SERVER_ERROR_MESSAGE =
  "Sea Saba Sentry server check — controlled test event from /sentry-check";

export async function POST(): Promise<Response> {
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
