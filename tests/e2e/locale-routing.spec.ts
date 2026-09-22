import { test, expect } from "./fixtures";

const PUBLIC_ROUTES = [
  "/",
  "/diving",
  "/dive-sites",
  "/courses",
  "/plan-your-trip",
  "/about",
  "/contact",
  "/book",
  "/dive-log",
  "/partners",
  "/terms",
  "/privacy",
  "/cookie-policy",
  "/visiting-yachts",
];

test.describe("locale routing foundation (#150)", () => {
  test("every English public route stays unprefixed with lang=en and an unprefixed canonical", async ({
    request,
  }) => {
    for (const path of PUBLIC_ROUTES) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect(html, path).toContain('<html lang="en"');
      expect(html, path).toContain(
        `<link rel="canonical" href="https://www.seasaba.com${path === "/" ? "" : path}"`
      );
      // No page may advertise a Dutch URL before #151 lands approved content.
      expect(html, path).not.toContain('href="/nl');
      expect(html, path).not.toContain('hrefLang="nl"');
    }
  });

  test("locale-prefixed and unknown paths 404 safely inside the site shell", async ({
    page,
    monitor,
  }) => {
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const path of ["/nl", "/nl/diving", "/nl/plan-your-trip", "/xx", "/xx/diving", "/en", "/en/diving"]) {
      monitor.allowRequestFailure(new RegExp(escapeRegExp(path)));
      monitor.allowConsoleError(new RegExp(escapeRegExp(path)));
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
      // Styled 404 inside the site shell — not Next's bare default page.
      await expect(page.getByText("Page not found")).toBeVisible();
    }
  });

  test("browser Accept-Language never forces a locale redirect", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: "nl-NL",
      extraHTTPHeaders: { "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8" },
    });
    const page = await context.newPage();
    const response = await page.goto("/diving");
    expect(response?.status()).toBe(200);
    // The English URL stays English — no redirect to /nl, no locale swap.
    expect(page.url()).toContain("/diving");
    expect(page.url()).not.toContain("/nl/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await context.close();
  });

  test("technical routes and static assets are not captured by locale routing", async ({
    request,
  }) => {
    for (const path of ["/robots.txt", "/sitemap.xml", "/manifest.json", "/favicon.ico", "/apple-icon.png"]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
    }
    // A real framework asset: any _next chunk referenced by the homepage.
    const home = await request.get("/");
    const asset = (await home.text()).match(/\/_next\/static\/[^"]+\.(?:css|js)/)?.[0];
    expect(asset).toBeTruthy();
    expect((await request.get(asset!)).status()).toBe(200);
  });

  test("query parameters survive and keep their noindex semantics", async ({
    request,
  }) => {
    const response = await request.get("/book?item=classic-2-tank");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('name="robots" content="noindex');
  });

  test("deep-link anchors still resolve on English pages", async ({
    request,
  }) => {
    const html = await (await request.get("/plan-your-trip")).text();
    for (const id of ["where-to-stay", "getting-here", "snorkeling"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });
});
