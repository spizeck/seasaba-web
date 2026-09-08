import { expect, it } from "vitest";
import { createMetadata } from "@/lib/metadata";
import { legacyRedirects } from "@/data/redirects";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

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
it("advertises production-critical pages on the correct domain", () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const path of ["", "/diving", "/book", "/contact", "/dive-log", "/courses", "/plan-your-trip"]) expect(urls).toContain(`https://www.seasaba.com${path}`);
  expect(new Set(urls).size).toBe(urls.length);
  expect(robots().sitemap).toBe("https://www.seasaba.com/sitemap.xml");
});
