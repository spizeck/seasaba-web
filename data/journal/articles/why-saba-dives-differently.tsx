import Link from "next/link";
import { JournalFigure } from "@/components/journal/figure";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy for the Journal foundation (#243).
 * Describes Saba's underwater topography in the same general terms the
 * dive-sites and about pages already use; no invented specifics.
 */
export const article: JournalArticle = {
  slug: "why-saba-dives-differently",
  title: "Why Saba Dives Differently",
  description:
    "Pinnacles rising out of deep blue, walls, and volcanic reef — the shape of the island below the waterline is what makes diving here distinct.",
  publishedAt: "2026-09-29",
  category: "Diving Saba",
  author: { name: "Sea Saba", type: "Organization" },
  hero: {
    src: "/images/optimized/divers-above-pinnacle-saba.webp",
    alt: "Divers above a volcanic pinnacle dive site off Saba",
  },
  demo: true,
  cta: { label: "Browse the dive sites", href: "/dive-sites" },
  body: (
    <>
      <p>
        Saba is the tip of a volcano, and it doesn&apos;t stop at the
        waterline. That single fact explains most of what makes diving here
        different from a typical Caribbean reef destination: the underwater
        terrain is dramatic in a way flat reef systems aren&apos;t.
      </p>
      <h2>Pinnacles and walls</h2>
      <p>
        The island&apos;s signature dive areas are offshore pinnacles and
        seamounts — structures that rise from deep water toward the surface,
        attracting the kind of life that follows current and depth. Closer to
        shore, walls and volcanic reef formations offer a different profile:
        shallower, structured, and easier to linger on.
      </p>
      <JournalFigure
        src="/images/optimized/diver-volcanic-pinnacle-saba.webp"
        alt="A diver in trim over a volcanic pinnacle structure off Saba"
        caption="Volcanic structure shapes every Saba dive — demonstration caption."
        aspectRatio="16/9"
      />
      <p>
        That mix is why the <Link href="/dive-sites">dive sites guide</Link>{" "}
        is organized by area rather than as one flat list — The Pinnacles
        genuinely are a different kind of dive than Tent Reef or the bay
        sites, and the site descriptions carry the details.
      </p>
      <h2>What that means for divers</h2>
      <p>
        Pinnacle dives run deeper and see more blue-water life; the shallower
        structure sites reward slow, observant diving. The practical result is
        that a week of diving here doesn&apos;t repeat itself — different
        sites suit different experience levels, which the{" "}
        <Link href="/diving">diving overview</Link> maps to the daily
        schedule.
      </p>
    </>
  ),
};
