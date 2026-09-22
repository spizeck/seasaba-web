import { SiteShell } from "@/components/site-shell";
import { NotFoundContent } from "@/components/not-found-content";
import { openSans, jost } from "@/lib/fonts";
import "./globals.css";

/**
 * Global 404 for unmatched URLs. The site has multiple root layouts (one per
 * locale subtree: app/(en)/, app/nl/), so there is no single root layout to
 * compose a 404 from — this file is a complete document instead. Enabled via
 * `experimental.globalNotFound` in next.config.ts.
 *
 * Always English: unmatched URLs are not localized content, and unknown
 * locale prefixes (`/xx/...`, `/en/...`) are just unmatched paths.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${openSans.variable} ${jost.variable}`}>
      <body className="antialiased">
        <SiteShell>
          <NotFoundContent />
        </SiteShell>
      </body>
    </html>
  );
}
