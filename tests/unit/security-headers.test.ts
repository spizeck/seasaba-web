import { describe, expect, it, vi } from "vitest";
import nextConfig from "@/next.config";

type CspMap = Map<string, string[]>;

function parseCsp(header: string): CspMap {
  const map: CspMap = new Map();
  for (const part of header.split(";")) {
    const tokens = part.trim().split(/\s+/).filter(Boolean);
    if (tokens.length) map.set(tokens[0], tokens.slice(1));
  }
  return map;
}

async function siteWideHeaders() {
  const rules = await nextConfig.headers?.();
  const rule = rules?.find((r) => r.source === "/:path*");
  expect(rule).toBeDefined();
  return new Map(rule!.headers.map((h) => [h.key, h.value]));
}

/**
 * Structural hostname extraction for a CSP source entry. Sources may be
 * keywords ('self', 'unsafe-inline'), schemes (data:, https:), wildcards,
 * bare hosts or full origins — normalize to a URL and return the hostname,
 * or null for non-host sources. Substring checks like
 * s.includes("sentry.io") are unsafe: lookalike hosts (evil-sentry.io,
 * sentry.io.example.com) would match them.
 */
function cspSourceHostname(source: string): string | null {
  if (source.startsWith("'") || source.endsWith(":")) return null;
  try {
    const url = new URL(source.includes("://") ? source : `https://${source}`);
    return url.hostname || null;
  } catch {
    return null;
  }
}

/**
 * True only for real sentry.io hostnames — the apex or a subdomain.
 * "evil-sentry.io" and "sentry.io.example.com" correctly return false
 * because the suffix must start at a label boundary (a dot).
 */
function isSentryHostname(hostname: string): boolean {
  return hostname === "sentry.io" || hostname.endsWith(".sentry.io");
}

/** Re-import next.config with a given DSN and return its parsed CSP. */
async function cspForDsn(dsn: string): Promise<CspMap> {
  vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", dsn);
  vi.resetModules();
  try {
    const config = (await import("@/next.config")).default;
    const rules = await config.headers?.();
    const header = rules!
      .find((r) => r.source === "/:path*")!
      .headers.find((h) => h.key === "Content-Security-Policy")!.value;
    return parseCsp(header);
  } finally {
    vi.unstubAllEnvs();
    vi.resetModules();
  }
}

const requiredHeaders = [
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Cross-Origin-Opener-Policy",
  "Content-Security-Policy",
];

describe("site-wide security headers", () => {
  it("applies all required production security headers to every route", async () => {
    const headers = await siteWideHeaders();
    for (const key of requiredHeaders) expect(headers.has(key), key).toBe(true);
  });

  it("keeps the hardened header values", async () => {
    const headers = await siteWideHeaders();
    expect(headers.get("Strict-Transport-Security")).toContain(
      "max-age=63072000"
    );
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
    expect(headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin"
    );
    expect(headers.get("Cross-Origin-Opener-Policy")).toBe(
      "same-origin-allow-popups"
    );
  });

  it("disables browser features the site does not use", async () => {
    const pp = await siteWideHeaders().then((h) =>
      h.get("Permissions-Policy")
    );
    for (const feature of ["camera", "microphone", "geolocation", "payment", "usb"])
      expect(pp).toContain(`${feature}=()`);
    // Never blanket-disable features the YouTube embed delegates via allow.
    for (const feature of ["autoplay", "fullscreen", "picture-in-picture"])
      expect(pp).not.toContain(`${feature}=()`);
  });
});

describe("Content-Security-Policy", () => {
  it("exists and parses into directives", async () => {
    const csp = await siteWideHeaders().then((h) =>
      parseCsp(h.get("Content-Security-Policy")!)
    );
    expect(csp.get("default-src")).toEqual(["'self'"]);
  });

  it("has no dangerous fallback allowances", async () => {
    const csp = await siteWideHeaders().then((h) =>
      parseCsp(h.get("Content-Security-Policy")!)
    );
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("frame-ancestors")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
    // No wildcard scheme/host fallbacks outside the documented img-src case.
    for (const directive of ["script-src", "connect-src", "frame-src"]) {
      const sources = csp.get(directive) ?? [];
      expect(sources, directive).not.toContain("*");
      expect(sources, directive).not.toContain("https:");
    }
  });

  it("requires script integrations that are actually active", async () => {
    const scripts = (await siteWideHeaders()).get("Content-Security-Policy")!;
    const scriptSrc = parseCsp(scripts).get("script-src") ?? [];
    for (const origin of [
      "seasaba.checkfront.com",
      "https://www.googletagmanager.com",
      "https://*.clarity.ms",
      "https://connect.facebook.net",
      "https://bat.bing.com",
      "https://consent.cookiebot.com",
      // Respond.io Website Chat launcher script (widget.js).
      "https://cdn.respond.io",
    ]) {
      expect(scriptSrc, origin).toContain(origin);
    }
    // Scoped to the CDN host only — never the whole respond.io domain.
    expect(scriptSrc).not.toContain("https://*.respond.io");
    expect(scriptSrc).not.toContain("https://respond.io");
  });

  it("keeps frame-src limited to real embed providers", async () => {
    const frameSrc = (
      await siteWideHeaders().then((h) =>
        parseCsp(h.get("Content-Security-Policy")!)
      )
    ).get("frame-src")!;
    for (const origin of [
      "'self'",
      "seasaba.checkfront.com",
      "https://www.youtube.com",
      "https://www.googletagmanager.com",
      "https://consentcdn.cookiebot.com",
      // Respond.io Website Chat iframe (chat.html launcher + window).
      "https://cdn.respond.io",
    ]) {
      expect(frameSrc, origin).toContain(origin);
    }
    // Removed-forever hosts must not creep back.
    expect(frameSrc).not.toContain("https://www.youtube-nocookie.com");
    expect(frameSrc).not.toContain("https://*.respond.io");
  });

  it("keeps connect-src narrowed to observed destinations", async () => {
    const connectSrc = (
      await siteWideHeaders().then((h) =>
        parseCsp(h.get("Content-Security-Policy")!)
      )
    ).get("connect-src")!;
    expect(connectSrc).toContain("https://firestore.googleapis.com");
    expect(connectSrc).toContain("seasaba.checkfront.com");
    // Respond.io remote-config fetch — the only top-frame call the widget
    // makes. The chat WebSocket/APIs live inside the vendor iframe and are
    // governed by that document's own CSP, so they must not appear here.
    expect(connectSrc).toContain("https://service.respond.io");
    expect(connectSrc).not.toContain("https://*.googleapis.com");
    expect(connectSrc).not.toContain("wss://*.googleapis.com");
    expect(connectSrc).not.toContain("https://google.com");
    expect(connectSrc).not.toContain("https://*.respond.io");
    expect(connectSrc.some((s) => s.startsWith("wss://"))).toBe(false);
  });

  it("adds exactly the configured Sentry ingest origin to connect-src — and nothing else", async () => {
    const dsn = "https://abcdef@o4512345.ingest.us.sentry.io/4512345";
    // The expected CSP entry is the origin parsed out of the DSN — never a
    // hardcoded sentry.io pattern.
    const expectedOrigin = new URL(dsn).origin;
    expect(expectedOrigin).toBe("https://o4512345.ingest.us.sentry.io");

    const csp = await cspForDsn(dsn);
    expect(csp.get("connect-src")).toContain(expectedOrigin);

    // Across every directive, the ONLY Sentry host allowed is that exact
    // origin. Hostnames are compared structurally, so this fails for
    // wildcards (*.sentry.io), other sentry.io hosts, Sentry origins in
    // script/frame/img-src — and can never be satisfied by lookalikes such
    // as evil-sentry.io or sentry.io.example.com.
    for (const [directive, sources] of csp) {
      for (const source of sources) {
        const host = cspSourceHostname(source);
        if (host === null || !isSentryHostname(host)) continue;
        expect(directive, `${directive}: ${source}`).toBe("connect-src");
        expect(source, `${directive}: ${source}`).toBe(expectedOrigin);
      }
    }
  });

  it("yields exactly one Sentry source — the DSN origin itself", async () => {
    const dsn = "https://abcdef@o4512345.ingest.us.sentry.io/4512345";
    const csp = await cspForDsn(dsn);
    const sentrySources = (csp.get("connect-src") ?? []).filter((s) => {
      const host = cspSourceHostname(s);
      return host !== null && isSentryHostname(host);
    });
    expect(sentrySources).toEqual([new URL(dsn).origin]);
  });

  it("recognizes Sentry hosts structurally — never by substring", () => {
    // A "sentry.io" substring inside an attacker-controlled hostname must
    // not count as a Sentry endpoint.
    for (const host of [
      "sentry.io.example.com",
      "evil-sentry.io",
      "notsentry.io",
      "sentry.io.evil.example.com",
      "*.not-sentry.io",
    ]) {
      expect(isSentryHostname(host), host).toBe(false);
    }
    for (const host of [
      "sentry.io",
      "o123.ingest.us.sentry.io",
      "o456.ingest.de.sentry.io",
    ]) {
      expect(isSentryHostname(host), host).toBe(true);
    }
  });

  it("adds no Sentry origin for missing, malformed or non-HTTPS DSNs", async () => {
    for (const dsn of [
      "",
      "not-a-url",
      "http://o123.ingest.us.sentry.io/123",
      "://broken",
    ]) {
      const csp = await cspForDsn(dsn);
      for (const [directive, sources] of csp) {
        for (const source of sources) {
          const host = cspSourceHostname(source);
          expect(
            host === null || !isSentryHostname(host),
            `${directive}: ${source} (dsn=${JSON.stringify(dsn)})`
          ).toBe(true);
        }
      }
    }
  });

  it("omits 'unsafe-eval' from the production policy", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    try {
      const prodConfig = (await import("@/next.config")).default;
      const rules = await prodConfig.headers?.();
      const csp = rules
        ?.find((r) => r.source === "/:path*")
        ?.headers.find((h) => h.key === "Content-Security-Policy")?.value;
      expect(csp).toBeDefined();
      expect(csp).not.toContain("'unsafe-eval'");
      expect(csp).toContain("'unsafe-inline'"); // Next.js hydration scripts
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it("keeps 'unsafe-eval' available to the dev server only", async () => {
    // Under test/dev NODE_ENV the dev toolchain allowance is present.
    const csp = await siteWideHeaders().then((h) =>
      h.get("Content-Security-Policy")!
    );
    expect(process.env.NODE_ENV).not.toBe("production");
    expect(csp).toContain("'unsafe-eval'");
  });
});
