import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ErrorEvent } from "@sentry/nextjs";
import {
  isClarityIcuError,
  isExtensionSendMessageError,
  isInjectedCookiebotError,
  isInjectedMediaFilterError,
  isJsloaderTrackingScriptError,
  isNativeBridgeProbeError,
  isSentryActive,
  isTranslateStackOverflow,
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

function sanitized(event: ErrorEvent): ErrorEvent {
  const result = sanitizeSentryEvent(event);
  expect(result).not.toBeNull();
  return result as ErrorEvent;
}

describe("sanitizeSentryEvent", () => {
  it("strips query/fragment from the request URL and drops the query_string field", () => {
    const event = eventWith({
      request: {
        url: "https://www.seasaba.com/book?item=classic&name=Jane",
        query_string: "item=classic&name=Jane",
      },
    });
    const result = sanitized(event);
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
    const result = sanitized(event);
    expect(result.request?.data).toBeUndefined();
    expect(result.request?.cookies).toBeUndefined();
    expect(result.request?.headers).toBeUndefined();
  });

  it("always drops user context", () => {
    const event = eventWith({
      user: { id: "1", email: "jane@example.com", ip_address: "1.2.3.4" },
    });
    expect(sanitized(event).user).toBeUndefined();
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
    const crumbs = sanitized(event).breadcrumbs as {
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
    const frame = sanitized(event).exception!.values![0].stacktrace!
      .frames![0];
    expect(frame.filename).toBe("https://www.seasaba.com/_next/chunk.js");
    expect(frame.abs_path).toBe("https://www.seasaba.com/_next/chunk.js");
  });
});

describe("isInjectedMediaFilterError (#174)", () => {
  const cloneMessage =
    "Failed to execute 'postMessage' on 'Window': HTMLIFrameElement object could not be cloned.";

  function cloneEvent(frames: object[]): ErrorEvent {
    return eventWith({
      exception: {
        values: [
          {
            type: "DataCloneError",
            value: cloneMessage,
            stacktrace: { frames },
          },
        ],
      },
    });
  }

  it("drops the exact injected signature observed in production", () => {
    // Mirrors events d535aa2d/43ba9ab7: a Respond.io or Clarity top frame
    // touching an iframe, then the injected mediafilter wrapper + setup.js.
    const event = cloneEvent([
      { filename: "src/setup.js" },
      {
        filename: "src/mediafilter.generic-wrapper.min.js",
        function: "Object.mediafilter.<computed> [as debugMessage]",
      },
      { filename: "webchat/widget/widget.js" },
    ]);
    expect(isInjectedMediaFilterError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("matches a mediafilter function frame even without the filename", () => {
    const event = cloneEvent([
      { function: "Object.mediafilter.<computed> [as debugMessage]" },
    ]);
    expect(isInjectedMediaFilterError(event)).toBe(true);
  });

  it("retains an ordinary DataCloneError with no mediafilter frames", () => {
    const event = cloneEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
    ]);
    expect(isInjectedMediaFilterError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a vendor postMessage DataCloneError lacking mediafilter frames", () => {
    // Same message, Respond.io/Clarity stacks only — a genuine vendor defect
    // must keep reporting; the signature requires the foreign frames. Frame
    // paths mirror how Sentry reports them (relative vendor paths).
    const event = cloneEvent([
      { filename: "webchat/widget/widget.js" },
      { filename: "0.8.70/clarity.js" },
    ]);
    expect(isInjectedMediaFilterError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains an app-side postMessage error", () => {
    const event = cloneEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/main-app.js" },
      { filename: "webpack://seasaba-web/lib/analytics.ts" },
    ]);
    expect(isInjectedMediaFilterError(event)).toBe(false);
  });

  it("retains mediafilter frames when the exception is not the clone signature", () => {
    const event = eventWith({
      exception: {
        values: [
          {
            type: "TypeError",
            value: "Cannot read properties of undefined",
            stacktrace: {
              frames: [{ filename: "src/mediafilter.generic-wrapper.min.js" }],
            },
          },
        ],
      },
    });
    expect(isInjectedMediaFilterError(event)).toBe(false);
  });
});

describe("isClarityIcuError (#176)", () => {
  function icuEvent(frames: object[], type = "RangeError"): ErrorEvent {
    return eventWith({
      exception: {
        values: [
          {
            type,
            value: "Internal error. Icu error.",
            stacktrace: { frames },
          },
        ],
      },
    });
  }

  const clarityIcuFrames = [
    // Mirrors event fca810f1: Sentry wrapper catches the callback exception,
    // Clarity startup calls Intl.DateTimeFormat on a browser with broken ICU.
    { filename: "app:///node_modules/@sentry/…", function: "wrapped" },
    { function: "Intl.DateTimeFormat [as DateTimeFormat]" },
    { filename: "0.8.70/clarity.js" },
  ];

  it("drops the exact Clarity ICU signature observed in production", () => {
    const event = icuEvent(clarityIcuFrames);
    expect(isClarityIcuError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("retains the same RangeError message with no Clarity frame", () => {
    const event = icuEvent([
      { function: "Intl.DateTimeFormat [as DateTimeFormat]" },
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
    ]);
    expect(isClarityIcuError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains the Clarity signature without the Intl.DateTimeFormat frame", () => {
    const event = icuEvent([{ filename: "0.8.70/clarity.js" }]);
    expect(isClarityIcuError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a different Clarity exception", () => {
    const event = icuEvent(clarityIcuFrames, "TypeError");
    expect(isClarityIcuError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains an application RangeError", () => {
    const event = icuEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/main-app.js" },
    ]);
    expect(isClarityIcuError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });
});

describe("isExtensionSendMessageError (#176)", () => {
  const sendMessageValue =
    "Invalid call to runtime.sendMessage(). Tab not found.";
  const rejectionMechanism = {
    type: "auto.browser.global_handlers.onunhandledrejection",
  };

  function runtimeEvent(
    value: string,
    mechanism = rejectionMechanism
  ): ErrorEvent {
    return eventWith({
      exception: { values: [{ type: "Error", value, mechanism }] },
    });
  }

  it("drops the exact extension signature observed in production", () => {
    // Mirrors event 3216716e: extension content script loses its tab and its
    // sendMessage() promise rejects into the page's unhandledrejection hook.
    const event = runtimeEvent(sendMessageValue);
    expect(isExtensionSendMessageError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("retains a similar extension-runtime error (different API call)", () => {
    const event = runtimeEvent(
      "Invalid call to runtime.connect(). Tab not found."
    );
    expect(isExtensionSendMessageError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains the same message thrown synchronously (not the rejection path)", () => {
    const event = runtimeEvent(sendMessageValue, {
      type: "auto.browser.global_handlers.onerror",
    });
    expect(isExtensionSendMessageError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a generic unhandled rejection", () => {
    const event = runtimeEvent("fetch failed: network timeout");
    expect(isExtensionSendMessageError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a sendMessage mention with a different message body", () => {
    const event = runtimeEvent(
      "runtime.sendMessage is not a function"
    );
    expect(isExtensionSendMessageError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });
});

describe("isTranslateStackOverflow", () => {
  function overflowEvent(
    frames: object[],
    value = "Maximum call stack size exceeded",
    type = "RangeError"
  ): ErrorEvent {
    return eventWith({
      exception: {
        values: [{ type, value, stacktrace: { frames } }],
      },
    });
  }

  it("drops the translate.goog stack-overflow signature observed in production", () => {
    // Mirrors the /plan-your-trip event: the whole stack is Google
    // Translate machinery running inside www-seasaba-com.translate.goog.
    const event = overflowEvent([
      { filename: "translate_http/.../el_main.js", function: "ka" },
      { filename: "translate_http/.../el_main.js", function: "ma" },
      {
        filename: "https://www-seasaba-com.translate.goog/plan-your-trip",
      },
    ]);
    expect(isTranslateStackOverflow(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("drops the recursion variant whose only evidence is translate_http frames", () => {
    // Mirrors the /about event: same recursion pattern, Translate-only stack.
    const event = overflowEvent([
      { filename: "translate_http/js/element/main/el_main.js" },
      { filename: "translate_http/js/element/main/el_main.js" },
    ]);
    expect(isTranslateStackOverflow(event)).toBe(true);
  });

  it("retains an app-side RangeError: Maximum call stack size exceeded", () => {
    const event = overflowEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
      { filename: "webpack://seasaba-web/components/dive-log-client.tsx" },
    ]);
    expect(isTranslateStackOverflow(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a stack overflow with unrelated vendor frames", () => {
    const event = overflowEvent([{ filename: "0.8.70/clarity.js" }]);
    expect(isTranslateStackOverflow(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a different RangeError even with Translate frames", () => {
    const event = overflowEvent(
      [{ filename: "translate_http/js/element/main/el_main.js" }],
      "Internal error. Icu error."
    );
    expect(isTranslateStackOverflow(event)).toBe(false);
  });

  it("retains a stack overflow reported as a different exception type", () => {
    const event = overflowEvent(
      [{ filename: "translate_http/js/element/main/el_main.js" }],
      "Maximum call stack size exceeded",
      "InternalError"
    );
    expect(isTranslateStackOverflow(event)).toBe(false);
  });

  it("retains an app overflow on a translate.goog-proxied pageview", () => {
    // translate.goog is the proxy host on EVERY frame of a translated
    // pageview — including our own chunks — so it is not machinery
    // evidence on its own.
    const event = overflowEvent([
      {
        filename:
          "https://www-seasaba-com.translate.goog/_next/static/chunks/app.js",
      },
    ]);
    expect(isTranslateStackOverflow(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a mixed stack: Translate machinery plus first-party code", () => {
    // The predicate's conjunction matches, but the first-party veto in
    // sanitizeSentryEvent keeps any event whose stack still runs our code.
    const event = overflowEvent([
      { filename: "translate_http/js/element/main/el_main.js" },
      {
        filename:
          "https://www-seasaba-com.translate.goog/_next/static/chunks/app.js",
      },
    ]);
    expect(isTranslateStackOverflow(event)).toBe(true);
    expect(sanitized(event)).toBeDefined();
  });
});

describe("isInjectedCookiebotError", () => {
  function illegalInvocationEvent(frames: object[], type = "TypeError"): ErrorEvent {
    return eventWith({
      exception: {
        values: [
          {
            type,
            value: "Illegal invocation",
            stacktrace: { frames },
          },
        ],
      },
    });
  }

  it("drops the injected-content + Cookiebot signature observed in production", () => {
    const event = illegalInvocationEvent([
      { filename: "app:///dist/inject_content.js" },
      { filename: "https://consentcdn.cookiebot.com/uc.js" },
    ]);
    expect(isInjectedCookiebotError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("drops the same signature against the Cookiebot cc.js frame", () => {
    const event = illegalInvocationEvent([
      { filename: "app:///dist/inject_content.js" },
      { filename: "https://consent.cookiebot.com/cc.js" },
    ]);
    expect(isInjectedCookiebotError(event)).toBe(true);
  });

  it("retains an app-side Illegal invocation", () => {
    const event = illegalInvocationEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
      { filename: "webpack://seasaba-web/lib/analytics.ts" },
    ]);
    expect(isInjectedCookiebotError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a Cookiebot error without injected-content evidence", () => {
    const event = illegalInvocationEvent([
      { filename: "https://consentcdn.cookiebot.com/uc.js" },
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
    ]);
    expect(isInjectedCookiebotError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains an injected-script error that does not touch Cookiebot", () => {
    const event = illegalInvocationEvent([
      { filename: "app:///dist/inject_content.js" },
      { filename: "app:///gtm.js" },
    ]);
    expect(isInjectedCookiebotError(event)).toBe(false);
  });
});

describe("isNativeBridgeProbeError", () => {
  const bridgeValue =
    "Cannot read properties of undefined (reading 'webkit.messageHandlers')";

  function bridgeEvent(frames: object[], value = bridgeValue): ErrorEvent {
    return eventWith({
      exception: {
        values: [{ type: "TypeError", value, stacktrace: { frames } }],
      },
    });
  }

  it("drops the opaque injected-bridge signature observed in production", () => {
    const event = eventWith({
      exception: {
        values: [
          {
            type: "TypeError",
            value: "window.webkit.messageHandlers is undefined",
            stacktrace: {
              frames: [{ filename: "app:///script.js" }],
            },
          },
        ],
      },
    });
    expect(isNativeBridgeProbeError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("retains the same probe thrown by first-party bundle code", () => {
    // A real future native-wrapper integration runs from /_next/ chunks —
    // those errors must keep reporting.
    const event = bridgeEvent([
      { filename: "app:///script.js" },
      { filename: "app:///_next/static/chunks/app.js" },
    ]);
    expect(isNativeBridgeProbeError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains the same message with no foreign-frame evidence", () => {
    const event = bridgeEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/main-app.js" },
    ]);
    expect(isNativeBridgeProbeError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a probe thrown inside gtm.js — our container is ours to fix", () => {
    const event = bridgeEvent([
      { filename: "app:///script.js" },
      { filename: "app:///gtm.js" },
    ]);
    expect(isNativeBridgeProbeError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains the probe when the gtm.js frame carries its ?id= query string", () => {
    const event = bridgeEvent([
      { filename: "app:///script.js" },
      { filename: "app:///gtm.js?id=GTM-5PFMJFN" },
    ]);
    expect(isNativeBridgeProbeError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains the probe thrown by a webpack module path", () => {
    const event = bridgeEvent([
      { filename: "app:///script.js" },
      { filename: "webpack://seasaba-web/lib/native-bridge.ts" },
    ]);
    expect(isNativeBridgeProbeError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a different error inside an opaque app script", () => {
    const event = bridgeEvent(
      [{ filename: "app:///script.js" }],
      "Cannot read properties of undefined (reading 'foo')"
    );
    expect(isNativeBridgeProbeError(event)).toBe(false);
  });
});

describe("isJsloaderTrackingScriptError", () => {
  const jsloaderValue =
    "Jsloader error (code #0): Error while loading script https://apis.google.com/js/client.js?onload=loadScripts";

  function jsloaderEvent(
    frames: object[],
    value = jsloaderValue,
    type = "CustomError"
  ): ErrorEvent {
    return eventWith({
      exception: {
        values: [{ type, value, stacktrace: { frames } }],
      },
    });
  }

  it("drops the jsloader + tracking_script signature observed in production", () => {
    const event = jsloaderEvent([
      { filename: "app:///tracking_script.js" },
      { filename: "app:///tracking_script.js" },
    ]);
    expect(isJsloaderTrackingScriptError(event)).toBe(true);
    expect(sanitizeSentryEvent(event)).toBeNull();
  });

  it("retains a jsloader failure for a different Google script", () => {
    const event = jsloaderEvent(
      [{ filename: "app:///tracking_script.js" }],
      "Jsloader error (code #0): Error while loading script https://apis.google.com/js/plusone.js"
    );
    expect(isJsloaderTrackingScriptError(event)).toBe(false);
  });

  it("retains the same jsloader message without the injected frame", () => {
    const event = jsloaderEvent([
      { filename: "https://www.seasaba.com/_next/static/chunks/app.js" },
    ]);
    expect(isJsloaderTrackingScriptError(event)).toBe(false);
    expect(sanitized(event)).toBeDefined();
  });

  it("retains a different CustomError inside tracking_script.js", () => {
    const event = jsloaderEvent(
      [{ filename: "app:///tracking_script.js" }],
      "Jsloader error (code #1): Timeout"
    );
    expect(isJsloaderTrackingScriptError(event)).toBe(false);
  });

  it("retains the same signature under a different exception type", () => {
    const event = jsloaderEvent(
      [{ filename: "app:///tracking_script.js" }],
      jsloaderValue,
      "Error"
    );
    expect(isJsloaderTrackingScriptError(event)).toBe(false);
  });
});

describe("first-party stack veto", () => {
  it("retains a multi-exception event whose other exception runs our code", () => {
    // A chained exception: the inner one matches a noise signature, but the
    // outer one is a genuine app error — the event must not be swallowed.
    const event = eventWith({
      exception: {
        values: [
          {
            type: "CustomError",
            value:
              "Jsloader error (code #0): Error while loading script https://apis.google.com/js/client.js",
            stacktrace: {
              frames: [{ filename: "app:///tracking_script.js" }],
            },
          },
          {
            type: "TypeError",
            value: "Cannot read properties of undefined (reading 'dive')",
            stacktrace: {
              frames: [
                {
                  filename:
                    "https://www.seasaba.com/_next/static/chunks/app.js",
                },
                { filename: "webpack://seasaba-web/lib/dive-log.ts" },
              ],
            },
          },
        ],
      },
    });
    expect(isJsloaderTrackingScriptError(event)).toBe(true);
    expect(sanitized(event)).toBeDefined();
  });
});

describe("GTM container tag errors stay reporting", () => {
  it("retains the `$ is not defined` ReferenceError thrown inside gtm.js", () => {
    // The event fires inside our own GTM-5PFMJFN container — tag/config is
    // ours to fix, so it must never be suppressed. Breadcrumb context in
    // production: "GTM PTag v1.4; tagId: 2613447705545" (Pinterest Tag).
    const event = eventWith({
      exception: {
        values: [
          {
            type: "ReferenceError",
            value: "$ is not defined",
            stacktrace: {
              frames: [
                { filename: "app:///gtm.js" },
                { filename: "app:///gtm.js" },
              ],
            },
          },
        ],
      },
      breadcrumbs: [
        { category: "console", message: "GTM PTag v1.4; tagId: 2613447705545" },
      ],
    });
    expect(sanitized(event)).toBeDefined();
  });
});

describe("opaque same-origin script SyntaxError (#176)", () => {
  it("retains a SyntaxError from the deployed Vercel Analytics script path", () => {
    // Event eeefa934: `SyntaxError: Invalid or unexpected token` in
    // app:///0aa4d9c5efab527d/script.js. That file is owned by our own
    // Vercel Web Analytics integration, so the parse failure is a real
    // (likely transient delivery) anomaly — it must keep reporting.
    const event = eventWith({
      exception: {
        values: [
          {
            type: "SyntaxError",
            value: "Invalid or unexpected token",
            stacktrace: {
              frames: [
                {
                  filename: "app:///0aa4d9c5efab527d/script.js",
                  lineno: 1,
                  colno: 2,
                },
              ],
            },
          },
        ],
      },
    });
    expect(sanitized(event)).toBeDefined();
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
});
