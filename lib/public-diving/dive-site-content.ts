import "server-only";

import { cache } from "react";
import { DIVE_SITE_BY_SLUG, diveSiteSlug, type DiveSite } from "@/data/dive-site-videos";
import {
  isPublicDivingApiEnabled,
  loadPublishedDiveSitesFromApi,
  type PublishedDiveSiteContent,
} from "@/lib/public-diving/client";

/**
 * Dive-site page content resolver (issue #325, prepared, not commissioned).
 *
 * The static catalogue in data/dive-site-videos.ts remains the source of
 * page existence, slugs, names, areas and the sitemap. When
 * DIVE_SITE_CONTENT_SOURCE=api (and PUBLIC_DIVING_API_BASE_URL is set), a
 * matching *published* seasaba.app website snapshot overrides the fields it
 * actually provides; every missing field keeps the reviewed static value.
 * Draft content is never requested and operational `active` is never read.
 */

export interface DiveSitePageContent extends DiveSite {
  contentSource: "static" | "published";
  seoTitle?: string;
  seoDescription?: string;
}

export function isDiveSiteApiContentEnabled(): boolean {
  return process.env.DIVE_SITE_CONTENT_SOURCE?.trim() === "api" && isPublicDivingApiEnabled();
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extract a YouTube video id from an approved URL, or undefined. */
export function youtubeVideoId(url: string | undefined): string | undefined {
  if (!url) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return undefined;
  }
  if (parsed.protocol !== "https:") return undefined;
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null | undefined;
  if (host === "youtu.be") {
    id = parsed.pathname.split("/")[1];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, kind, value] = parsed.pathname.split("/");
    id = kind === "watch" ? parsed.searchParams.get("v") : kind === "embed" || kind === "shorts" ? value : undefined;
  }
  return id && YOUTUBE_ID.test(id) ? id : undefined;
}

export function applyPublishedContent(
  site: DiveSite,
  published: PublishedDiveSiteContent | undefined
): DiveSitePageContent {
  if (!published) return { ...site, contentSource: "static" };
  return {
    ...site,
    description: published.fullDescription ?? published.shortDescription ?? site.description,
    videoId: youtubeVideoId(published.youtubeVideoUrl) ?? site.videoId,
    seoTitle: published.seoTitle,
    seoDescription: published.seoDescription ?? published.shortDescription,
    contentSource: "published",
  };
}

function findPublished(
  slug: string,
  sites: PublishedDiveSiteContent[]
): PublishedDiveSiteContent | undefined {
  return (
    sites.find((s) => s.slug === slug) ??
    sites.find((s) => !s.slug && diveSiteSlug(s.name) === slug)
  );
}

// One API read per render, shared by generateMetadata and the page.
const publishedSites = cache(() => loadPublishedDiveSitesFromApi());

/**
 * Resolve the content for a catalogue slug, or null when the slug is not in
 * the static catalogue. API failures fall back to static content at build
 * time and in development; at production runtime they throw so ISR keeps
 * the last good page.
 */
export async function getDiveSitePageContent(slug: string): Promise<DiveSitePageContent | null> {
  const site = DIVE_SITE_BY_SLUG[slug];
  if (!site) return null;
  if (!isDiveSiteApiContentEnabled()) return { ...site, contentSource: "static" };
  try {
    return applyPublishedContent(site, findPublished(slug, await publishedSites()));
  } catch (err) {
    const isBuildTime = process.env.NEXT_PHASE === "phase-production-build";
    if (!isBuildTime && process.env.NODE_ENV === "production") throw err;
    console.warn(
      `[dive-sites/${slug}] Published content unavailable, using static content:`,
      err instanceof Error ? err.message : err
    );
    return { ...site, contentSource: "static" };
  }
}
