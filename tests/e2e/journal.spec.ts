import { test, expect } from "./fixtures";

// Journal Phase 1 (#243): index → article click-through, RSS feed, invalid
// slugs, and the footer discovery link. Article slugs are content-driven, so
// the spec discovers them from the index rather than importing the registry
// (lib/journal is server-only and cannot load in a Node test process).

test("footer links to the Journal from public pages", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Journal" })
  ).toHaveAttribute("href", "/journal");
});

test("@smoke journal index links through to an article page", async ({ page }) => {
  const response = await page.goto("/journal");
  expect(response?.status()).toBe(200);

  // Article links are slug-only paths — excludes the /journal/feed.xml link.
  const articleLink = page
    .locator('main a[href^="/journal/"]:not([href*="."])')
    .first();
  const href = await articleLink.getAttribute("href");
  expect(href).toMatch(/^\/journal\/[a-z0-9-]+$/);

  await articleLink.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));

  // Semantic article structure: a single h1 inside <article>, real dates.
  await expect(page.locator("main article h1")).toHaveCount(1);
  await expect(page.locator("main article h1")).toBeVisible();
  await expect(page.locator("article time[datetime]").first()).toBeVisible();
  await expect(page).toHaveTitle(/Journal/);
  // WebKit's client-side nav leaves the previous page's canonical in the DOM
  // alongside the new one (pre-existing Next behavior — reproducible on
  // home→/diving too), so assert the correct canonical is present rather
  // than asserting a single element.
  await expect(
    page.locator(`link[rel="canonical"][href="https://www.seasaba.com${href}"]`)
  ).toHaveCount(1);
  // Article JSON-LD is present and parseable.
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const types = blocks.map((b) => JSON.parse(b)["@type"]);
  expect(types).toContain("Article");
  expect(types).toContain("BreadcrumbList");
});

test("@smoke journal articles expose RSS and article Open Graph metadata", async ({
  page,
}) => {
  await page.goto("/journal");
  const articleLink = page
    .locator('main a[href^="/journal/"]:not([href*="."])')
    .first();
  await articleLink.click();

  await expect(
    page.locator('link[rel="alternate"][type="application/rss+xml"]')
  ).toHaveAttribute("href", "https://www.seasaba.com/journal/feed.xml");
  // Client-side navigation can leave stale head tags from the previous page
  // (a Next.js behavior), so assert the article's own metadata is present
  // rather than asserting head-tag uniqueness.
  await expect(
    page.locator('meta[property="og:type"][content="article"]')
  ).toHaveCount(1);
  await expect(
    page.locator('meta[property="article:published_time"]')
  ).toHaveAttribute("content", /^\d{4}-\d{2}-\d{2}$/);
});

test("journal RSS feed serves a standards-shaped document", async ({
  request,
}) => {
  const response = await request.get("/journal/feed.xml");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/rss+xml");
  const body = await response.text();
  expect(body).toContain('<rss version="2.0"');
  expect(body).toContain("<title>Sea Saba Journal</title>");
  expect(body).toContain("<link>https://www.seasaba.com/journal</link>");
  // One <item> per article linked on the index.
  const index = await request.get("/journal");
  const linked = new Set(
    [...(await index.text()).matchAll(/href="(\/journal\/[a-z0-9-]+)"/g)].map(
      (m) => m[1]
    )
  );
  for (const path of linked) {
    expect(body).toContain(`https://www.seasaba.com${path}`);
  }
});

test("@smoke unknown journal slugs return a genuine 404", async ({
  page,
  monitor,
}) => {
  monitor.allowRequestFailure(/journal\/no-such-story/);
  monitor.allowConsoleError(/no-such-story/);
  const response = await page.goto("/journal/no-such-story");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: /home/i }).first()
  ).toBeVisible();
});
