import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ErrorEvent } from "@sentry/nextjs";
import {
  isSentryActive,
  sanitizeSentryEvent,
  sentryDeploymentEnv,
  sentryDsn,
  stripUrlSensitiveParts,
} from "@/lib/sentry";

/**
 * #129: the single activation gate. Every environment except a real Vercel
 * Production deployment must leave Sentry inert — crucially including Vercel
 * Preview, which builds Next.js in production mode, so NODE_ENV alone can
 * never be the decision.
 */
describe("Sentry activation gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("activates only on Vercel Production with a configured DSN", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(sentryDeploymentEnv()).toBe("production");
    expect(isSentryActive()).toBe(true);
  });

  it("honors NEXT_PUBLIC_VERCEL_ENV (the browser-visible deployment context)", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(isSentryActive()).toBe(true);
  });

  it("stays off on Vercel Preview even though the build is production-mode", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(isSentryActive()).toBe(false);
  });

  it("stays off on Vercel Preview when only the server-side VERCEL_ENV is set", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(isSentryActive()).toBe(false);
  });

  it("stays off in local development", () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(isSentryActive()).toBe(false);
  });

  it("stays off in test/CI where no Vercel deployment context exists", () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "https://abc@o123.ingest.us.sentry.io/456");
    expect(sentryDeploymentEnv()).not.toBe("production");
    expect(isSentryActive()).toBe(false);
  });

  it("fails closed when the DSN is missing on production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(isSentryActive()).toBe(false);
  });

  it("fails closed when the DSN is blank on production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "   ");
    expect(sentryDsn()).toBeUndefined();
    expect(isSentryActive()).toBe(false);
  });
});

describe("stripUrlSensitiveParts", () => {
  it("removes query strings and fragments, keeping origin + path", () => {
    expect(stripUrlSensitiveParts("https://www.seasaba.com/contact?interest=courses"))
      .toBe("https://www.seasaba.com/contact");
    expect(stripUrlSensitiveParts("https://www.seasaba.com/book?item=classic#section"))
      .toBe("https://www.seasaba.com/book");
    expect(stripUrlSensitiveParts("/contact?email=a@b.com")).toBe("/contact");
    expect(stripUrlSensitiveParts("mailto:info@seasaba.com?subject=x")).toBe("mailto:info@seasaba.com");
  });

  it("leaves clean URLs untouched", () => {
    expect(stripUrlSensitiveParts("https://www.seasaba.com/diving")).toBe(
      "https://www.seasaba.com/diving"
    );
    expect(stripUrlSensitiveParts("/dive-sites")).toBe("/dive-sites");
  });
});

function eventWith(overrides: Partial<ErrorEvent>): ErrorEvent {
  return { ...overrides } as ErrorEvent;
}

describe("sanitizeSentryEvent", () => {
  it("strips query/fragment from the request URL and drops the query_string field", () => {
    const event = eventWith({
      request: {
        url: "https://www.seasaba.com/book?item=classic&name=Jane",
        query_string: "item=classic&name=Jane",
      },
    });
    const result = sanitizeSentryEvent(event);
    expect(result.request?.url).toBe("https://www.seasaba.com/book");
    expect(result.request?.query_string).toBeUndefined();
  });

  it("removes request bodies, cookies and all headers (customer/form data)", () => {
    const event = eventWith({
      request: {
        url: "https://www.seasaba.com/contact",
        data: { name: "Jane Diver", email: "jane@example.com", message: "hello" },
        cookies: { session: "abc" },
        headers: {
          Referer: "https://www.seasaba.com/contact?interest=x",
          Cookie: "session=abc",
          Authorization: "Bearer token",
        },
      },
    });
    const result = sanitizeSentryEvent(event);
    expect(result.request?.data).toBeUndefined();
    expect(result.request?.cookies).toBeUndefined();
    expect(result.request?.headers).toBeUndefined();
  });

  it("always drops user context", () => {
    const event = eventWith({
      user: { id: "1", email: "jane@example.com", ip_address: "1.2.3.4" },
    });
    expect(sanitizeSentryEvent(event).user).toBeUndefined();
  });

  it("strips query/fragment from breadcrumb URLs", () => {
    const event = eventWith({
      breadcrumbs: [
        {
          category: "navigation",
          data: {
            from: "https://www.seasaba.com/?utm=abc",
            to: "https://www.seasaba.com/contact?email=jane@example.com",
            url: "https://seasaba.checkfront.com/reserve/?item=1",
          },
        },
      ],
    });
    const crumbs = sanitizeSentryEvent(event).breadcrumbs as {
      data: Record<string, string>;
    }[];
    expect(crumbs[0].data.from).toBe("https://www.seasaba.com/");
    expect(crumbs[0].data.to).toBe("https://www.seasaba.com/contact");
    expect(crumbs[0].data.url).toBe("https://seasaba.checkfront.com/reserve/");
  });

  it("strips query/fragment from stack frame URLs", () => {
    const event = eventWith({
      exception: {
        values: [
          {
            type: "Error",
            value: "boom",
            stacktrace: {
              frames: [
                {
                  filename: "https://www.seasaba.com/_next/chunk.js?dpl=abc",
                  abs_path: "https://www.seasaba.com/_next/chunk.js?dpl=abc",
                },
              ],
            },
          },
        ],
      },
    });
    const frame = sanitizeSentryEvent(event).exception!.values![0].stacktrace!
      .frames![0];
    expect(frame.filename).toBe("https://www.seasaba.com/_next/chunk.js");
    expect(frame.abs_path).toBe("https://www.seasaba.com/_next/chunk.js");
  });
});

/**
 * Guard against feature creep: the baseline is error monitoring only. These
 * read the actual init files so a future edit that enables tracing, replay,
 * PII or feedback is a test failure, not a silent regression.
 */
describe("Sentry init files stay an error-only, no-PII baseline", () => {
  const initFiles = ["instrumentation-client.ts", "sentry.server.config.ts"].map(
    (f) => [f, readFileSync(join(__dirname, "../../", f), "utf8")] as const
  );

  it("never enable performance tracing or Session Replay", () => {
    for (const [file, text] of initFiles) {
      expect(text, file).toContain("tracesSampleRate: 0");
      expect(text, file).not.toMatch(/tracesSampleRate:\s*(?!0\b)\d/);
      expect(text, file).not.toContain("replayIntegration");
      expect(text, file).not.toContain("replaysSessionSampleRate");
      expect(text, file).not.toContain("replaysOnErrorSampleRate");
      expect(text, file).not.toContain("feedbackIntegration");
      expect(text, file).not.toContain("enableLogs: true");
    }
  });

  it("disable default PII and every dataCollection category", () => {
    for (const [file, text] of initFiles) {
      expect(text, file).toContain("sendDefaultPii: false");
      expect(text, file).toContain("userInfo: false");
      expect(text, file).toContain("cookies: false");
      expect(text, file).toContain("httpBodies: []");
      expect(text, file).toContain("urlQueryParams: false");
      expect(text, file).toContain("beforeSend: sanitizeSentryEvent");
      expect(text, file).toContain("enabled: isSentryActive()");
    }
  });

  it("keeps the /sentry-check surface free of business analytics", () => {
    // Sentry check actions are operational telemetry — they must never flow
    // into GA4/GTM/Vercel Analytics as pseudo-conversions.
    for (const file of [
      "app/sentry-check/layout.tsx",
      "app/sentry-check/page.tsx",
      "components/sentry-check-auth-form.tsx",
      "components/sentry-check-controls.tsx",
    ]) {
      const text = readFileSync(join(__dirname, "../../", file), "utf8");
      expect(text, file).not.toMatch(
        /trackEvent|trackLinkClick|trackBookingClick|@vercel\/analytics|dataLayer|googletagmanager/i
      );
    }
  });
});
