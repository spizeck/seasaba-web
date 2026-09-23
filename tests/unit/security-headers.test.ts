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
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://abcdef@o4512345.ingest.us.sentry.io/4512345"
    );
    vi.resetModules();
    try {
      const config = (await import("@/next.config")).default;
      const rules = await config.headers?.();
      const csp = parseCsp(
        rules!
          .find((r) => r.source === "/:path*")!
          .headers.find((h) => h.key === "Content-Security-Policy")!.value
      );
      const connectSrc = csp.get("connect-src") ?? [];
      // The exact origin from the DSN — present.
      expect(connectSrc).toContain("https://o4512345.ingest.us.sentry.io");
      // No broad sentry.io allowances anywhere in the policy.
      for (const [, sources] of csp) {
        expect(sources).not.toContain("https://*.sentry.io");
        expect(sources).not.toContain("https://sentry.io");
        expect(sources).not.toContain("*.sentry.io");
      }
      // Only connect-src gains a sentry origin — never script/frame/img.
      for (const directive of ["script-src", "frame-src", "img-src"]) {
        const sources = csp.get(directive) ?? [];
        expect(
          sources.some((s) => s.includes("sentry.io")),
          directive
        ).toBe(false);
      }
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it("allows no Sentry origin at all when no DSN is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    vi.resetModules();
    try {
      const config = (await import("@/next.config")).default;
      const rules = await config.headers?.();
      const csp = rules!
        .find((r) => r.source === "/:path*")!
        .headers.find((h) => h.key === "Content-Security-Policy")!.value;
      expect(csp).not.toContain("sentry.io");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
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
