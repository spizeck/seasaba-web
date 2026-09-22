import { Suspense } from "react";
import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import { OnThisPageNav } from "@/components/partners/on-this-page-nav";
import { AccommodationsSection } from "@/components/partners/accommodations-section";
import { LocalPartnersSection } from "@/components/partners/local-partners-section";
import { DivePartnersSection } from "@/components/partners/dive-partners-section";
import { TrainingAgenciesSection } from "@/components/partners/training-agencies-section";
import { EquipmentPartnersSection } from "@/components/partners/equipment-partners-section";
import { TravelPartnersSection } from "@/components/partners/travel-partners-section";
import { ConservationPartnersSection } from "@/components/partners/conservation-partners-section";
import {
  ACCOMMODATIONS,
  PARTNERS,
  LOCAL_PARTNER_SUBCATEGORIES,
} from "@/data/partners";

export const metadata = createMetadata({
  title: "Recommended Partners",
  description:
    "Trusted Sea Saba partners for accommodations, transportation, restaurants, activities, dive operators, training agencies, equipment brands, travel organizers, and conservation.",
  path: "/partners",
});

export default function PartnersPage() {
  const localPartners = PARTNERS.filter((p) => p.category === "local");
  const divePartners = PARTNERS.filter((p) => p.category === "dive");
  const trainingAgencies = PARTNERS.filter((p) => p.category === "training");
  const equipmentPartners = PARTNERS.filter((p) => p.category === "equipment");
  const travelPartners = PARTNERS.filter((p) => p.category === "travel");
  const conservationPartners = PARTNERS.filter((p) => p.category === "conservation");

  return (
    <>
      <PageHero
        src="/images/optimized/saba-goat-hero.webp"
        alt="A Saba goat on the island's scenic hillside"
        title="Recommended Partners"
        subtitle="Trusted places to stay, eat, dive, and explore on Saba and beyond"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        We work with a small, curated group of local and regional partners that help make a Saba dive trip seamless — from boutique accommodations and island restaurants to trusted transportation, training agencies, and conservation organizations.
      </p>

      <OnThisPageNav />

      <Suspense fallback={<div className="mt-14 h-64 animate-pulse rounded-xl bg-muted/40" aria-label="Loading accommodations" />}>
        <AccommodationsSection accommodations={ACCOMMODATIONS} />
      </Suspense>
      <LocalPartnersSection partners={localPartners} subcategories={LOCAL_PARTNER_SUBCATEGORIES} />
      <DivePartnersSection partners={divePartners} />
      <TrainingAgenciesSection partners={trainingAgencies} />
      <EquipmentPartnersSection partners={equipmentPartners} />
      <TravelPartnersSection partners={travelPartners} />
      <ConservationPartnersSection partners={conservationPartners} />
    </>
  );
}
