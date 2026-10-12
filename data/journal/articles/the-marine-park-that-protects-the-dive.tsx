import Link from "next/link";
import { JournalCallout } from "@/components/journal/callout";
import { OPERATIONS } from "@/data/operations";
import type { JournalArticle } from "../types";

/**
 * DEMO FIXTURE — neutral placeholder copy for the Journal foundation (#243).
 * The Marine Park establishment year is already published on the About page;
 * fee figures come from data/operations.ts. Nothing else is invented.
 */
export const article: JournalArticle = {
  slug: "the-marine-park-that-protects-the-dive",
  title: "The Marine Park That Protects the Dive",
  description:
    "Saba's reefs have been actively managed since 1987. A short look at what the Marine Park is and why it matters to every dive here.",
  publishedAt: "2026-10-07",
  updatedAt: "2026-10-08",
  category: "Conservation",
  author: { name: "Sea Saba", type: "Organization" },
  hero: {
    src: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
    alt: "A nurse shark resting on the reef at Ladder Bay, Saba",
    position: "center 40%",
  },
  demo: true,
  cta: { label: "Explore diving on Saba", href: "/diving" },
  body: (
    <>
      <p>
        Every dive on Saba happens inside the Saba Marine Park, the protected
        area that has managed the island&apos;s reefs since 1987. It&apos;s
        easy to treat that as background detail. It isn&apos;t: the condition
        of the diving here is a direct result of that management.
      </p>
      <h2>What the park does</h2>
      <p>
        Mooring systems, zone rules, patrols, and monitoring: the unglamorous
        work that keeps anchors off coral and sites diveable year after year.
        Divers see the result rather than the mechanism: intact reef, moorings
        on the sites, and rules that are explained in every briefing.
      </p>
      <JournalCallout title="What divers contribute">
        <p>
          A per-dive contribution to the Marine Park and the island&apos;s
          hyperbaric chamber fund is built into diving here:{" "}
          {`$${OPERATIONS.conservationFees.marineParkPerDiveUsd}`} to the park
          and{" "}
          {`$${OPERATIONS.conservationFees.chamberContributionPerDiveUsd}`} to
          the chamber fund
          . It&apos;s small, and it adds up to real funding over a season.
        </p>
      </JournalCallout>
      <h2>Why it matters to your dive</h2>
      <p>
        Practically: divers follow park rules (moorings only, no touching,
        gloves off where required). The{" "}
        <Link href="/diving">diving page</Link> and every dive briefing cover
        the specifics. The payoff is a reef system that still looks like the
        reason people come here.
      </p>
    </>
  ),
};
