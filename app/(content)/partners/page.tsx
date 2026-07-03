import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { PARTNERS, LOCAL_PARTNER_SUBCATEGORIES } from "@/data/partners";
import { LocalPartnersSection } from "@/components/partners/local-partners-section";
import { DivePartnersSection } from "@/components/partners/dive-partners-section";
import { TrainingAgenciesSection } from "@/components/partners/training-agencies-section";
import { EquipmentPartnersSection } from "@/components/partners/equipment-partners-section";
import { TravelPartnersSection } from "@/components/partners/travel-partners-section";
import { ConservationPartnersSection } from "@/components/partners/conservation-partners-section";

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
        src="/images/optimized/windwardside-village-saba.webp"
        alt="Windwardside village on Saba with traditional cottages and lush greenery"
        title="Recommended Partners"
        subtitle="A network of trusted local businesses, dive operators, and conservation organizations"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        From where to stay and how to get here, to the dive operators, training agencies, and conservation groups we work with, these are the partners we trust. Need help choosing the right fit?{" "}
        <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
          Contact us
        </Link>{" "}
        and we are happy to help with personalized advice.
      </p>

      <LocalPartnersSection partners={localPartners} subcategories={LOCAL_PARTNER_SUBCATEGORIES} />
      <DivePartnersSection partners={divePartners} />
      <TrainingAgenciesSection partners={trainingAgencies} />
      <EquipmentPartnersSection partners={equipmentPartners} />
      <TravelPartnersSection partners={travelPartners} />
      <ConservationPartnersSection partners={conservationPartners} />

      <section className="mt-16 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <MessageCircle className="mx-auto h-6 w-6 text-primary" />
        <h2 className="mt-3 text-xl font-semibold text-foreground">Need a Recommendation?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Not sure which accommodation, restaurant, or activity is the right fit for your trip? Our team knows Saba well and is happy to point you in the right direction.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/plan-your-trip">Plan Your Trip</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
