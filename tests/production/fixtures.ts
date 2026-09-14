import { test as base, expect, type Page } from "@playwright/test";

// Production smoke fixture. Deliberately separate from tests/e2e/fixtures.ts:
// the local suite blocks ALL non-localhost traffic and mocks vendors, which is
// wrong for post-deployment verification. Here we load the real deployed page
// — including real Firestore reads — while surgically blocking only the
// tag/consent/tracker hosts below so smoke traffic can never emit analytics,
// ads, consent, or Checkfront conversion events. Nothing else is intercepted,
// so first-party failures and uncaught errors stay strict.

// Tracker/tag/consent/vendor hosts aborted before any request leaves the
// browser. Blocking the loaders means no beacon can be sent: GTM carries GA4,
// Ads, Clarity, Meta and the Cookiebot CMP, so one entry silences all of them.
// Checkfront is blocked because loading its widget emits vendor conversion
// tracking (tid=seasaba-website) and its availability is a vendor-owned
// boundary, not a deployment property of this site — the booking test asserts
// the guaranteed fallback instead.
const BLOCKED_HOSTS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googlesyndication.com",
  "googleadservices.com",
  "doubleclick.net",
  "clarity.ms",
  "facebook.net",
  "facebook.com",
  "bat.bing.com",
  "cookiebot.com",
  "checkfront.com",
];

// Vercel Analytics/Speed Insights are served from the site's own origin.
const BLOCKED_FIRST_PARTY_PATH = /^\/_vercel\//;

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isBlocked(url: string, firstPartyHost: string): boolean {
  const host = hostname(url);
  if (!host) return false;
  if (BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
  if (host === firstPartyHost && BLOCKED_FIRST_PARTY_PATH.test(new URL(url).pathname)) return true;
  return false;
}

// Documented benign noise. Everything else fails the test. Keep this list
// shorter than the local suite's: on production, third-party errors we did not
// cause (e.g. a real Firestore outage) are signal, not noise.
const BENIGN_CONSOLE_ERROR = [
  // Our own route.abort produces ERR_BLOCKED_BY_CLIENT for blocked vendors.
  /ERR_BLOCKED_BY_CLIENT/,
];

const BENIGN_REQUEST_FAILURE = [
  // First-party analytics endpoint we deliberately abort.
  /\/_vercel\//,
];

type Monitor = {
  // Tests that intentionally trigger an error response register the expected
  // pattern here so teardown stays strict for everything else.
  allowConsoleError: (pattern: RegExp) => void;
  allowRequestFailure: (pattern: RegExp) => void;
  allowedConsole: RegExp[];
  allowedRequests: RegExp[];
};

export const test = base.extend<{ monitor: Monitor }>({
  monitor: async ({}, provide) => {
    const monitor: Monitor = {
      allowedConsole: [],
      allowedRequests: [],
      allowConsoleError: (pattern) => monitor.allowedConsole.push(pattern),
      allowRequestFailure: (pattern) => monitor.allowedRequests.push(pattern),
    };
    await provide(monitor);
  },
  page: async ({ page, monitor, baseURL }, providePage) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];
    const firstPartyHost = hostname(baseURL ?? "https://www.seasaba.com") ?? "www.seasaba.com";
    const isFirstParty = (url: string) => hostname(url) === firstPartyHost;

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const location = message.location()?.url ?? "";
      if (BENIGN_CONSOLE_ERROR.some((pattern) => pattern.test(message.text()) || pattern.test(location))) return;
      if (monitor.allowedConsole.some((pattern) => pattern.test(message.text()) || pattern.test(location))) return;
      consoleErrors.push(`${message.text()} (${location || "no source"})`);
    });
    page.on("response", (response) => {
      const url = response.url();
      if (!isFirstParty(url) || response.status() < 400) return;
      if (BENIGN_REQUEST_FAILURE.some((pattern) => pattern.test(url))) return;
      if (monitor.allowedRequests.some((pattern) => pattern.test(url))) return;
      requestFailures.push(`${response.status()} ${url}`);
    });
    page.on("requestfailed", (request) => {
      const url = request.url();
      if (!isFirstParty(url)) return;
      // Client-cancelled requests — Next.js prefetch payloads and
      // navigation-cancelled documents are never a real failure.
      const errorText = request.failure()?.errorText ?? "";
      if (errorText === "net::ERR_ABORTED" || errorText === "Load request cancelled") return;
      if (BENIGN_REQUEST_FAILURE.some((pattern) => pattern.test(url))) return;
      if (monitor.allowedRequests.some((pattern) => pattern.test(url))) return;
      requestFailures.push(`${errorText} ${url}`);
    });

    await page.route("**/*", async (route) => {
      if (isBlocked(route.request().url(), firstPartyHost)) await route.abort("blockedbyclient");
      else await route.continue();
    });

    await providePage(page);

    expect(pageErrors, "uncaught browser errors").toEqual([]);
    expect(consoleErrors, "unexpected console errors").toEqual([]);
    expect(requestFailures, "failed first-party requests").toEqual([]);
  },
});

// SSR pages serve interactive markup before React finishes hydrating; waits
// for React attachment before any fill/click. Same mechanism as the local
// suite — probing is read-only and safe against production.
export async function waitForHydration(page: Page, selector = "#main-content") {
  await page.locator(selector).first().waitFor();
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return !!el && Object.keys(el).some((key) => key.startsWith("__react"));
    },
    selector
  );
}

export async function hydratedGoto(page: Page, url: string, hydrateProbe?: string) {
  const response = await page.goto(url);
  await waitForHydration(page, hydrateProbe);
  return response;
}

// Captures outbound window.open calls in THIS test browser only, so a
// validation experiment can prove nothing was opened or sent. This never
// changes what production serves to real visitors.
export async function stubWindowOpen(page: Page, key = "handoffCalls") {
  await page.addInitScript((k) => {
    const calls: string[] = [];
    (window as unknown as Record<string, unknown>)[k] = calls;
    window.open = (url) => {
      calls.push(String(url));
      return null;
    };
  }, key);
}

export function windowOpenCalls(page: Page, key = "handoffCalls"): Promise<string[]> {
  return page.evaluate((k) => (window as unknown as Record<string, string[]>)[k] ?? [], key);
}

export { expect };
