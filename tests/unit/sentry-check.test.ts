import { describe, expect, it } from "vitest";
import {
  clientKeyFromRequest,
  cookieValue,
  createRateLimiter,
  issueSessionValue,
  SENTRY_CHECK_COOKIE,
  SESSION_TTL_MS,
  verifyCheckToken,
  verifySessionValue,
} from "@/lib/sentry-check";

const TOKEN = "test-token-0123456789abcdef";

describe("verifyCheckToken", () => {
  it("accepts only the configured token", () => {
    expect(verifyCheckToken(TOKEN, TOKEN)).toBe(true);
    expect(verifyCheckToken("wrong", TOKEN)).toBe(false);
    expect(verifyCheckToken("", TOKEN)).toBe(false);
  });

  it("fails closed when no token is configured", () => {
    expect(verifyCheckToken(TOKEN, undefined)).toBe(false);
    expect(verifyCheckToken("", undefined)).toBe(false);
  });
});

describe("session value", () => {
  const now = 1_800_000_000_000;

  it("verifies a freshly issued session", () => {
    const value = issueSessionValue(TOKEN, now);
    expect(verifySessionValue(value, TOKEN, now)).toBe(true);
    expect(verifySessionValue(value, TOKEN, now + SESSION_TTL_MS - 1)).toBe(true);
  });

  it("rejects an expired session", () => {
    const value = issueSessionValue(TOKEN, now);
    expect(verifySessionValue(value, TOKEN, now + SESSION_TTL_MS)).toBe(false);
    expect(verifySessionValue(value, TOKEN, now + SESSION_TTL_MS + 1)).toBe(false);
  });

  it("rejects tampered and foreign sessions", () => {
    const value = issueSessionValue(TOKEN, now);
    const [expires] = value.split(".");
    expect(
      verifySessionValue(`${expires}.${"0".repeat(64)}`, TOKEN, now)
    ).toBe(false);
    expect(verifySessionValue(value, "other-token", now)).toBe(false);
    expect(verifySessionValue("garbage", TOKEN, now)).toBe(false);
    expect(verifySessionValue(undefined, TOKEN, now)).toBe(false);
    // Fail closed with no configured token.
    expect(verifySessionValue(value, undefined, now)).toBe(false);
  });
});

describe("cookieValue", () => {
  it("extracts the named cookie from a request", () => {
    const request = new Request("https://x.test/sentry-check", {
      headers: { cookie: `a=1; ${SENTRY_CHECK_COOKIE}=abc.def; b=2` },
    });
    expect(cookieValue(request, SENTRY_CHECK_COOKIE)).toBe("abc.def");
  });

  it("returns undefined when absent", () => {
    expect(
      cookieValue(new Request("https://x.test/"), SENTRY_CHECK_COOKIE)
    ).toBeUndefined();
  });
});

describe("clientKeyFromRequest", () => {
  it("uses the first X-Forwarded-For hop and falls back to unknown", () => {
    expect(
      clientKeyFromRequest(
        new Request("https://x.test/", {
          headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
        })
      )
    ).toBe("1.2.3.4");
    expect(clientKeyFromRequest(new Request("https://x.test/"))).toBe("unknown");
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    const t = 1_000_000;
    expect(limiter("ip", t)).toBe(true);
    expect(limiter("ip", t + 1)).toBe(true);
    expect(limiter("ip", t + 2)).toBe(true);
    expect(limiter("ip", t + 3)).toBe(false);
  });

  it("tracks keys independently and recovers after the window", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    const t = 1_000_000;
    limiter("a", t);
    limiter("a", t + 1);
    expect(limiter("a", t + 2)).toBe(false);
    expect(limiter("b", t + 2)).toBe(true);
    expect(limiter("a", t + 61_000)).toBe(true);
  });
});
