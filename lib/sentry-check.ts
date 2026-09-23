import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Server-side authorization for the /sentry-check operational page (#129).
 *
 * Model: the owner sets a high-entropy `SENTRY_CHECK_TOKEN` in the Vercel
 * Production environment only. The page's sign-in form posts the token to
 * /sentry-check/session; on match the response sets an HttpOnly,
 * SameSite=Strict cookie scoped to /sentry-check containing an HMAC-signed
 * expiry timestamp. Every subsequent action (including the server test
 * endpoint) re-verifies that signature — the token itself is never stored,
 * never put in a URL, and never bundled into client JavaScript.
 *
 * Fail closed: with `SENTRY_CHECK_TOKEN` unset no session can ever verify,
 * so the check surface is inert everywhere the token is not configured.
 *
 * Server-only module — it uses node:crypto and reads a server-only env var.
 * Client code must never import it.
 */

export const SENTRY_CHECK_COOKIE = "sentry_check_session";
/** Sessions are self-contained (signed expiry) — no server state to revoke. */
export const SESSION_TTL_MS = 60 * 60 * 1000;

function sessionSignature(expiresMs: number, token: string): string {
  return createHmac("sha256", token)
    .update(`sentry-check.${expiresMs}`)
    .digest("hex");
}

/** Cookie value: `<expiresMs>.<hmac>` — stateless, verifiable, self-expiring. */
export function issueSessionValue(token: string, now: number = Date.now()): string {
  const expires = now + SESSION_TTL_MS;
  return `${expires}.${sessionSignature(expires, token)}`;
}

export function verifySessionValue(
  value: string | undefined,
  token: string | undefined,
  now: number = Date.now()
): boolean {
  if (!value || !token) return false;
  const dot = value.indexOf(".");
  if (dot < 0) return false;
  const expires = Number(value.slice(0, dot));
  const signature = value.slice(dot + 1);
  if (!Number.isFinite(expires) || expires <= now) return false;
  const expected = sessionSignature(expires, token);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Constant-time check of a presented token against SENTRY_CHECK_TOKEN.
 * Compares SHA-256 digests so the comparison can't leak length or prefix.
 */
export function verifyCheckToken(provided: string, configured: string | undefined): boolean {
  if (!configured) return false;
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(configured).digest();
  return timingSafeEqual(a, b);
}

/** Read one cookie value out of a Request's Cookie header. */
export function cookieValue(request: Request, name: string): string | undefined {
  const header = request.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

/** Best-effort client key for rate limiting — first hop of X-Forwarded-For. */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/**
 * Fixed-window rate limiter. In-memory, so the limit applies per serverless
 * instance — it throttles scripted bursts against a single instance, which is
 * the realistic abuse path for an unauthenticated-looking endpoint. It is not
 * a global counter; that is an accepted, documented limitation.
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): (key: string, now?: number) => boolean {
  const hits = new Map<string, number[]>();
  return (key: string, now: number = Date.now()): boolean => {
    const windowStart = now - windowMs;
    const stamps = (hits.get(key) ?? []).filter((t) => t > windowStart);
    if (stamps.length >= limit) {
      hits.set(key, stamps);
      return false;
    }
    stamps.push(now);
    hits.set(key, stamps);
    return true;
  };
}
