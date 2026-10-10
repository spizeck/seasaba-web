import Link from "next/link";
import { JournalCallout } from "@/components/journal/callout";
import { OPERATIONS } from "@/data/operations";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy for the Journal foundation (#243).
 * The only operational details referenced come from data/operations.ts, the
 * repo's canonical source — nothing else is invented.
 */
export const article: JournalArticle = {
  slug: "a-dive-day-on-saba",
  title: "A Dive Day on Saba, Start to Finish",
  description:
    "What a guided dive day with Sea Saba actually looks like — pickup, departure, dives, and the return to Fort Bay Harbor.",
  publishedAt: "2026-09-22",
  category: "From the Boats",
  author: { name: "Sea Saba", type: "Organization", role: "Dive crew" },
  hero: {
    src: "/images/optimized/fort-bay-two-boats.webp",
    alt: "Two Sea Saba custom dive catamarans moored at Fort Bay Harbor, Saba",
  },
  demo: true,
  cta: { label: "See the diving options", href: "/diving" },
  body: (
    <>
      <p>
        Most guests&apos; first question is a simple one: what does the day
        actually look like? The honest answer is that it&apos;s calm and
        predictable — the operation has run the same basic rhythm for years,
        because the rhythm works.
      </p>
      <p>
        Every trip departs from and returns to {OPERATIONS.harbor}. The day
        is built around three dive windows — an early boat, a late-morning
        boat, and an afternoon slot — and which of them you&apos;re on depends
        on the product you book. The{" "}
        <Link href="/diving">diving page</Link> carries the exact departure
        and return times for each.
      </p>
      <h2>Before the boat leaves</h2>
      <p>
        Taxi pickups begin before departure — guests are asked to be ready at
        the pickup time for their product, since the shuttle route and order
        vary day to day. At the harbor, the crew handles the gear logistics
        while divers settle in and listen to the briefing for the day&apos;s
        sites.
      </p>
      <JournalCallout title="Demonstration note">
        <p>
          This is fixture copy for the Journal&apos;s first build. The
          published version of this article would come from the crew — a real
          account of a real dive day, not a generic description.
        </p>
      </JournalCallout>
      <h2>Between dives</h2>
      <p>
        Surface intervals are spent on the boat — shaded, unhurried, and close
        to the island. It&apos;s the part of the day where questions about
        sites, conditions, and marine life actually get asked and answered.
      </p>
      <p>
        The boats return to {OPERATIONS.harbor} in the early to mid-afternoon,
        which leaves the rest of the day free — a deliberate design, because
        Saba topside is worth the hours too.
      </p>
    </>
  ),
};
