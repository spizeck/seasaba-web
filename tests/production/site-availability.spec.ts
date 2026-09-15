import { test, expect, hydratedGoto } from "./fixtures";

// Post-deployment availability and render integrity for the highest-value
// public routes. Assertions target deployment invariants (route serves, page
// identity via h1/canonical, metadata present), not styling or body copy.

const CRITICAL_ROUTES = [
  { path: "/", h1: "Dive the Extraordinary.", title: "Professional Scuba Diving in Saba" },
  { path: "/diving", h1: "Diving with Sea Saba" },
  { path: "/courses", h1: "Learn to Dive with Sea Saba" },
  { path: "/plan-your-trip", h1: "Plan Your Trip to Saba" },
  { path: "/contact", h1: "Contact Us" },
  { path: "/book", h1: "Book Your Dive" },
  { path: "/dive-sites", h1: "Saba Dive Sites" },
];

for (const route of CRITICAL_ROUTES) {
  test(`critical route ${route.path} renders its expected page`, async ({ page }) => {
    const response = await page.goto(route.path);
    expect(response?.status(), route.path).toBe(200);

    const h1 = page.locator("main h1");
    await expect(h1, `${route.path} must render exactly one main heading`).toHaveCount(1);
    await expect(h1).toBeVisible();
    // The h1 is the deliberate page-identity invariant: it proves the right
    // page was deployed, not just that some page answered.
    await expect(h1).toHaveText(new RegExp(route.h1));
    await expect(page).toHaveTitle(route.title ?? /Sea Saba/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    // Canonical doubles as a served-the-correct-page check.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://www.seasaba.com${route.path === "/" ? "" : route.path}`
    );
    // No Next.js/server error surface.
    await expect(page.getByText("Application error")).toHaveCount(0);
    await expect(page.getByText("Internal Server Error")).toHaveCount(0);
    await expect(page.getByText("This page could not be found")).toHaveCount(0);
    // The header navigation a customer uses to leave this page must exist.
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });
}

test("critical internal navigation paths work on the deployed site", async ({ page }) => {
  // Homepage -> diving information.
  await hydratedGoto(page, "/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Diving" }).click();
  await expect(page).toHaveURL(/\/diving$/);
  await expect(page.getByRole("heading", { name: "Diving with Sea Saba" })).toBeVisible();

  // Header -> booking entry point (internal link only; no external handoff).
  await page.getByRole("link", { name: "Book Now" }).click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();

  // Course information -> the next informational step (contact inquiry).
  await hydratedGoto(page, "/courses");
  await page.getByRole("link", { name: "Request Try Scuba Info" }).click();
  await expect(page).toHaveURL(/\/contact\?interest=try-scuba/);
  await expect(page.getByRole("heading", { name: "Try Scuba Inquiry" })).toBeVisible();
});

test("critical static assets load", async ({ page, request }) => {
  const favicon = await request.get("/favicon.ico");
  expect(favicon.status()).toBe(200);

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const logo = page.getByRole("img", { name: "Sea Saba logo" }).first();
  await expect(logo).toBeVisible();
  // naturalWidth > 0 proves the image bytes actually loaded and decoded.
  expect(await logo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  // Any other failed first-party asset (JS/CSS chunks, images) fails via the
  // fixture's request monitor — no per-asset list needed.
});

test("production TTFB stays within a generous deployment-health bound", async ({ request }) => {
  // Not a Lighthouse budget — just a catastrophic-regression tripwire on the
  // live edge. Generous bound tolerates cold misses; anything slower means the
  // deployment or host config needs eyes, not tuning. Real budgets live in
  // scripts/perf-baseline.mjs (lab) and field data (RUM).
  const start = Date.now();
  const response = await request.get("/");
  const elapsed = Date.now() - start;
  expect(response.status()).toBe(200);
  console.log(`GET / TTFB-ish (client wall clock): ${elapsed}ms`);
  expect(elapsed).toBeLessThan(3000);
});

test("security headers, robots.txt and sitemap.xml are production-sane", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  const headers = home.headers();
  expect(headers["strict-transport-security"]).toContain("max-age=63072000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  const csp = headers["content-security-policy"];
  expect(csp).toContain("frame-ancestors 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("https://consentcdn.cookiebot.com");
  expect(csp).not.toContain("'unsafe-eval'");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin-allow-popups");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Sitemap: https://www.seasaba.com/sitemap.xml");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("<urlset");
  expect(sitemapBody).toContain("https://www.seasaba.com/book");
  expect(sitemapBody).not.toContain("/diving/first-dive");
});

test("canonical host behaviour: apex and http redirect to https://www.seasaba.com", async ({ request, baseURL }) => {
  test.skip(
    new URL(baseURL ?? "https://www.seasaba.com").hostname !== "www.seasaba.com",
    "canonical-host checks only apply when the target is production"
  );
  const apex = await request.get("https://seasaba.com/", { maxRedirects: 0 });
  expect(apex.status()).toBe(308);
  expect(apex.headers().location).toBe("https://www.seasaba.com/");

  const httpWww = await request.get("http://www.seasaba.com/", { maxRedirects: 0 });
  expect(httpWww.status()).toBe(308);
  expect(httpWww.headers().location).toBe("https://www.seasaba.com/");

  const httpApex = await request.get("http://seasaba.com/", { maxRedirects: 0 });
  expect(httpApex.status()).toBe(308);
  expect(httpApex.headers().location).toBe("https://seasaba.com/");
});

test("a representative legacy Wix URL still redirects", async ({ request }) => {
  // Spot-checks the deployed redirect pipeline without re-running the full
  // local table. Verifies real customer/bookmark traffic still lands on /book.
  const response = await request.get("/book-saba-diving-online", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers().location).toBe("/book");
});

test("unknown routes return a genuine 404", async ({ page, monitor }) => {
  // The 404 response and its console error are the expected outcome here.
  monitor.allowRequestFailure(/this-page-does-not-exist/);
  monitor.allowConsoleError(/this-page-does-not-exist/);
  expect((await page.goto("/this-page-does-not-exist"))?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible();
});
