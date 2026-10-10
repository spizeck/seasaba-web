import { describe, expect, it } from "vitest";
import { createElement } from "react";
import {
  JOURNAL_CATEGORIES,
  type JournalArticle,
} from "@/data/journal/types";
import { JOURNAL_ARTICLES } from "@/data/journal";
import {
  JOURNAL_FEED_PATH,
  JOURNAL_NAME,
  JOURNAL_PATH,
  articleJsonLd,
  articlePath,
  articleUrl,
  categoryFromSlug,
  categorySlug,
  formatJournalDate,
  getArticle,
  getRelatedArticles,
  journalFeedXml,
  listArticles,
  validateArticle,
  validateRegistry,
} from "@/lib/journal";
import { BUSINESS_ID, SITE_URL } from "@/lib/constants";

const validBody = createElement("p", null, "Body text.");

function fixture(overrides: Partial<JournalArticle> = {}): JournalArticle {
  return {
    slug: "test-article",
    title: "Test Article",
    description: "A short test description.",
    publishedAt: "2026-01-15",
    category: "Diving Saba",
    author: { name: "Sea Saba", type: "Organization" },
    hero: { src: "/images/optimized/test.webp", alt: "Descriptive alt text" },
    body: validBody,
    ...overrides,
  };
}

describe("article schema validation", () => {
  it("accepts the committed registry and every article is a valid element-bearing record", () => {
    expect(() => validateRegistry(JOURNAL_ARTICLES)).not.toThrow();
    for (const article of JOURNAL_ARTICLES) {
      expect(validateArticle(article)).toEqual([]);
    }
  });

  it("accepts a well-formed fixture", () => {
    expect(validateArticle(fixture())).toEqual([]);
    expect(validateArticle(fixture({ demo: true, updatedAt: "2026-02-01", related: ["a", "b"], cta: { label: "Go", href: "/diving" } }))).toEqual([]);
  });

  it("rejects malformed fields with a named problem each", () => {
    const bad = fixture({
      slug: "Not A Slug!",
      title: " ",
      description: "",
      publishedAt: "October 1, 2026",
      category: "Opinion" as JournalArticle["category"],
      author: { name: "" },
      hero: { src: "https://example.com/x.jpg", alt: "" },
      cta: { label: "", href: "http://insecure.example.com" },
      body: null,
    });
    const problems = validateArticle(bad);
    expect(problems.join("\n")).toMatch(/slug must be kebab-case/);
    expect(problems.join("\n")).toMatch(/title is required/);
    expect(problems.join("\n")).toMatch(/description\/dek is required/);
    expect(problems.join("\n")).toMatch(/publishedAt must be an ISO date/);
    expect(problems.join("\n")).toMatch(/category must be one of/);
    expect(problems.join("\n")).toMatch(/author\.name is required/);
    expect(problems.join("\n")).toMatch(/hero\.src must be a \/images\//);
    expect(problems.join("\n")).toMatch(/hero\.alt/);
    expect(problems.join("\n")).toMatch(/cta needs both label and href|cta\.href must be/);
    expect(problems.join("\n")).toMatch(/body must be a JSX element/);
  });

  it("rejects reserved route-segment slugs", () => {
    expect(validateArticle(fixture({ slug: "feed" })).join("\n")).toMatch(
      /reserved/
    );
    // A slug can never carry a dot — "feed.xml" fails kebab-case outright,
    // so it can never collide with the static feed segment either.
    expect(validateArticle(fixture({ slug: "feed.xml" })).join("\n")).toMatch(
      /kebab-case/
    );
  });

  it("rejects updatedAt before publishedAt and non-ISO updatedAt", () => {
    expect(
      validateArticle(fixture({ updatedAt: "2025-12-31" })).join("\n")
    ).toMatch(/updatedAt cannot predate publishedAt/);
    expect(
      validateArticle(fixture({ updatedAt: "next week" })).join("\n")
    ).toMatch(/updatedAt must be an ISO date/);
  });

  it("fails the registry on duplicate slugs and dangling related links", () => {
    const a = fixture({ slug: "one" });
    const dup = fixture({ slug: "one" });
    expect(() => validateRegistry([a, dup])).toThrow(/duplicate slug/);

    const dangling = fixture({ slug: "two", related: ["missing"] });
    expect(() => validateRegistry([a, dangling])).toThrow(
      /related slug "missing" does not exist/
    );

    const selfish = fixture({ slug: "three", related: ["three"] });
    expect(() => validateRegistry([a, selfish])).toThrow(
      /cannot list itself as related/
    );
  });
});

describe("content API", () => {
  it("lists articles newest-first with a deterministic tiebreak", () => {
    const articles = listArticles();
    expect(articles).toHaveLength(JOURNAL_ARTICLES.length);
    const sorted = [...articles].sort(
      (a, b) =>
        b.publishedAt.localeCompare(a.publishedAt) ||
        a.slug.localeCompare(b.slug)
    );
    expect(articles.map((a) => a.slug)).toEqual(sorted.map((a) => a.slug));
    // Never mutates the registry in place across calls.
    expect(listArticles().map((a) => a.slug)).toEqual(
      articles.map((a) => a.slug)
    );
  });

  it("resolves articles by slug and returns undefined for unknown slugs", () => {
    const first = listArticles()[0];
    expect(getArticle(first.slug)?.title).toBe(first.title);
    expect(getArticle("no-such-article")).toBeUndefined();
    expect(getArticle("feed.xml")).toBeUndefined();
  });

  it("maps categories to URL slugs and back", () => {
    for (const category of JOURNAL_CATEGORIES) {
      expect(categoryFromSlug(categorySlug(category))).toBe(category);
      expect(categorySlug(category)).toMatch(/^[a-z0-9-]+$/);
    }
    expect(categoryFromSlug("not-a-category")).toBeUndefined();
  });

  it("builds durable public paths and absolute URLs", () => {
    const article = fixture();
    expect(articlePath(article)).toBe(`${JOURNAL_PATH}/test-article`);
    expect(articleUrl(article)).toBe(`${SITE_URL}${JOURNAL_PATH}/test-article`);
  });

  it("formats ISO dates in a stable long form", () => {
    expect(formatJournalDate("2026-10-09")).toBe("October 9, 2026");
    expect(formatJournalDate("2026-01-01")).toBe("January 1, 2026");
  });
});

describe("related articles", () => {
  it("honors explicit related slugs in order", () => {
    const article = JOURNAL_ARTICLES.find((a) => a.related?.length)!;
    const related = getRelatedArticles(article);
    expect(related.map((a) => a.slug)).toEqual(article.related);
  });

  it("prefers same-category recency, excludes self, and caps at three", () => {
    const article = fixture({ slug: "self", category: "Marine Life" });
    const related = getRelatedArticles(article);
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.some((a) => a.slug === "self")).toBe(false);
    const marineLife = JOURNAL_ARTICLES.filter((a) => a.category === "Marine Life");
    if (marineLife.length) expect(related[0].category).toBe("Marine Life");
  });
});

describe("article JSON-LD", () => {
  it("emits Article markup referencing the single business entity", () => {
    const article = JOURNAL_ARTICLES[0];
    const jsonLd = articleJsonLd(article);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Article");
    expect(jsonLd.headline).toBe(article.title);
    expect(jsonLd.datePublished).toBe(article.publishedAt);
    expect(jsonLd.dateModified).toBe(article.updatedAt ?? article.publishedAt);
    expect(jsonLd.articleSection).toBe(article.category);
    expect(jsonLd.image).toBe(`${SITE_URL}${article.hero.src}`);
    // Publisher is an @id reference — not a redeclared Organization node.
    expect(jsonLd.publisher).toEqual({ "@id": BUSINESS_ID });
    expect(jsonLd.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id": articleUrl(article),
    });
    expect(jsonLd.isPartOf).toMatchObject({ "@type": "Blog", name: JOURNAL_NAME });
  });

  it("types Person and Organization bylines correctly", () => {
    const org = articleJsonLd(fixture());
    expect(org.author).toEqual({
      "@type": "Organization",
      "@id": BUSINESS_ID,
      name: "Sea Saba",
    });
    const person = articleJsonLd(
      fixture({ author: { name: "A. Diver" } })
    );
    expect(person.author).toEqual({ "@type": "Person", name: "A. Diver" });
  });
});

describe("RSS feed", () => {
  const xml = journalFeedXml(listArticles());

  it("is a standards-shaped RSS 2.0 channel with an atom self-link", () => {
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<title>${JOURNAL_NAME}</title>`);
    expect(xml).toContain(`<link>${SITE_URL}${JOURNAL_PATH}</link>`);
    expect(xml).toContain(
      `<atom:link href="${SITE_URL}${JOURNAL_FEED_PATH}" rel="self" type="application/rss+xml" />`
    );
    expect(xml).toContain("<language>en-us</language>");
    expect(xml).toContain("<lastBuildDate>");
  });

  it("emits one item per article with canonical URLs, dates, and categories", () => {
    const escapeXml = (text: string) =>
      text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    const itemCount = xml.match(/<item>/g)?.length ?? 0;
    expect(itemCount).toBe(listArticles().length);
    for (const article of listArticles()) {
      expect(xml).toContain(`<guid isPermaLink="true">${articleUrl(article)}</guid>`);
      // Titles are XML-escaped in the feed (e.g. apostrophes → &apos;).
      expect(xml).toContain(`<title>${escapeXml(article.title)}</title>`);
      expect(xml).toContain(`<category>${article.category}</category>`);
      expect(xml).toContain(
        `<pubDate>${new Date(`${article.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>`
      );
    }
  });

  it("escapes XML entities in titles and descriptions", () => {
    const tricky = fixture({
      title: 'Ampersands & "quotes" <everywhere>',
      description: "It's <not> markup & stuff",
    });
    const feed = journalFeedXml([tricky]);
    expect(feed).toContain("Ampersands &amp; &quot;quotes&quot; &lt;everywhere&gt;");
    expect(feed).toContain("It&apos;s &lt;not&gt; markup &amp; stuff");
    expect(feed).not.toContain("<everywhere>");
  });
});
