import { test as base, expect, type Page } from "@playwright/test";

// Browser tests exercise real pages/hydration, but never contact vendor services.
// The catch-all route below aborts every non-localhost request (Checkfront,
// YouTube embeds, analytics, Firestore), so a passing test can never send a
// real booking, message, or tracking beacon.

// Documented benign console-error noise. Everything else fails the test.
const BENIGN_CONSOLE_ERROR = [
  // Our own route.abort produces ERR_BLOCKED_BY_CLIENT for third-party resources.
  /ERR_BLOCKED_BY_CLIENT/,
  // @vercel/analytics requests /_vercel/insights/script.js, which only exists on
  // Vercel deployments; the local test server 404s it.
  /_vercel\/insights/,
  // Firestore is a third-party dependency; when blocked, the SDK logs its own
  // connection errors before the page shows the graceful error state.
  /@firebase\/firestore/,
  /firestore\.googleapis\.com/,
];

// Documented benign first-party request failures.
const BENIGN_REQUEST_FAILURE = [
  // Vercel Analytics script endpoint is absent outside Vercel.
  /\/_vercel\//,
  // WebKit probes for a conventional touch icon the site does not ship.
  /apple-touch-icon/,
];

export function isFirstParty(url: string) {
  try {
    return ["127.0.0.1", "localhost"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

type Monitor = {
  // Tests that intentionally trigger an error response (e.g. the 404 check)
  // register the expected URL/message here so the teardown assertions stay
  // strict for everything else.
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
  page: async ({ page, monitor, browserName, baseURL }, providePage) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const requestFailures: string[] = [];

    // WebKit rejects an in-flight Next.js router prefetch cancelled by page
    // navigation with "Fetch API cannot load <url>?_rsc=… due to access control
    // checks" — its phrasing for an aborted fetch, surfacing as an unhandled
    // rejection from inside Next's router chunk (verified via CI trace:
    // request headers rsc:1 + next-router-prefetch:1 on the same origin).
    // Scoped to WebKit + this exact test origin + the router's _rsc marker, so
    // it cannot mask a real failure: app requests never carry ?_rsc=, and real
    // first-party errors still fail via pageerror/response/requestfailed.
    const host = baseURL ? new URL(baseURL).host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;
    const abortedRscPrefetch = host
      ? new RegExp(`${host}/\\S*\\?_rsc=\\S+ due to access control checks\\.?$`)
      : null;
    const isAbortedRscPrefetch = (text: string) =>
      browserName === "webkit" && !!abortedRscPrefetch && abortedRscPrefetch.test(text);

    page.on("pageerror", (error) => {
      if (isAbortedRscPrefetch(error.message)) return;
      pageErrors.push(error.message);
    });
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const location = message.location()?.url ?? "";
      if (BENIGN_CONSOLE_ERROR.some((pattern) => pattern.test(message.text()) || pattern.test(location))) return;
      if (monitor.allowedConsole.some((pattern) => pattern.test(message.text()) || pattern.test(location))) return;
      if (isAbortedRscPrefetch(message.text())) return;
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
      // navigation-cancelled documents land here and are never a real failure.
      // Chromium reports "net::ERR_ABORTED", WebKit "Load request cancelled".
      const errorText = request.failure()?.errorText ?? "";
      if (errorText === "net::ERR_ABORTED" || errorText === "Load request cancelled") return;
      if (BENIGN_REQUEST_FAILURE.some((pattern) => pattern.test(url))) return;
      if (monitor.allowedRequests.some((pattern) => pattern.test(url))) return;
      requestFailures.push(`${request.failure()?.errorText ?? "failed"} ${url}`);
    });

    await page.route("**/*", async (route) => {
      if (isFirstParty(route.request().url())) await route.continue();
      else await route.abort("blockedbyclient");
    });

    await providePage(page);

    expect(pageErrors, "uncaught browser errors").toEqual([]);
    expect(consoleErrors, "unexpected console errors").toEqual([]);
    expect(requestFailures, "failed first-party requests").toEqual([]);
  },
});

// SSR pages serve interactive markup before React finishes hydrating. A fill or
// click that lands pre-hydration updates the DOM but not React state, and the
// next render silently resets the field (seen on mobile WebKit, which hydrates
// slower than Chromium). Wait until React has attached to the target element —
// post-hydration elements carry internal `__react*` keys — before interacting.
// Probe the deepest element the test will touch, e.g. a form field.
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

// Clicks a named primary-nav destination, opening the mobile menu first when
// the project runs a mobile device profile.
export async function clickNavLink(page: Page, name: string, isMobile?: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name }).click();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name }).click();
  }
}

// Capture outbound window.open calls (WhatsApp handoffs, directions) without
// opening real tabs. Returns a locator-free accessor the test can poll.
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

// Narrowly mocks the Checkfront loader script so widget tests never touch the
// vendor. The stub renders the resolved item_id the widget config passed.
export async function mockCheckfrontScript(page: Page) {
  await page.route("**/lib/interface--0.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `window.DROPLET = { Widget: class { constructor(config) { this.config = config; } render() { document.getElementById(this.config.target).textContent = 'Test availability for item ' + (this.config.item_id || 'all'); } } };`,
    })
  );
}

export { expect };
