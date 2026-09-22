import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMetadata } from "@/lib/metadata";
import { legacyRedirects } from "@/data/redirects";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

const CANONICAL_ROUTES = [
  "/",
  "/diving",
  "/dive-sites",
  "/book",
  "/plan-your-trip",
  "/courses",
  "/dive-log",
  "/visiting-yachts",
  "/about",
  "/contact",
  "/partners",
  "/terms",
  "/privacy",
  "/cookie-policy",
];

it("creates canonical website metadata without query parameters", () => {
  const result = createMetadata({ title: "Book", path: "/book", searchParams: { item: "classic" } });
  expect(result.alternates?.canonical).toBe("https://www.seasaba.com/book");
  expect(result.robots).toEqual({ index: false, follow: true });
  expect(result.openGraph).toMatchObject({ url: "https://www.seasaba.com/book", title: "Book", siteName: "Sea Saba" });
});
it("indexes clean pages but honors explicit noindex", () => {
  expect(createMetadata({ title: "Home" }).robots).toBeUndefined();
  expect(createMetadata({ title: "Page", searchParams: {} }).robots).toBeUndefined();
  expect(createMetadata({ title: "Page", noIndex: true }).robots).toEqual({ index: false, follow: true });
});
it("preserves unique single-hop permanent legacy redirects", () => {
  const sources = legacyRedirects.map((r) => r.source);
  expect(new Set(sources).size).toBe(sources.length);
  for (const redirect of legacyRedirects) {
    expect(redirect.statusCode).toBe(301);
    expect(redirect.destination).toMatch(/^(\/|https:\/\/)/);
    expect(sources).not.toContain(redirect.destination.split(/[?#]/)[0]);
  }
});

describe("sitemap", () => {
  it("lists exactly the canonical public routes on the canonical host", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect([...urls].sort()).toEqual(
      CANONICAL_ROUTES.map((p) => `https://www.seasaba.com${p}`).sort()
    );
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("never includes a legacy redirect source or a query variant", () => {
    const urls = sitemap().map((entry) => entry.url);
    const paths = urls.map((u) => new URL(u).pathname);
    for (const r of legacyRedirects) {
      expect(paths, `redirect source ${r.source} must not be in the sitemap`).not.toContain(r.source);
    }
    expect(urls.every((u) => !u.includes("?"))).toBe(true);
  });

  it("does not emit a mechanically generated lastModified", () => {
    // Issue #108: build/request-time `new Date()` is a fake freshness signal;
    // the field stays absent until a real content-modification source exists.
    for (const entry of sitemap()) {
      expect(entry.lastModified).toBeUndefined();
    }
  });
});

describe("robots", () => {
  it("allows all crawlers via the wildcard and references the sitemap", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules).toContainEqual({ userAgent: "*", allow: "/" });
    expect(r.sitemap).toBe("https://www.seasaba.com/sitemap.xml");
  });
});

describe("llms.txt", () => {
  const llms = () =>
    readFileSync(join(__dirname, "../../public/llms.txt"), "utf8");

  it("exists and links every canonical indexable page on the canonical host", () => {
    const text = llms();
    for (const path of CANONICAL_ROUTES) {
      expect(text).toContain(`https://www.seasaba.com${path === "/" ? "" : path}`);
    }
  });

  it("is a concise index, not duplicated page content", () => {
    const text = llms();
    // Link-only index: under ~4KB and every non-heading line points at a URL.
    expect(text.length).toBeLessThan(4096);
    expect(text).not.toContain("llms-full");
  });
});
