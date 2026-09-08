import { test, expect } from "./fixtures";
import { legacyRedirects } from "../../data/redirects";

const routes = ["/", "/diving", "/dive-sites", "/courses", "/plan-your-trip", "/about", "/contact", "/book", "/dive-log", "/partners", "/terms", "/privacy", "/cookie-policy"];
for (const path of routes) {
  test(`@smoke public page ${path} renders without authentication`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(page).toHaveTitle(path === "/" ? "Professional Scuba Diving in Saba" : /Sea Saba/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /\S+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://www.seasaba.com${path === "/" ? "" : path}`);
  });
}
test("@smoke unknown routes return a genuine 404", async ({ page }) => {
  expect((await page.goto("/this-page-does-not-exist"))?.status()).toBe(404);
  await expect(page.getByRole("link", { name: /home/i }).first()).toBeVisible();
});
test("@smoke server headers, sitemap and robots are present", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'self'");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("https://www.seasaba.com/book");
  expect(sitemapBody).not.toContain("/diving/first-dive");
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://www.seasaba.com/sitemap.xml");
});
test("legacy URLs resolve with 301s and their destination anchors exist", async ({ request }) => {
  for (const redirect of legacyRedirects) {
    const response = await request.get(redirect.source, { maxRedirects: 0 });
    expect(response.status(), redirect.source).toBe(301);
    expect(response.headers().location, redirect.source).toBe(redirect.destination);
  }
  const destinations = [...new Set(legacyRedirects.map((r) => r.destination).filter((url) => url.startsWith("/")))];
  for (const destination of destinations) {
    const [path, hash] = destination.split("#");
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    if (hash) expect(await response.text(), destination).toContain(`id="${hash}"`);
  }
});
