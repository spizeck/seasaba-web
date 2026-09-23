import {
  clientKeyFromRequest,
  createRateLimiter,
  issueSessionValue,
  SENTRY_CHECK_COOKIE,
  SESSION_TTL_MS,
  verifyCheckToken,
} from "@/lib/sentry-check";

/**
 * POST /sentry-check/session — token sign-in for the ops page (#129).
 *
 * Verifies the submitted token server-side (constant-time, fail closed when
 * SENTRY_CHECK_TOKEN is unset) and answers JSON. On success the response
 * carries an HttpOnly, SameSite=Strict, /sentry-check-scoped session cookie —
 * applied by the browser's HTTP stack even though fetch() callers can never
 * read Set-Cookie. The token never appears in a URL and never reaches client
 * JavaScript. Brute-force attempts are rate limited per client IP.
 */
const authorizeLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request): Promise<Response> {
  if (!authorizeLimiter(clientKeyFromRequest(request))) {
    return Response.json(
      { ok: false, reason: "rate_limited" },
      { status: 429 }
    );
  }

  const configured = process.env.SENTRY_CHECK_TOKEN;
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");

  if (typeof token !== "string" || !verifyCheckToken(token, configured)) {
    return Response.json(
      { ok: false, reason: "unauthorized" },
      { status: 401 }
    );
  }

  const secure = new URL(request.url).protocol === "https:";
  return Response.json(
    { ok: true },
    {
      headers: {
        "Set-Cookie":
          `${SENTRY_CHECK_COOKIE}=${issueSessionValue(configured!)}; ` +
          `Path=/sentry-check; HttpOnly; SameSite=Strict; Max-Age=${Math.floor(
            SESSION_TTL_MS / 1000
          )}${secure ? "; Secure" : ""}`,
      },
    }
  );
}
