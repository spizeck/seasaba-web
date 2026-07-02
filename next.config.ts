import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      // --- Diving page anchors ---
      { source: "/dive-nitrox-with-sea-saba", destination: "/diving#nitrox", permanent: true },
      // /certified-pure covers compressor quality + Nitrox; pointing to #nitrox is appropriate
      { source: "/certified-pure", destination: "/diving#nitrox", permanent: true },
      { source: "/concerning-altitude", destination: "/diving#altitude-flying", permanent: true },
      { source: "/dan-report", destination: "/diving#altitude-flying", permanent: true },

      // --- Plan Your Trip anchors ---
      { source: "/saba-restaurants", destination: "/plan-your-trip#restaurants", permanent: true },
      { source: "/hiking-on-saba", destination: "/plan-your-trip#hiking", permanent: true },
      { source: "/saba-history", destination: "/plan-your-trip#history", permanent: true },
      { source: "/the-island-of-saba", destination: "/plan-your-trip#history", permanent: true },
      { source: "/saba-sunset-cruise", destination: "/plan-your-trip#experiences", permanent: true },
      { source: "/snorkeling-saba", destination: "/plan-your-trip#experiences", permanent: true },

      // --- Dive Log ---
      // /dive-log is already the live route; no redirect needed (identical slug).

      // --- Partners / blog ---
      // Sea & Learn blog post → /partners (Sea & Learn is listed there)
      {
        source: "/post/join-sea-learn-field-projects-with-sea-saba-october-2023",
        destination: "/partners",
        permanent: true,
      },
      // /seasaba-blog → /partners (closest content equivalent; manual review if blog is restored)
      { source: "/seasaba-blog", destination: "/partners", permanent: true },

      // --- Manual review (no suitable destination yet) ---
      // /post/oxe-marine-technician-training — leave as 404 pending a news/resources page
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
