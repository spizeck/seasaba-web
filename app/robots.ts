import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /sentry-check is an operational endpoint, not content — keep crawlers
      // away from it in addition to its noindex metadata (#129).
      disallow: "/sentry-check",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
