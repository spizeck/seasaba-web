import * as Sentry from "@sentry/nextjs";
import {
  isSentryActive,
  sanitizeSentryEvent,
  sentryDeploymentEnv,
  sentryDsn,
} from "@/lib/sentry";

/**
 * Browser SDK init (#129). Next.js loads this file before client code runs.
 *
 * `enabled` is the single hard gate: it is true only on real Vercel
 * Production deployments with a DSN (see lib/sentry.ts). Preview builds,
 * local dev, and test builds all init with enabled:false — the SDK client
 * exists but drops every event, so no preview/local/test traffic can ever
 * reach the sea-saba-web project.
 *
 * Error monitoring only: tracing is sampled at 0, Session Replay is not
 * installed, and dataCollection disables every PII-adjacent category. The
 * shared beforeSend sanitizer additionally strips query strings, request
 * bodies, cookies and headers from every event.
 */
Sentry.init({
  enabled: isSentryActive(),
  dsn: sentryDsn(),
  environment: sentryDeploymentEnv() ?? "unknown",

  // Privacy baseline: never collect user info, cookies, headers, request/
  // response bodies or URL query parameters.
  sendDefaultPii: false,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
  },

  // Error events only — no performance tracing, no Session Replay.
  tracesSampleRate: 0,

  beforeSend: sanitizeSentryEvent,
});

// Required by the SDK for App Router navigation instrumentation. With
// tracesSampleRate: 0 it produces no traffic — it exists so navigations stay
// compatible if tracing is ever deliberately enabled.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
