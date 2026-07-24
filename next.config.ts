import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { legacyRedirects } from "./data/redirects";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  async redirects() {
    return legacyRedirects;
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' seasaba.checkfront.com *.checkfront.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://vercel.live https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com",
              "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' seasaba.checkfront.com *.checkfront.com https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://vercel.live https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' seasaba.checkfront.com *.checkfront.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.clarity.ms https://*.clarity.ms https://firestore.googleapis.com https://*.googleapis.com wss://*.googleapis.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://www.google.com",
              "frame-src 'self' seasaba.checkfront.com *.checkfront.com https://www.googletagmanager.com https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com https://td.doubleclick.net https://bid.g.doubleclick.net",
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
