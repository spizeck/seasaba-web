import "server-only";

import { isValidElement } from "react";
import { SITE_URL, BUSINESS_ID } from "@/lib/constants";
import { JOURNAL_ARTICLES } from "@/data/journal";
import {
  JOURNAL_CATEGORIES,
  type JournalArticle,
  type JournalCategory,
} from "@/data/journal/types";

/**
 * Public section identity (#243). "Sea Saba Journal" is the section name —
 * route, titles, feed channel and JSON-LD isPartOf all derive from it.
 */
export const JOURNAL_NAME = "Sea Saba Journal";
export const JOURNAL_PATH = "/journal";
export const JOURNAL_FEED_PATH = "/journal/feed.xml";
export const JOURNAL_DESCRIPTION =
  "Notes on diving Saba — sites and seasons, marine life, trip planning, conservation, and dispatches from the Sea Saba boats.";

/**
 * The content API. Route UI, the sitemap and the feed consume only these
 * accessors — never `data/journal` internals — so a future CMS can replace
 * the file-backed registry without touching routes or public URLs.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * URL segments that already resolve inside /journal/… and must never be
 * used as article slugs (the static segment would shadow the article).
 */
const RESERVED_SLUGS = new Set(["feed.xml", "feed"]);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Shape check plus a real calendar day — Date.parse alone rolls overflow
// dates like "2026-02-30" forward instead of rejecting them.
const isIsoDate = (value: string | undefined): value is string => {
  if (!value || !ISO_DATE.test(value)) return false;
  const ms = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === value;
};

/** All problems found in one article, human-readable and author-facing. */
export function validateArticle(article: JournalArticle): string[] {
  const problems: string[] = [];
  const where = `article "${article?.slug ?? "(missing slug)"}"`;

  if (typeof article.slug !== "string" || !SLUG_PATTERN.test(article.slug)) {
    problems.push(`${where}: slug must be kebab-case ([a-z0-9-])`);
  } else if (RESERVED_SLUGS.has(article.slug)) {
    problems.push(`${where}: slug is reserved by a journal route segment`);
  }
  if (!article.title?.trim()) problems.push(`${where}: title is required`);
  if (!article.description?.trim()) {
    problems.push(`${where}: description/dek is required`);
  } else if (article.description.length > 320) {
    problems.push(`${where}: description must stay under 320 characters`);
  }

  const published = Date.parse(article.publishedAt ?? "");
  if (!isIsoDate(article.publishedAt)) {
    problems.push(`${where}: publishedAt must be an ISO date (YYYY-MM-DD)`);
  }
  if (article.updatedAt !== undefined) {
    const updated = Date.parse(article.updatedAt);
    if (!isIsoDate(article.updatedAt)) {
      problems.push(`${where}: updatedAt must be an ISO date (YYYY-MM-DD)`);
    } else if (!Number.isNaN(published) && updated < published) {
      problems.push(`${where}: updatedAt cannot predate publishedAt`);
    }
  }

  if (!JOURNAL_CATEGORIES.includes(article.category)) {
    problems.push(
      `${where}: category must be one of ${JOURNAL_CATEGORIES.join(", ")}`
    );
  }
  if (!article.author?.name?.trim()) {
    problems.push(`${where}: author.name is required`);
  }
  if (
    article.author?.type !== undefined &&
    article.author.type !== "Person" &&
    article.author.type !== "Organization"
  ) {
    problems.push(`${where}: author.type must be "Person" or "Organization"`);
  }

  if (!article.hero?.src?.startsWith("/images/")) {
    problems.push(
      `${where}: hero.src must be a /images/... path from the local pipeline`
    );
  }
  if (!article.hero?.alt?.trim()) {
    problems.push(`${where}: hero.alt descriptive text is required`);
  }

  if (article.cta) {
    if (!article.cta.label?.trim() || !article.cta.href?.trim()) {
      problems.push(`${where}: cta needs both label and href`);
    } else if (
      !article.cta.href.startsWith("/") &&
      !article.cta.href.startsWith("https://")
    ) {
      problems.push(`${where}: cta.href must be an internal path or https URL`);
    }
  }

  if (!isValidElement(article.body)) {
    problems.push(`${where}: body must be a JSX element (use a fragment <>…</>)`);
  }

  return problems;
}

/**
 * Cross-article checks plus per-article validation. Throws one descriptive
 * Error listing every problem — called at module load so malformed content
 * fails `next build` and the test suite, never renders quietly.
 */
export function validateRegistry(articles: JournalArticle[]): JournalArticle[] {
  const problems = articles.flatMap(validateArticle);

  const seen = new Set<string>();
  for (const article of articles) {
    if (seen.has(article.slug)) {
      problems.push(`article "${article.slug}": duplicate slug`);
    }
    seen.add(article.slug);
  }

  const slugs = new Set(articles.map((a) => a.slug));
  for (const article of articles) {
    for (const ref of article.related ?? []) {
      if (ref === article.slug) {
        problems.push(`article "${article.slug}": cannot list itself as related`);
      } else if (!slugs.has(ref)) {
        problems.push(
          `article "${article.slug}": related slug "${ref}" does not exist`
        );
      }
    }
  }

  if (problems.length) {
    throw new Error(
      `Invalid journal content — fix the article modules under data/journal/articles/:\n  - ${problems.join("\n  - ")}`
    );
  }
  return articles;
}

/**
 * Validated at module load — malformed content fails `next build` and the
 * test suite with a named problem list instead of rendering quietly.
 */
const ARTICLES = validateRegistry(JOURNAL_ARTICLES).slice();

/**
 * The public-facing slice — drafts (#245) validate against the registry like
 * everything else, but can never be listed, resolved, routed, fed, or mapped
 * until a human removes `draft: true` and re-commits.
 */
const PUBLISHED = ARTICLES.filter((a) => !a.draft);

const byNewest = (a: JournalArticle, b: JournalArticle) =>
  b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug);

/** Published articles, newest first (publishedAt desc, slug tiebreak). */
export function listArticles(
  articles: JournalArticle[] = PUBLISHED
): JournalArticle[] {
  return articles.filter((a) => !a.draft).sort(byNewest);
}

export function getArticle(
  slug: string,
  articles: JournalArticle[] = PUBLISHED
): JournalArticle | undefined {
  return articles.find((a) => a.slug === slug && !a.draft);
}

export function listCategories(): readonly JournalCategory[] {
  return JOURNAL_CATEGORIES;
}

export function articlePath(article: Pick<JournalArticle, "slug">): string {
  return `${JOURNAL_PATH}/${article.slug}`;
}

export function articleUrl(article: Pick<JournalArticle, "slug">): string {
  return `${SITE_URL}${articlePath(article)}`;
}

export function categorySlug(category: JournalCategory): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string): JournalCategory | undefined {
  return JOURNAL_CATEGORIES.find((c) => categorySlug(c) === slug);
}

/**
 * Related stories for the article footer: explicit `related` slugs win;
 * otherwise newest same-category articles, then newest overall — excluding
 * the article itself. Deterministic and capped at `limit`.
 */
export function getRelatedArticles(
  article: JournalArticle,
  limit = 3
): JournalArticle[] {
  if (article.related?.length) {
    return article.related
      .map((slug) => getArticle(slug))
      .filter((a): a is JournalArticle => !!a)
      .slice(0, limit);
  }
  const rest = listArticles().filter((a) => a.slug !== article.slug);
  const sameCategory = rest.filter((a) => a.category === article.category);
  const others = rest.filter((a) => a.category !== article.category);
  return [...sameCategory, ...others].slice(0, limit);
}

/** "October 9, 2026" — UTC-pinned so SSR and tests agree regardless of TZ. */
export function formatJournalDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Article JSON-LD. `publisher` and Organization bylines reference the single
 * Sea Saba entity (@id …/#business) emitted by the site shell — no duplicate
 * Organization/LocalBusiness node is ever created here.
 */
export function articleJsonLd(article: JournalArticle): Record<string, unknown> {
  const url = articleUrl(article);
  const author =
    article.author.type === "Organization"
      ? {
          "@type": "Organization" as const,
          "@id": BUSINESS_ID,
          name: article.author.name,
        }
      : { "@type": "Person" as const, name: article.author.name };

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    image: `${SITE_URL}${article.hero.src}`,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    articleSection: article.category,
    inLanguage: "en",
    author,
    publisher: { "@id": BUSINESS_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}${JOURNAL_PATH}#journal`,
      name: JOURNAL_NAME,
    },
  };
}

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

/**
 * RSS 2.0 channel for the Journal, built from the same validated registry
 * the routes render — deterministic output, newest first.
 */
export function journalFeedXml(articles: JournalArticle[]): string {
  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${articleUrl(a)}</link>
      <guid isPermaLink="true">${articleUrl(a)}</guid>
      <pubDate>${rfc822(a.publishedAt)}</pubDate>
      <description>${escapeXml(a.excerpt ?? a.description)}</description>
      <category>${escapeXml(a.category)}</category>
      <dc:creator>${escapeXml(a.author.name)}</dc:creator>
    </item>`
    )
    .join("\n");

  const lastBuild = articles.length
    ? rfc822(
        articles
          .map((a) => a.updatedAt ?? a.publishedAt)
          .sort()
          .at(-1)!
      )
    : new Date(0).toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(JOURNAL_NAME)}</title>
    <link>${SITE_URL}${JOURNAL_PATH}</link>
    <atom:link href="${SITE_URL}${JOURNAL_FEED_PATH}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(JOURNAL_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
