import { expect, it } from "vitest";
import nextConfig from "@/next.config";

const requiredHeaders = [
  "Strict-Transport-Security",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "Content-Security-Policy",
];

it("applies all required production security headers to every route", async () => {
  const rules = await nextConfig.headers?.();
  const siteWide = rules?.find((rule) => rule.source === "/:path*");
  expect(siteWide).toBeDefined();
  const keys = siteWide?.headers.map((header) => header.key) ?? [];
  for (const key of requiredHeaders) expect(keys).toContain(key);
});
