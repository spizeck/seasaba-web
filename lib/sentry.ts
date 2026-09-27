import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

/**
 * Centralized Sentry activation + privacy decisions (#129).
 *
 * One authoritative gate — `isSentryActive()` — is used by the browser init
 * (instrumentation-client.ts) and the Node init (sentry.server.config.ts), so
 * every surface agrees on whether Sentry may emit events.
 *
 * Hard rule: Sentry is active ONLY on real Vercel Production deployments with
 * a configured DSN. Vercel Preview builds also run `NODE_ENV=production`
 * Next.js builds, so NODE_ENV is deliberately NOT part of this decision.
 * Missing or partial configuration always fails closed (Sentry inert).
 *
 * This module is isomorphic: it reads only NEXT_PUBLIC_* / platform env vars,
 * which are inlined for the browser bundle and read live on the server.
 */

/** Vercel deployment context: "production" | "preview" | "development" | undefined off-Vercel. */
export function sentryDeploymentEnv(): string | undefined {
  // NEXT_PUBLIC_VERCEL_ENV is exposed to server AND inlined into the browser
  // bundle by Vercel's system-env-var auto-exposure. VERCEL_ENV covers server
  // contexts where the unprefixed name is present; in the browser bundle it
  // inlines to undefined.
  return process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.VERCEL_ENV;
}

/** The public Sentry DSN — safe to expose to the browser; it only permits event ingestion. */
export function sentryDsn(): string | undefined {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  return dsn && dsn.trim() !== "" ? dsn : undefined;
}

/**
 * True only when events may actually leave this process: a Vercel Production
 * deployment with a DSN. Everything else — Preview, local dev, unit/E2E/CI —
 * is inert even though production-mode builds run in some of those places.
 */
export function isSentryActive(): boolean {
  return sentryDeploymentEnv() === "production" && sentryDsn() !== undefined;
}

/**
 * Drop the query string and fragment from a URL while keeping origin + path.
 * String-based so it works for absolute URLs, protocol-relative URLs and
 * paths alike — customer data travels in query params (e.g. /book?item=…,
 * /contact?interest=…, mailto/referrer URLs), never in our static paths.
 */
export function stripUrlSensitiveParts(url: string): string {
  const cut = url.search(/[?#]/);
  return cut < 0 ? url : url.slice(0, cut);
}

function isBreadcrumbList(value: unknown): value is Breadcrumb[] {
  return Array.isArray(value);
}

/**
 * Detect the injected-mediafilter DataCloneError (#174).
 *
 * Some visitors' browsers run injected software — an extension, content
 * filter, or AV web shield — that monkey-patches iframe property getters
 * (`contentWindow`, `contentDocument`). Its `mediafilter.debugMessage` path
 * calls `postMessage()` with the HTMLIFrameElement itself in the payload,
 * which structured clone rejects, throwing inside the injected code. The
 * files (`src/mediafilter.generic-wrapper.min.js`, `src/setup.js`) exist
 * nowhere in this repo or the deployed bundle — production serves 404 for
 * both — and the signature does not reproduce in a clean Chromium/WebKit.
 * Respond.io and Clarity only trigger the wrapped getter; nothing on our
 * side passes a DOM element to postMessage.
 *
 * The match is deliberately conjunctional so no legitimate error is hidden:
 * BOTH the exact clone-failure message AND a `mediafilter` frame must be
 * present. An app-side or vendor-side `postMessage` DataCloneError without
 * the injected frames still reports, as does any other error type.
 */
export function isInjectedMediaFilterError(event: ErrorEvent): boolean {
  for (const exception of event.exception?.values ?? []) {
    const isIframeCloneFailure =
      exception.type === "DataCloneError" &&
      typeof exception.value === "string" &&
      exception.value.includes("postMessage") &&
      exception.value.includes("HTMLIFrameElement") &&
      exception.value.includes("could not be cloned");
    if (!isIframeCloneFailure) continue;

    if (stackContains(exception, "mediafilter")) return true;
  }
  return false;
}

/**
 * Microsoft Clarity's known ICU crash (#176): `clarity.js` invokes
 * `Intl.DateTimeFormat` during startup and the browser's ICU data throws
 * `RangeError: Internal error. Icu error.` — a vendor/browser-runtime
 * defect (degraded or minimal ICU builds), not a Sea Saba code path. The
 * filter requires the conjunction of the exact ICU message, a `clarity.js`
 * frame AND an `Intl.DateTimeFormat` frame, so a same-message RangeError
 * outside Clarity and any other Clarity exception still report.
 */
export function isClarityIcuError(event: ErrorEvent): boolean {
  for (const exception of event.exception?.values ?? []) {
    const isIcuRangeError =
      exception.type === "RangeError" &&
      typeof exception.value === "string" &&
      exception.value.includes("Internal error. Icu error.");
    if (!isIcuRangeError) continue;

    if (
      stackContains(exception, "clarity.js") &&
      stackContains(exception, "Intl.DateTimeFormat")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Browser-extension runtime noise (#176): `Invalid call to
 * runtime.sendMessage(). Tab not found.` can only originate from an
 * extension's `chrome.runtime`/`browser.runtime` call whose target tab
 * closed mid-handshake — page JavaScript has no `runtime.sendMessage` and
 * no site integration (GTM, Clarity, Cookiebot, Respond.io, Vercel
 * Analytics) uses extension APIs. It surfaces as an unhandled rejection in
 * the page's global handler. The filter requires the exact message AND the
 * unhandledrejection mechanism, so any different runtime error — or a
 * genuine app rejection — still reports.
 */
export function isExtensionSendMessageError(event: ErrorEvent): boolean {
  for (const exception of event.exception?.values ?? []) {
    if (
      typeof exception.value === "string" &&
      exception.value.includes(
        "Invalid call to runtime.sendMessage(). Tab not found"
      ) &&
      exception.mechanism?.type ===
        "auto.browser.global_handlers.onunhandledrejection"
    ) {
      return true;
    }
  }
  return false;
}

/** True when any stack frame's filename or function name contains `needle`. */
function stackContains(
  exception: {
    stacktrace?: { frames?: { filename?: string; function?: string }[] };
  },
  needle: string
): boolean {
  return (exception.stacktrace?.frames ?? []).some(
    (frame) =>
      (typeof frame.filename === "string" &&
        frame.filename.includes(needle)) ||
      (typeof frame.function === "string" &&
        frame.function.includes(needle))
  );
}

/**
 * Suppression rules, each proven by issue-level attribution and each a
 * conjunction of (exact error signature) × (foreign/vendor stack evidence).
 * A rule must name the external defect it suppresses and must never fire on
 * a neighboring legitimate event — see tests/unit/sentry.test.ts.
 */
const KNOWN_FOREIGN_NOISE: ReadonlyArray<(event: ErrorEvent) => boolean> = [
  isInjectedMediaFilterError,
  isClarityIcuError,
  isExtensionSendMessageError,
];

/**
 * Centralized `beforeSend` sanitizer, shared by browser and server events.
 *
 * Returns `null` only for events matching a `KNOWN_FOREIGN_NOISE` rule —
 * foreign injected or vendor code that the site cannot fix and that is pure
 * telemetry noise. Everything else is returned sanitized.
 *
 * Defense in depth on top of `dataCollection`/`sendDefaultPii` init options —
 * this runs for EVERY event regardless of which integration produced it, so
 * no call site has to remember to sanitize. What Sentry may keep: route/path
 * information, stack frames, release/environment, breadcrumbs' sanitized
 * URLs. What it never keeps: query strings, fragments, request bodies,
 * cookies, headers (incl. Referer/Authorization), user context.
 */
export function sanitizeSentryEvent(event: ErrorEvent): ErrorEvent | null {
  // Drop events proven to originate from foreign injected/vendor code (see
  // KNOWN_FOREIGN_NOISE — #174 mediafilter, #176 Clarity ICU, #176
  // extension runtime.sendMessage). Each rule requires its full signature;
  // anything else falls through untouched.
  if (KNOWN_FOREIGN_NOISE.some((isForeignNoise) => isForeignNoise(event))) {
    return null;
  }

  // No user context — ever. Redundant with dataCollection.userInfo:false, but
  // guarantees nothing downstream can re-attach identity.
  delete event.user;

  if (event.request) {
    if (typeof event.request.url === "string") {
      event.request.url = stripUrlSensitiveParts(event.request.url);
    }
    // Query strings can carry booking references, contact interest and other
    // visitor-entered values.
    delete event.request.query_string;
    // Request bodies may contain customer names, emails, WhatsApp numbers and
    // free-text messages (contact form, Checkfront hand-offs).
    delete event.request.data;
    // Cookies and arbitrary request headers (Referer, Authorization, …) are
    // dropped wholesale — none are needed to debug a marketing site.
    delete event.request.cookies;
    delete event.request.headers;
  }

  // Breadcrumb URLs (navigation, fetch/xhr, history) get the same treatment.
  const breadcrumbs = isBreadcrumbList(event.breadcrumbs)
    ? event.breadcrumbs
    : undefined;
  for (const crumb of breadcrumbs ?? []) {
    if (!crumb.data) continue;
    for (const key of ["url", "to", "from"] as const) {
      const value = crumb.data[key];
      if (typeof value === "string") crumb.data[key] = stripUrlSensitiveParts(value);
    }
  }

  // Stack frame URLs are app/module paths; strip defensively anyway.
  for (const exception of event.exception?.values ?? []) {
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (typeof frame.filename === "string") {
        frame.filename = stripUrlSensitiveParts(frame.filename);
      }
      if (typeof frame.abs_path === "string") {
        frame.abs_path = stripUrlSensitiveParts(frame.abs_path);
      }
    }
  }

  return event;
}
