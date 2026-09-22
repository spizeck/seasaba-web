import type { Metadata } from "next";
import { rootMetadata } from "@/lib/metadata";
import { SiteShell } from "@/components/site-shell";
import { openSans, jost } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = rootMetadata("en");

// English (default-locale) root layout. Dutch lives in a sibling literal
// app/nl/ subtree so each locale renders its own correct, static html lang
// attribute and unknown prefixes can never resolve as locales. There is
// deliberately no app/layout.tsx — each locale subtree owns its document
// shell, and app/global-not-found.tsx renders the styled 404 for unmatched
// routes.
export default function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} ${jost.variable}`}>
      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
