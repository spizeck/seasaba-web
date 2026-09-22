import type { Metadata } from "next";
import { rootMetadata } from "@/lib/metadata";
import { SiteShell } from "@/components/site-shell";
import { openSans, jost } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = rootMetadata("nl");

// Dutch root layout — a literal `nl` segment is the hard locale allowlist:
// nothing under it resolves unless a page exists here, and no other locale
// prefix can ever match. Unpublished Dutch routes are caught by
// app/nl/[[...slug]] and render the 404 inside this shell.
export default function DutchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${openSans.variable} ${jost.variable}`}>
      <body className="antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
