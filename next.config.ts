import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import { legacyRedirects } from "./data/redirects";
import { sentryBuildOptions } from "./lib/sentry-build";

// Next.js dev tooling (HMR / dev overlays) evaluates code; production does not.
const isDev = process.env.NODE_ENV !== "production";

// Sentry browser SDK posts envelopes to the DSN's ingest origin. Deriving the
// origin from the configured DSN (rather than writing a wildcard) means the
// CSP only ever allows the exact ingest host this project uses — and none at
// all where no DSN is configured (local dev, tests). Non-HTTPS DSNs fail
// closed to null.
const sentryIngestOrigin = (() => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;
  try {
    const { protocol, origin } = new URL(dsn);
    return protocol === "https:" ? origin : null;
  } catch {
    return null;
  }
})();

// Content Security Policy — every origin below is confirmed by observed
// production traffic (Playwright network capture) or maps to a confirmed
// active integration. GTM-managed tags (GA4, Google Ads, Clarity, Meta,
// Bing, Cookiebot) are configured in the external GTM container
// (GTM-5PFMJFN); the Google-family hosts stay because that container — not
// this repo — decides which of them fire on a given event.
const cspDirectives: [string, string[]][] = [
  ["default-src", ["'self'"]],
  [
    "script-src",
    [
      "'self'",
      // Next.js renders inline hydration/flight scripts and next/script
      // inline initializers; removing 'unsafe-inline' requires nonce-based
      // rendering, which forces per-request dynamic rendering — rejected.
      "'unsafe-inline'",
      // Dev-only: Next.js dev toolchain evaluates modules. Excluded from
      // production builds.
      ...(isDev ? ["'unsafe-eval'"] : []),
      // Checkfront droplet booking widget (interface--0.js). Bare host on
      // purpose: the embed uses a protocol-relative URL, so an https-only
      // source would break it on the http test/dev servers.
      "seasaba.checkfront.com",
      // GTM container + tags it injects (GA4, Google Ads, Clarity, Meta,
      // Bing UET, Cookiebot uc.js). Tag set lives in the GTM dashboard.
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://www.googleadservices.com",
      "https://*.doubleclick.net",
      "https://www.google.com",
      "https://*.clarity.ms",
      "https://bat.bing.com",
      "https://connect.facebook.net",
      "https://consent.cookiebot.com",
      "https://consentcdn.cookiebot.com",
      // Respond.io Website Chat launcher (widget.js). The chat UI itself
      // lives inside the cdn.respond.io iframe in frame-src below.
      "https://cdn.respond.io",
      // Vercel Live toolbar — only ever loaded on preview deployments.
      "https://vercel.live",
    ],
  ],
  [
    // 'unsafe-inline' covers React style attributes; consentcdn hosts
    // Cookiebot dialog stylesheets.
    "style-src",
    ["'self'", "'unsafe-inline'", "https://consentcdn.cookiebot.com"],
  ],
  [
    // https: stays broad on purpose: GTM delivers tracking-pixel beacons to
    // hosts that change with container config, and third-party content
    // images are low-risk.
    "img-src",
    ["'self'", "data:", "https:"],
  ],
  // next/font self-hosts Open Sans at build time.
  ["font-src", ["'self'"]],
  [
    "connect-src",
    [
      "'self'",
      "seasaba.checkfront.com",
      // Firestore (anonymous read-only). Deliberately narrowed from
      // *.googleapis.com — the browser SDK only talks to this host.
      "https://firestore.googleapis.com",
      // GTM tag destinations (GA4 collect, Ads conversions, Clarity
      // ingest, Meta/Bing beacons, Cookiebot consent API).
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://analytics.google.com",
      "https://region1.google-analytics.com",
      "https://www.googleadservices.com",
      "https://pagead2.googlesyndication.com",
      "https://*.doubleclick.net",
      "https://www.google.com",
      "https://*.clarity.ms",
      "https://bat.bing.com",
      // UET consent/beacon endpoint: bat.js posts consent defaults and
      // updates to bat.bing.net/actionp, a sibling host to bat.bing.com
      // (#169). Exact origin only — no *.bing.net wildcard.
      "https://bat.bing.net",
      "https://connect.facebook.net",
      "https://www.facebook.com",
      "https://consent.cookiebot.com",
      "https://consentcdn.cookiebot.com",
      // Respond.io Website Chat remote-config fetch
      // (GET /webchat/connect?cId=...) issued by widget.js in the top
      // frame — the only respond.io call our CSP governs. The widget's
      // APIs, WebSocket, fonts and assets all run inside its iframe and
      // are governed by that document's own CSP.
      "https://service.respond.io",
      // Sentry ingest — exactly the origin of NEXT_PUBLIC_SENTRY_DSN, added
      // only when a DSN is configured (#129). No *.sentry.io wildcard.
      ...(sentryIngestOrigin ? [sentryIngestOrigin] : []),
    ],
  ],
  [
    "frame-src",
    [
      "'self'",
      "seasaba.checkfront.com",
      // GTM noscript iframe.
      "https://www.googletagmanager.com",
      // Dive-site video embeds (data/dive-site-videos.ts).
      "https://www.youtube.com",
      // Google Ads conversion iframes (GTM-managed).
      "https://www.google.com",
      "https://*.doubleclick.net",
      // Cookiebot consent banner/dialog iframe.
      "https://consentcdn.cookiebot.com",
      // Respond.io Website Chat — the launcher and chat window are a
      // single iframe (chat.html) injected by widget.js.
      "https://cdn.respond.io",
    ],
  ],
  ["media-src", ["'self'"]],
  ["object-src", ["'none'"]],
  ["manifest-src", ["'self'"]],
  ["worker-src", ["'self'"]],
  ["frame-ancestors", ["'self'"]],
  ["base-uri", ["'self'"]],
  ["form-action", ["'self'"]],
  // Deliberately omitted: upgrade-insecure-requests upgrades subresource
  // requests even on the local http test server under WebKit, which breaks
  // the e2e suite — and the site is already HSTS-enforced in production.
];

const csp = cspDirectives.map(([k, v]) => [k, ...v].join(" ")).join("; ");

const nextConfig: NextConfig = {
  // Required for app/global-not-found.tsx — the site uses multiple root
  // layouts (per-locale subtrees), so there is no single root layout to
  // compose a global 404 from (#150).
  experimental: {
    globalNotFound: true,
  },
  async redirects() {
    return legacyRedirects;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // autoplay/fullscreen/picture-in-picture/accelerometer/gyroscope
          // are intentionally absent or already delegated: the YouTube
          // dive-site embed requests them via its allow attribute, and the
          // existing accelerometer/gyroscope blocks do not break playback.
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()",
          },
          {
            // same-origin-allow-popups (not bare same-origin) so
            // Checkfront's redirect/popup hand-offs keep working.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Content-Security-Policy",
            value: csp,
          },
        ],
      },
    ];
  },
};

// Sentry build integration (#129 runtime, #130 releases + source maps).
// org/authToken are env-wired here; the release/source-map/failure policy
// lives in lib/sentry-build.ts so it is unit-testable.
//
// Release identity is deliberately NOT set: the SDK resolves it from
// VERCEL_GIT_COMMIT_SHA on Vercel (then git HEAD) and injects it into the
// bundles as `_sentryRelease`, so the event release, the uploaded source
// maps and the deployed commit are the same SHA. SENTRY_AUTH_TOKEN is a
// build-time secret only — never NEXT_PUBLIC_*.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  ...sentryBuildOptions(),
});
