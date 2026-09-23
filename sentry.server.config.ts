import * as Sentry from "@sentry/nextjs";
import {
  isSentryActive,
  sanitizeSentryEvent,
  sentryDeploymentEnv,
  sentryDsn,
} from "@/lib/sentry";

/**
 * Node.js server SDK init (#129), loaded by instrumentation.ts register().
 *
 * Same centralized gate as the browser: enabled only on Vercel Production
 * with a DSN. Server events get the identical sanitizer and the identical
 * no-PII dataCollection posture, so contact-form bodies, cookies, headers
 * and query strings can never leave via a server error either.
 */
Sentry.init({
  enabled: isSentryActive(),
  dsn: sentryDsn(),
  environment: sentryDeploymentEnv() ?? "unknown",

  sendDefaultPii: false,
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
  },

  // Error monitoring baseline — no performance tracing.
  tracesSampleRate: 0,

  beforeSend: sanitizeSentryEvent,
});
