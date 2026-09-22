import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, OG_IMAGE } from "./constants";
import {
  DEFAULT_LOCALE,
  isRoutePublished,
  localizedPath,
  OG_LOCALE,
  PREFIXED_LOCALES,
  type Locale,
} from "./locale";

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  searchParams?: Record<string, string | string[] | undefined>;
  /** Defaults to English. Set on localized pages so canonical/OG/hreflang are locale-aware. */
  locale?: Locale;
}

/** Root-layout metadata, per locale (#150). `og:locale` follows the document language. */
export function rootMetadata(locale: Locale = DEFAULT_LOCALE): Metadata {
  return {
    title: {
      default: `${SITE_NAME} — Professional Scuba Diving in Saba`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      images: [
        {
          url: OG_IMAGE.url,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: OG_IMAGE.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [OG_IMAGE.url],
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [
        { url: "/apple-icon.png" },
        { url: "/apple-icon-57x57.png", sizes: "57x57", type: "image/png" },
        { url: "/apple-icon-60x60.png", sizes: "60x60", type: "image/png" },
        { url: "/apple-icon-72x72.png", sizes: "72x72", type: "image/png" },
        { url: "/apple-icon-76x76.png", sizes: "76x76", type: "image/png" },
        { url: "/apple-icon-114x114.png", sizes: "114x114", type: "image/png" },
        { url: "/apple-icon-120x120.png", sizes: "120x120", type: "image/png" },
        { url: "/apple-icon-144x144.png", sizes: "144x144", type: "image/png" },
        { url: "/apple-icon-152x152.png", sizes: "152x152", type: "image/png" },
        { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" },
      ],
      other: [{ rel: "manifest", url: "/manifest.json" }],
    },
  };
}

export function createMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
  searchParams,
  locale = DEFAULT_LOCALE,
}: PageMetadataOptions): Metadata {
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  const hasSearchParams =
    searchParams && Object.keys(searchParams).length > 0;

  // hreflang plumbing for #153: emit language alternates only for locales
  // where this route actually has a published translation. Until #151 lands
  // approved Dutch content, every page emits en + x-default (both the
  // unprefixed English URL) — never a nonexistent /nl alternate.
  const languages: Record<string, string> = {};
  for (const l of [DEFAULT_LOCALE, ...PREFIXED_LOCALES]) {
    if (isRoutePublished(l, path)) {
      languages[l] = `${SITE_URL}${localizedPath(l, path)}`;
    }
  }
  languages["x-default"] = `${SITE_URL}${localizedPath(DEFAULT_LOCALE, path)}`;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: OG_LOCALE[locale],
      images: [
        {
          url: OG_IMAGE.url,
          width: OG_IMAGE.width,
          height: OG_IMAGE.height,
          alt: OG_IMAGE.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
    ...((noIndex || hasSearchParams) && {
      robots: {
        index: false,
        follow: true,
      },
    }),
  };
}
