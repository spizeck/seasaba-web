import type { ReactNode } from "react";

/**
 * Sea Saba Journal — content schema (#243).
 *
 * Articles are repo-native modules under `data/journal/articles/`: one typed
 * object per file, frontmatter fields plus a `body` JSX tree. The format is
 * deliberately file-backed TSX rather than MDX — the MDX pipeline was removed
 * (#68/#69) and this project standardizes on ordinary React content modules.
 * See data/journal/README.md for authoring rules and the future CMS seam.
 */

/** Editorial categories — the Phase 1 taxonomy from the Journal epic (#242). */
export const JOURNAL_CATEGORIES = [
  "Diving Saba",
  "Marine Life",
  "Trip Planning",
  "From the Boats",
  "Conservation",
  "Sea Saba News",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export interface JournalAuthor {
  /** Display byline, e.g. "Sea Saba" or a named crew member. */
  name: string;
  /**
   * schema.org type for JSON-LD. Use "Organization" for collective bylines
   * ("Sea Saba", "The Sea Saba Crew"); defaults to "Person".
   */
  type?: "Person" | "Organization";
  /** Optional credit line shown under the byline, e.g. "Sea Saba dive crew". */
  role?: string;
}

export interface JournalHero {
  /**
   * Root-relative path into the existing image pipeline —
   * `/images/optimized/<name>.webp`. Hero crops are landscape editorial
   * images per docs/design/IMAGE_STANDARD.md.
   */
  src: string;
  /** Descriptive alt text — required, used by the image, OG, and JSON-LD. */
  alt: string;
  /** CSS object-position for the cover crop, e.g. "center 30%". */
  position?: string;
}

/** A single contextual link rendered quietly at the foot of an article. */
export interface JournalCta {
  /** Link text — short and descriptive, e.g. "Plan your trip to Saba". */
  label: string;
  /** Internal path preferred ("section" links); absolute https allowed. */
  href: string;
}

/**
 * The typed shape every article module exports as `article`. `body` is a JSX
 * tree rendered inside the article route's prose container — compose it from
 * plain semantic elements (h2/h3, p, ul/ol, blockquote) plus the journal
 * body components (JournalFigure, JournalCallout). Do not include an h1 in
 * the body: the route renders the title as the page's only h1.
 */
export interface JournalArticle {
  /** Public URL segment — kebab-case, unique, immutable once published. */
  slug: string;
  /** Article headline (the page h1). */
  title: string;
  /**
   * Dek/standfirst shown under the headline; also the meta description and
   * RSS/OG description. One or two sentences, written for search results.
   */
  description: string;
  /** First-publication date, ISO 8601 "YYYY-MM-DD". */
  publishedAt: string;
  /** Set only when the article is materially revised (ISO 8601). */
  updatedAt?: string;
  category: JournalCategory;
  author: JournalAuthor;
  hero: JournalHero;
  /** Index-card copy override; defaults to `description` when omitted. */
  excerpt?: string;
  /**
   * Optional explicit related-article slugs (order preserved). When omitted,
   * related picks the newest articles sharing the category, then the newest
   * overall.
   */
  related?: string[];
  /** One restrained contextual CTA at the article foot — never required. */
  cta?: JournalCta;
  /**
   * Marks placeholder content shipped to prove the system (#243 demo set).
   * Renders a small demonstration notice on the article page. Remove when a
   * real, owner-approved article replaces the fixture.
   */
  demo?: boolean;
  /** Article body JSX — see the interface docblock above. */
  body: ReactNode;
}
