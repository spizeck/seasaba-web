import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

/**
 * Canonical public routes only. Excludes: legacy redirect sources
 * (data/redirects.ts), query-param variants (`/book?item=…`,
 * `/contact?interest=…` — noindexed by createMetadata), and technical
 * endpoints. Keep this table in sync when a public page is added or
 * removed; tests/unit/seo.test.ts guards the list.
 *
 * `lastModified` is deliberately omitted: there is no trustworthy source of
 * content modification dates in this repo, and a build-time `new Date()`
 * would emit a fake freshness signal that search engines discount anyway.
 */
const SITEMAP_ROUTES: {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/diving", changeFrequency: "weekly", priority: 0.9 },
  { path: "/dive-sites", changeFrequency: "monthly", priority: 0.9 },
  { path: "/book", changeFrequency: "weekly", priority: 0.9 },
  { path: "/plan-your-trip", changeFrequency: "monthly", priority: 0.85 },
  { path: "/courses", changeFrequency: "monthly", priority: 0.8 },
  { path: "/dive-log", changeFrequency: "weekly", priority: 0.7 },
  { path: "/visiting-yachts", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners", changeFrequency: "monthly", priority: 0.6 },
  { path: "/donate", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookie-policy", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return SITEMAP_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  }));
}
