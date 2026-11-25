import Link from "next/link";
import { DIVE_SITE_MAP, diveSitePath } from "@/data/dive-site-videos";

type Props = {
  sites: readonly string[];
  /** Use dark pill styles when rendered on a dark background */
  dark?: boolean;
};

/**
 * Site chips linking to each site's /dive-sites/<slug> guide. Server-rendered
 * links so the individual site pages are crawlable and shareable — this used
 * to open a client-side modal, which kept the site content out of the
 * initial HTML and invisible to crawlers (#301).
 */
export function DiveAreaSites({ sites, dark = false }: Props) {
  const pillBase = dark
    ? "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/70 pressable focus-ring-light"
    : "rounded-full px-3 py-1 text-xs font-medium pressable focus-ring";

  const pillActive = dark
    ? "hover:bg-white/15 hover:text-white"
    : "bg-primary/10 text-primary hover:bg-primary/20";

  // Names without a catalogue entry have no page — dim them rather than
  // linking to a 404 (issue #215 behavior preserved).
  const pillInactive = dark
    ? "cursor-default opacity-50"
    : "bg-primary/10 text-primary opacity-50";

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sites.map((site) => {
        if (!DIVE_SITE_MAP[site]) {
          return (
            <span key={site} className={`${pillBase} ${pillInactive}`}>
              {site}
            </span>
          );
        }
        return (
          <Link
            key={site}
            href={diveSitePath(site)}
            className={`${pillBase} ${pillActive}`}
          >
            {site}
          </Link>
        );
      })}
    </div>
  );
}
