/**
 * Single authoritative locale configuration (#150).
 *
 * English is the default locale and is served at unprefixed URLs from the
 * `app/(en)` route group. Non-default locales each get a literal top-level
 * segment (`app/nl/` → `/nl/...`) — the literal directory is itself the
 * hard allowlist: `/xx/...` can never resolve as a locale because no such
 * segment exists. Adding `fr` later means adding `app/fr/`.
 */
export const LOCALES = ["en", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales served from a literal `app/<locale>/` subtree — every locale except the unprefixed default. */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

/**
 * BCP 47 tags for `<html lang>` / hreflang / `og:locale`.
 * og:locale wants `language_TERRITORY` form.
 */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  nl: "nl_NL",
};

/** Human-readable names in each language's own language — for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Publication gate (#150 → #151/#152). A locale's content reaches production
 * only for routes listed here. `en` routes are always published — they are
 * the canonical site. `nl` starts empty: no Dutch page is production-visible
 * until a human-approved translation lands and its route is listed by #151.
 *
 * Keep this a plain list — the full freshness/review system is #152's scope.
 */
export const PUBLISHED_ROUTES: Record<Locale, readonly string[]> = {
  en: ["*"],
  nl: [],
};

/** True when `routePath` (e.g. "/diving", "/") has an approved translation in `locale`. */
export function isRoutePublished(locale: Locale, routePath: string): boolean {
  const published = PUBLISHED_ROUTES[locale];
  return published.includes("*") || published.includes(routePath);
}

/**
 * Routes for which a translated content module exists, per locale (#151).
 * Draft modules may exist long before approval — this list feeds only
 * draft-preview routing and switcher visibility in development; production
 * visibility still requires `PUBLISHED_ROUTES` + approval (see
 * `content/nl/index.ts` `canServeNlRoute`). A unit test asserts every listed
 * route actually has a content module.
 */
export const DRAFTED_ROUTES: Record<Locale, readonly string[]> = {
  en: [],
  nl: ["/", "/diving", "/plan-your-trip", "/courses", "/contact", "/book"],
};

/**
 * Draft translations are browsable only outside production builds: `next dev`
 * and test renders show them; `next build` output never does. A hosted
 * preview can opt in with NEXT_PUBLIC_DRAFT_LOCALE_PREVIEW=1 — that variable
 * must never be set on the production environment.
 */
export function isDraftPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_DRAFT_LOCALE_PREVIEW === "1"
  );
}

/**
 * Human-review state of a translated module (#151/#152). Approval is a hard
 * release gate: `status` must be "approved" and `reviewedBy`/`reviewedAt`
 * set by a named human before the route may enter `PUBLISHED_ROUTES`.
 */
export interface TranslationReview {
  status: "draft" | "approved";
  /** Name of the human reviewer; null while unreviewed. */
  reviewedBy: string | null;
  /** ISO date of the human review; null while unreviewed. */
  reviewedAt: string | null;
  /** English source file this module translates (for #152 freshness checks). */
  source: string;
  /** sha1 of the English source file at translation time. */
  sourceHash: string;
}

/**
 * URL for `canonicalPath` under `locale`, falling back to the unprefixed
 * English URL when the route has no published translation (or, in draft
 * preview, no drafted module). Preserves query strings and fragments.
 */
export function localeHref(
  locale: Locale,
  canonicalPath: string,
): string {
  const [pathAndQuery, hash] = canonicalPath.split("#");
  const [path, query] = pathAndQuery.split("?");
  const eligible =
    isRoutePublished(locale, path) ||
    (isDraftPreviewEnabled() && DRAFTED_ROUTES[locale].includes(path));
  const base = eligible ? localizedPath(locale, path) : localizedPath(DEFAULT_LOCALE, path);
  return `${base}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

/**
 * URL for `path` under `locale`. The default locale stays unprefixed so
 * existing English URLs are externally unchanged; other locales get
 * `/nl`-style prefixes.
 */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return locale === DEFAULT_LOCALE ? clean || "/" : `/${locale}${clean}`;
}

/**
 * Strip a locale prefix from a pathname, returning the locale and the
 * unprefixed path. Returns the default locale when no valid prefix exists —
 * an unknown prefix ("/xx/...") is not a locale and yields the full path.
 */
export function parsePathname(pathname: string): {
  locale: Locale;
  path: string;
} {
  const [first, ...rest] = pathname.split("/").filter(Boolean);
  if (first && (PREFIXED_LOCALES as readonly string[]).includes(first)) {
    return {
      locale: first as Locale,
      path: `/${rest.join("/")}`,
    };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}
