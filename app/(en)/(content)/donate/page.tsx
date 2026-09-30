import Link from "next/link";
import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import { DonationsSection } from "@/components/donations/donations-section";
import { CommunitySupportSection } from "@/components/donations/community-support-section";
import { DONATION_RECIPIENTS } from "@/data/donations";
import { OPERATIONS } from "@/data/operations";
import { divingAnchors } from "@/lib/anchors";

export const metadata = createMetadata({
  title: "Support Saba",
  description:
    "Ways to support Saba beyond your visit, and how island organizations, projects, and events can request a donation or sponsorship from Sea Saba.",
  path: "/donate",
});

export default function DonatePage() {
  return (
    <>
      <PageHero
        src="/images/optimized/windwardside-village-saba.webp"
        alt="Colorful red-roofed cottages of Windwardside village on the green hillside of Saba"
        title="Support Saba"
        subtitle="Giving back to the island and asking us to help"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Visitors fall for Saba quickly: the reefs, the trails, the quiet
        villages, and the people who keep it all running. Many guests ask how
        they can give something back once they&apos;re home. And on the island
        itself, community groups, teams, and projects regularly need a hand.
        This page is for both.
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        If you&apos;re a visitor, the most meaningful support goes straight to
        the island organizations doing the work. If you&apos;re on Saba and
        looking for a donation or sponsorship from Sea Saba, scroll down to{" "}
        <Link
          href="/donate#request-support"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Request Support from Sea Saba
        </Link>
        .
      </p>

      {/* Your Visit Already Helps */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">
          Your Visit Already Helps
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Everything we dive sits inside the Saba National Marine Park, and
          every dive carries a conservation contribution of{" "}
          ${OPERATIONS.conservationFees.marineParkPerDiveUsd + OPERATIONS.conservationFees.chamberContributionPerDiveUsd}{" "}
          per diver: ${OPERATIONS.conservationFees.marineParkPerDiveUsd} to the
          Marine Park and ${OPERATIONS.conservationFees.chamberContributionPerDiveUsd}{" "}
          to the island&apos;s hyperbaric chamber fund. Snorkel trips contribute{" "}
          ${OPERATIONS.conservationFees.snorkelParkPerPersonUsd} per person.
          These fees are set by the park and the chamber, not Sea Saba, and they
          fund the moorings, patrols, and emergency coverage that keep the
          reefs healthy.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          <Link
            href={`/diving#${divingAnchors.marinePark}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            How the Saba Marine Park works
          </Link>
        </p>
      </section>

      {/* Ways to Give Back */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">
          Ways to Give Back
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          When you&apos;re ready to do more, a number of island organizations
          welcome direct support. Every card below links out to the
          organization&apos;s own website. Your donation goes to them, not
          through us.
        </p>

        <DonationsSection recipients={DONATION_RECIPIENTS} />

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
          Any donation link on this page opens the organization&apos;s own
          website in a new tab. Sea Saba never collects, processes, or retains
          donated funds. Each organization manages its own gifts and receipts.
        </p>
      </section>

      {/* Request Support from Sea Saba — the other half of the page: local
          organizations and project leads asking Sea Saba for help. All policy
          content renders from data/community-support.ts (DRAFT pending owner
          review). */}
      <CommunitySupportSection />
    </>
  );
}
