import { test, expect } from "./fixtures";

// Deterministic internal-link validation: fetch each known public page, collect
// its in-site hrefs, and verify every destination path is a real route and
// every #anchor resolves to an element id on the destination page. No external
// crawling — third-party links are only checked for a safe scheme.

const PUBLIC_PAGES = [
  "/", "/diving", "/dive-sites", "/courses", "/plan-your-trip",
  "/visiting-yachts", "/about", "/contact", "/book", "/dive-log",
  "/partners", "/donate", "/terms", "/privacy", "/cookie-policy",
];

// Static assets and framework URLs that legitimately appear as href/src values.
const ASSET_PATTERN = /^\/(?:_next|images|icons|fonts)\//;
const STATIC_FILE = /\.(?:ico|png|svg|webp|jpg|jpeg|xml|txt|webmanifest)$/i;

test.beforeEach(async ({ browserName }) => {
  test.skip(browserName !== "chromium", "link integrity is browser-independent");
});

test("every internal link on public pages resolves to a real route and anchor", async ({ request }) => {
  const htmlByPage = new Map<string, string>();
  for (const path of PUBLIC_PAGES) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    htmlByPage.set(path, await response.text());
  }

  const brokenPaths: string[] = [];
  const brokenAnchors: string[] = [];
  const insecureLinks: string[] = [];
  const anchorChecks = new Map<string, Set<string>>();

  for (const [pagePath, html] of htmlByPage) {
    // Only anchor hrefs navigate for a visitor; <link>/<script> targets are
    // assets, not routes.
    for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      const href = match[1];
      if (href.startsWith("http://")) {
        insecureLinks.push(`${pagePath} -> ${href}`);
        continue;
      }
      if (!href.startsWith("/") || href.startsWith("//")) continue;

      const [pathWithQuery, hash] = href.split("#");
      const path = pathWithQuery.split("?")[0] || "/";
      if (ASSET_PATTERN.test(path) || STATIC_FILE.test(path)) continue;
      if (!htmlByPage.has(path)) {
        brokenPaths.push(`${pagePath} -> ${href}`);
        continue;
      }
      if (hash) {
        const set = anchorChecks.get(path) ?? new Set<string>();
        set.add(hash);
        anchorChecks.set(path, set);
      }
    }
  }

  for (const [path, ids] of anchorChecks) {
    const html = htmlByPage.get(path)!;
    for (const id of ids) {
      if (!html.includes(`id="${id}"`)) brokenAnchors.push(`${path}#${id}`);
    }
  }

  expect(brokenPaths, "internal links pointing at unknown routes").toEqual([]);
  expect(brokenAnchors, "anchor links with no matching element id").toEqual([]);
  expect(insecureLinks, "insecure http:// links").toEqual([]);
});
