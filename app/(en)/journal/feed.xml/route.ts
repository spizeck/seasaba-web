import { journalFeedXml, listArticles } from "@/lib/journal";

/**
 * Journal RSS feed — /journal/feed.xml (#243). Fully static: the feed is
 * generated from the same validated registry that drives the routes.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(journalFeedXml(listArticles()), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // CDN-friendly: feeds poll; allow shared caching with a day of grace.
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
