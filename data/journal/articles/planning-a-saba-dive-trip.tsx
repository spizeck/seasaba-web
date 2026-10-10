import Link from "next/link";
import { planYourTripAnchors } from "@/lib/anchors";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy for the Journal foundation (#243).
 * This article only routes readers to the canonical planning pages; it
 * carries no invented logistics, prices, or schedules.
 */
export const article: JournalArticle = {
  slug: "planning-a-saba-dive-trip",
  title: "Planning a Dive Trip to Saba: Where to Start",
  description:
    "Saba rewards a little planning. A short orientation to the decisions that matter — getting there, where to stay, and when to come.",
  publishedAt: "2026-09-25",
  category: "Trip Planning",
  author: { name: "Sea Saba", type: "Organization" },
  hero: {
    src: "/images/optimized/saba-island-aerial-golden-hour.webp",
    alt: "Aerial view of Saba's volcanic coastline and villages at golden hour",
  },
  demo: true,
  related: ["a-dive-day-on-saba", "why-saba-dives-differently"],
  cta: { label: "Plan your trip", href: "/plan-your-trip" },
  body: (
    <>
      <p>
        Saba is a small island with no beaches and no cruise-ship pier — which
        is exactly why the diving is the way it is. It also means a trip here
        is planned a little differently than a trip to a larger Caribbean
        destination.
      </p>
      <h2>The three decisions that matter</h2>
      <ul>
        <li>
          <strong>Getting there.</strong> Saba is reached via St. Maarten — by
          a famously short flight or by ferry. The{" "}
          <Link href={`/plan-your-trip#${planYourTripAnchors.gettingHere}`}>
            getting here guide
          </Link>{" "}
          covers both.
        </li>
        <li>
          <strong>Where to stay.</strong> The island&apos;s villages each have
          a different feel; the{" "}
          <Link href={`/plan-your-trip#${planYourTripAnchors.whereToStay}`}>
            where to stay section
          </Link>{" "}
          walks through them.
        </li>
        <li>
          <strong>When to come.</strong> Saba dives year-round, but seasons
          shift the topside experience more than the underwater one — see{" "}
          <Link href={`/plan-your-trip#${planYourTripAnchors.whenToVisit}`}>
            when to visit
          </Link>
          .
        </li>
      </ul>
      <h2>How much diving to plan for</h2>
      <p>
        Most visiting divers plan consecutive dive days rather than single
        trips — the package structure on the{" "}
        <Link href="/diving">diving page</Link> is built around that pattern,
        and it&apos;s what most repeat guests end up doing.
      </p>
      <p>
        One practical note: build a rest or low-activity day into the middle
        of a longer stay. The island&apos;s hiking is worth a morning, and
        your ears will thank you.
      </p>
    </>
  ),
};
