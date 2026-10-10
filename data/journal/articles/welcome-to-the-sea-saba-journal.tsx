import Link from "next/link";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy written to prove the Journal
 * system (#243). Not reviewed editorial content; do not publish as-is.
 * Describes only the Journal itself, so it contains no invented facts.
 */
export const article: JournalArticle = {
  slug: "welcome-to-the-sea-saba-journal",
  title: "Welcome to the Sea Saba Journal",
  description:
    "An introduction to the Sea Saba Journal — what it is, what it will cover, and what readers can expect from it.",
  publishedAt: "2026-09-15",
  category: "Sea Saba News",
  author: { name: "Sea Saba", type: "Organization" },
  hero: {
    src: "/images/optimized/guests-on-bow-saba.webp",
    alt: "Guests on the bow of a Sea Saba boat heading out for a dive day",
  },
  demo: true,
  cta: { label: "Explore Saba's dive sites", href: "/dive-sites" },
  body: (
    <>
      <p>
        The Sea Saba Journal is a new section of this website: a place for
        longer notes on diving Saba that don&apos;t fit on the main pages.
        This demonstration article exists to show what a Journal entry looks
        like — the headline, the byline and date line, the hero photograph,
        and the reading column you&apos;re in now.
      </p>
      <p>
        The Journal is organized into a small set of categories: Diving Saba,
        Marine Life, Trip Planning, From the Boats, Conservation, and Sea Saba
        News. Each story carries one of those labels, a publication date, and
        a byline — the same information shown in the header above.
      </p>
      <h2>What belongs here</h2>
      <p>
        Journal stories will be practical and specific: what a dive day looks
        like, how to think about planning a trip to a small island, notes on
        the marine environment the boats work in every week. The same kind of
        material the crew already talks about at the dock — written down.
      </p>
      <p>
        Everything here stays grounded in what the operation actually does.
        When a story refers to schedules, sites, or rules, it will point back
        to the pages that carry the canonical details —{" "}
        <Link href="/diving">the diving overview</Link>,{" "}
        <Link href="/dive-sites">the dive sites guide</Link>, and{" "}
        <Link href="/plan-your-trip">the trip-planning pages</Link>.
      </p>
    </>
  ),
};
