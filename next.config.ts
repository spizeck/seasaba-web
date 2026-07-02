import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      // ── Legacy Wix URL → new site (single-hop 301s) ──────────────────────
      // Generated during the Wix→Next.js migration. Every entry resolves in a
      // single hop; no destination below is also a source (no chains/loops).

      // About cluster
      { source: "/about/the-sea-saba-difference", destination: "/about", statusCode: 301 },
      { source: "/meet-the-crew", destination: "/about", statusCode: 301 },
      { source: "/fort-bay-harbor", destination: "/about", statusCode: 301 },
      { source: "/copy-of-fort-bay-harbor", destination: "/about", statusCode: 301 },
      { source: "/copy-of-dive-shop", destination: "/about", statusCode: 301 },
      { source: "/dive-partners", destination: "/about", statusCode: 301 },

      // Booking
      { source: "/book-saba-diving-online", destination: "/book", statusCode: 301 },

      // Dive sites — overview / marine park / map
      { source: "/sabas-dive-sites", destination: "/dive-sites", statusCode: 301 },
      { source: "/saba-marine-park", destination: "/dive-sites", statusCode: 301 },

      // Individual dive-site pages → Dive Sites area sections
      { source: "/saba-1-mt-michel", destination: "/dive-sites#pinnacles", statusCode: 301 },
      { source: "/saba-2-third-encounter", destination: "/dive-sites#pinnacles", statusCode: 301 },
      { source: "/saba-3-twiwlight-zone", destination: "/dive-sites#pinnacles", statusCode: 301 },
      { source: "/saba-4-outer-limits", destination: "/dive-sites#pinnacles", statusCode: 301 },
      { source: "/saba-5-oshark-shoals", destination: "/dive-sites#pinnacles", statusCode: 301 },
      { source: "/saba-6-diamond-rock", destination: "/dive-sites#wells-bay", statusCode: 301 },
      { source: "/saba-7-man-owar-shoals", destination: "/dive-sites#wells-bay", statusCode: 301 },
      { source: "/saba-8-otto-limits", destination: "/dive-sites#wells-bay", statusCode: 301 },
      { source: "/saba-9-torrens-point", destination: "/dive-sites#wells-bay", statusCode: 301 },
      { source: "/saba-10-coral-nursery", destination: "/dive-sites", statusCode: 301 },
      { source: "/saba-11-customs-house", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-12-porites-point", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-13-babylon", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-14-ladder-labyrinth", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-15-50-50", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-16-hot-springs", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-17-rays-n-anchors", destination: "/dive-sites#ladder-bay", statusCode: 301 },
      { source: "/saba-18-tedran-wall", destination: "/dive-sites#tent-reef", statusCode: 301 },
      { source: "/saba-19-tent-reef-wall", destination: "/dive-sites#tent-reef", statusCode: 301 },
      { source: "/saba-20-tent-reef", destination: "/dive-sites#tent-reef", statusCode: 301 },
      { source: "/saba-21-tent-reef-shallow", destination: "/dive-sites#tent-reef", statusCode: 301 },
      { source: "/saba-22-tent-reef-deep", destination: "/dive-sites#tent-reef", statusCode: 301 },
      { source: "/saba-23-mooring-muck-dive", destination: "/dive-sites", statusCode: 301 },
      { source: "/saba-24-greer-gut", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-25-big-rock-market", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-26-big-rock-deep", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-27-hole-in-the-corner", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-28-davids-dropoff", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-29-core-gut", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-30-cove-bay", destination: "/dive-sites#windwardside", statusCode: 301 },
      { source: "/saba-31-green-island", destination: "/dive-sites#windwardside", statusCode: 301 },

      // Diving — experiences / operations / safety
      { source: "/sabas-best-dive-boats", destination: "/diving", statusCode: 301 },
      { source: "/dive-nitrox-with-sea-saba", destination: "/diving#nitrox", statusCode: 301 },
      { source: "/certified-pure", destination: "/diving#nitrox", statusCode: 301 },
      { source: "/dan-report", destination: "/diving#altitude-flying", statusCode: 301 },
      { source: "/concerning-altitude", destination: "/diving#altitude-flying", statusCode: 301 },
      { source: "/post/diving-into-the-future-with-fin-tonic-and-shark-bait", destination: "/diving", statusCode: 301 },

      // Courses / training
      { source: "/dive-training-courses", destination: "/courses", statusCode: 301 },
      { source: "/training-beginners", destination: "/courses", statusCode: 301 },
      { source: "/training-the-next-step", destination: "/courses", statusCode: 301 },
      { source: "/childrens-scuba", destination: "/courses", statusCode: 301 },

      // Plan your trip cluster
      { source: "/travelling-to-saba", destination: "/plan-your-trip#getting-here", statusCode: 301 },
      { source: "/sailing-to-saba", destination: "/plan-your-trip#getting-here", statusCode: 301 },
      { source: "/where-to-stay", destination: "/plan-your-trip#where-to-stay", statusCode: 301 },
      { source: "/cottage-andhouse-rentals", destination: "/plan-your-trip#where-to-stay", statusCode: 301 },
      { source: "/saba-restaurants", destination: "/plan-your-trip#restaurants", statusCode: 301 },
      { source: "/hiking-on-saba", destination: "/plan-your-trip#hiking", statusCode: 301 },
      { source: "/the-island-of-saba", destination: "/plan-your-trip#history", statusCode: 301 },
      { source: "/saba-history", destination: "/plan-your-trip#history", statusCode: 301 },
      { source: "/saba-sunset-cruise", destination: "/plan-your-trip#experiences", statusCode: 301 },
      { source: "/snorkeling-saba", destination: "/plan-your-trip#experiences", statusCode: 301 },
      { source: "/seasaba-faqs", destination: "/plan-your-trip#faq", statusCode: 301 },

      // Retail (no retail catalog in the new IA) → Contact (visit/location info)
      { source: "/dive-shop-on-saba", destination: "/contact", statusCode: 301 },

      // Wix social shortcut pages → external profiles
      { source: "/youtube", destination: "https://youtube.com/@sea_saba", statusCode: 301, basePath: false },
      { source: "/facebook", destination: "https://www.facebook.com/sea.saba/", statusCode: 301, basePath: false },
      { source: "/instagram", destination: "https://www.instagram.com/seasaba/", statusCode: 301, basePath: false },
      { source: "/tripadvisor", destination: "https://www.tripadvisor.com/Attraction_Review-g147337-d1206831-Reviews-Sea_Saba_Dive_Center-Windwardside_Saba.html", statusCode: 301, basePath: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' seasaba.checkfront.com *.checkfront.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' seasaba.checkfront.com *.checkfront.com",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
