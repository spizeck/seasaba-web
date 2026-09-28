import type { Metadata } from "next";
import { rootMetadata } from "@/lib/metadata";
import { SiteShell } from "@/components/site-shell";
import { openSans, jost } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = rootMetadata("nl");

// Dutch root layout — a literal `nl` segment is the hard locale allowlist:
// nothing under it resolves unless a page exists here, and no other locale
// prefix can ever match. Unpublished Dutch routes 404 inside this shell via
// each page's canServeNlRoute gate or the global not-found document.
export default function DutchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${openSans.variable} ${jost.variable}`}>
      <body className="antialiased">
        <SiteShell locale="nl">{children}</SiteShell>
      </body>
    </html>
  );
}
