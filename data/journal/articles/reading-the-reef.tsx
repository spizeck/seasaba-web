import Link from "next/link";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy for the Journal foundation (#243).
 * Species references stay at the level of the site's existing species
 * catalog (data/species.ts) — no invented sightings or frequency claims.
 */
export const article: JournalArticle = {
  slug: "reading-the-reef",
  title: "Reading the Reef: A Beginner's Eye on Saba's Marine Life",
  description:
    "A gentle orientation to the kinds of marine life Saba diving is known for — and where the real, dated sightings live.",
  publishedAt: "2026-10-03",
  category: "Marine Life",
  author: { name: "Sea Saba", type: "Organization" },
  hero: {
    src: "/images/optimized/green-turtle-tent-reef.webp",
    alt: "A green sea turtle swimming over the reef at Tent Reef, Saba",
  },
  demo: true,
  cta: { label: "See recent dive log entries", href: "/dive-log" },
  body: (
    <>
      <p>
        Newer divers often surface with the same reaction: there was too much
        to look at. This short note is an orientation — the broad shapes of
        marine life Saba diving involves — rather than a species guide.
      </p>
      <h2>The big, the medium, and the small</h2>
      <p>
        At the large end: turtles on the inshore reefs, and sharks — nurse
        sharks resting under ledges, reef sharks patrolling the edges of the
        deeper sites. At the medium end: rays, octopus, and the bigger reef
        fish working the structure. And then the small end, which rewards
        slowing down: crustaceans, juvenile fish, and the cryptic species the
        guides point out once your eye adjusts.
      </p>
      <h2>Where the real record lives</h2>
      <p>
        What was actually seen, on which site, on which day — that&apos;s the{" "}
        <Link href="/dive-log">dive log</Link>, which records recent dives and
        sightings from the Sea Saba boats. Journal articles will sometimes
        draw on that record, but the log remains the source of truth for
        sightings.
      </p>
      <blockquote>
        <p>
          The habit that improves reef diving fastest isn&apos;t camera skill
          or fish ID — it&apos;s slowing down.
        </p>
      </blockquote>
    </>
  ),
};
