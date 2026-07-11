import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Anchor,
  Check,
  HelpCircle,
  Ship,
  ShieldCheck,
  Calendar,
  Users,
  MapPin,
  Wind,
  ArrowRight,
} from "lucide-react";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { TrackedOutboundButton } from "@/components/tracked-outbound-button";
import { PageSectionNav } from "@/components/navigation/PageSectionNav";
import { yachtDivingAnchors } from "@/lib/anchors";

export const metadata = createMetadata({
  title: "Arriving by Private Yacht | Plan Your Trip to Saba",
  description:
    "Planning to visit Saba aboard your own yacht? Learn about customs, immigration, moorings, and how Sea Saba can take you diving in the Saba National Marine Park.",
  path: "/plan-your-trip/yacht-diving",
});

const FAQS = [
  {
    question: "Can I scuba dive from my own yacht?",
    answer:
      "Independent scuba diving is not permitted in the Saba National Marine Park. All scuba diving must be conducted with a licensed local dive operator such as Sea Saba.",
  },
  {
    question: "Can Sea Saba pick us up from our yacht?",
    answer:
      "Yes. Depending on sea conditions and the size of your vessel, Sea Saba may come alongside or arrange a rendezvous dive from your yacht. The final decision always rests with the Sea Saba captain.",
  },
  {
    question: "Can we dive from our own tender?",
    answer:
      "Sea Saba can provide a professional dive guide for guests using their own tender or support boat, provided the platform is suitable. The dive platform must be 16 metres (52 feet) or less, have a safe boarding ladder, VHF radio, Alpha flag, a competent operator remaining aboard, and emergency oxygen.",
  },
  {
    question: "Do you offer private dive charters?",
    answer:
      "Yes. Private dive charters are the most popular option for visiting yachts. They operate on your schedule, use custom dive boats, and offer flexible dive sites ideal for cruising yachts and superyachts.",
  },
  {
    question: "Where can I moor my yacht in Saba?",
    answer:
      "Visiting yachts can use designated moorings managed by the Saba Conservation Foundation within the Saba National Marine Park. Anchoring is restricted to protect the seabed.",
  },
] as const;

export default function YachtDivingPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/sailboat-saba.webp"
        alt="A sailboat cruising near the dramatic coastline of Saba"
        title="Arriving by Private Yacht"
        subtitle="Planning to visit Saba aboard your own yacht? Learn about customs and immigration, moorings, and the different ways Sea Saba can take you diving in the Saba National Marine Park."
        objectPosition="center center"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Sea Saba regularly works with visiting yachts and superyachts. Whether you are cruising through the Caribbean or planning a longer stay, we can help you experience world-class diving in the Saba National Marine Park while your vessel is safely moored at Fort Bay.
      </p>

      {/* On This Page */}
      <PageSectionNav
        className="mt-8"
        offset={0}
        items={[
          { id: yachtDivingAnchors.divingRegulations, label: "Diving Regulations" },
          { id: yachtDivingAnchors.waysToDive, label: "Ways to Dive with Sea Saba" },
          { id: yachtDivingAnchors.arrivingInSaba, label: "Arriving in Saba" },
          { id: yachtDivingAnchors.moorings, label: "Moorings & Marine Park" },
          { id: yachtDivingAnchors.faq, label: "FAQ" },
        ]}
      />

      {/* Hero CTA */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <TrackedInternalButton
          size="lg"
          className="text-base font-semibold"
          href="/contact?interest=private-charter"
          eventName="book_now_click"
          buttonText="Contact Sea Saba"
        >
          Contact Sea Saba
        </TrackedInternalButton>
        <Button asChild variant="outline" size="lg" className="text-base font-semibold">
          <Link href="/plan-your-trip">Back to Plan Your Trip</Link>
        </Button>
      </div>

      {/* Diving Regulations */}
      <section id={yachtDivingAnchors.divingRegulations} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Diving Regulations</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The Saba National Marine Park is a protected area with clear rules designed to preserve its reefs, pinnacles, and marine life for future generations.
        </p>

        <div className="mt-6 rounded-lg border border-border/60 bg-card p-6">
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">Independent scuba diving is not permitted</strong> within the Saba National Marine Park.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">All scuba diving must be conducted with a licensed local dive operator.</strong>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Sea Saba can provide experienced local guides, custom dive boats, rental equipment, Nitrox fills, and logistical support for visiting yachts.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* Ways to Dive with Sea Saba */}
      <section id={yachtDivingAnchors.waysToDive} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Ship className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Ways to Dive with Sea Saba</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We offer several flexible options for yacht guests who want to dive in the Saba National Marine Park.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Private Dive Charter */}
          <div className="relative flex flex-col rounded-lg border border-primary/50 bg-card p-6 ring-1 ring-primary/20 transition-colors hover:border-primary/30 sm:col-span-2">
            <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              Recommended
            </span>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Anchor className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Private Dive Charter</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The most popular option for visiting yachts. A private dive charter operates on your schedule, uses custom dive boats, and gives you the flexibility to choose dive sites around Saba. It is ideal for cruising yachts and superyachts that want a seamless, exclusive experience.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Most popular option for visiting yachts
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Operates on your schedule
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Custom dive boats
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Flexible dive sites
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Ideal for cruising yachts and superyachts
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <TrackedInternalButton
                className="w-full"
                href="/book?item=private"
                eventName="book_now_click"
                buttonText="Book Private Charter"
              >
                Book a Private Charter &rarr;
              </TrackedInternalButton>
            </div>
          </div>

          {/*
            Developer note: Legal disclaimers and terms for rendezvous/support-boat
            operations belong on the Terms & Conditions page, not here. See
            app/(content)/terms/page.tsx -> "Rendezvous Diving & Support Boat Operations".
          */}
          {/* Guided Diving from Tender */}
          <div className="flex flex-col rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Guided Diving from Your Tender</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sea Saba can provide a professional dive guide while guests use their own tender or support boat. This flexible arrangement is often called rendezvous diving and can be an efficient option for larger yachts.
            </p>
            <div className="mt-4 rounded-md bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Requirements</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Dive platform must be 16 metres (52 feet) or less so it can use Saba&apos;s designated dive moorings
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Safe boarding ladder
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  VHF radio
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Alpha flag displayed
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Competent operator remaining aboard
                </li>
                <li className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  Emergency oxygen (Sea Saba can provide oxygen with advance notice)
                </li>
              </ul>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              The final decision regarding suitability always rests with the Sea Saba captain.
            </p>
            <div className="mt-auto pt-6">
              <TrackedInternalButton
                variant="outline"
                className="w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
                href="/contact?interest=private-charter"
                eventName="book_now_click"
                buttonText="Ask About Tender Diving"
              >
                Ask About Tender Diving &rarr;
              </TrackedInternalButton>
            </div>
          </div>

          {/* Join Scheduled Dive Trip */}
          <div className="flex flex-col rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/30">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Join a Scheduled Dive Trip</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Guests may be able to join one of Sea Saba&apos;s scheduled public dive trips directly from their yacht. This option is generally available only for Dive 2 and is always weather permitting.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Generally available only for Dive 2
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Weather permitting
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                The captain decides whether we come alongside
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Guests may instead transfer by tender
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                If conditions require, guests may meet us at Fort Bay Harbor
              </li>
            </ul>
            <div className="mt-auto pt-6">
              <TrackedInternalButton
                variant="outline"
                className="w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
                href="/diving"
                eventName="book_now_click"
                buttonText="View Scheduled Diving"
              >
                View Scheduled Diving &rarr;
              </TrackedInternalButton>
            </div>
          </div>
        </div>
      </section>

      {/* Arriving in Saba */}
      <section id={yachtDivingAnchors.arrivingInSaba} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Arriving in Saba</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Visiting yachts must complete customs, immigration, and harbor formalities before exploring the island or going diving.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">What to Expect</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Proceed directly to Fort Bay Harbor upon arrival.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Clear Customs and Immigration, then check in with the Harbor Master.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                All visitors must have a valid passport; visa requirements vary by nationality.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Every yacht must also check in with the Saba Marine Park office at Fort Bay.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Official Entry Information</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Entry requirements, forms, and customs information are maintained by the Public Entity Saba. We recommend reviewing the official guidance before your arrival.
            </p>
            <TrackedOutboundButton
              variant="outline"
              className="mt-4 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://www.sabagov.nl/units-directorates/fort-bay-harbor/entry-requirements"
              eventName="social_click"
              buttonText="Official Entry Requirements"
              aria-label="View official Saba entry requirements, opens in a new tab"
            >
              Official Entry Requirements ↗
            </TrackedOutboundButton>
          </div>
        </div>
      </section>

      {/* Moorings & Marine Park */}
      <section id={yachtDivingAnchors.moorings} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Wind className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Moorings &amp; Marine Park</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The waters around Saba are protected by the Saba National Marine Park. Proper mooring use and environmental awareness help keep the park healthy.
        </p>

        <div className="mt-6">
          <FeatureImage
            src="/images/optimized/turtle-divers-saba.webp"
            alt="Divers swimming with a sea turtle in the Saba National Marine Park"
            imageRight
            centerText
          >
          <div>
            <h3 className="text-lg font-semibold text-foreground">Protecting a Pristine Marine Park</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                The Saba National Marine Park has protected the island&apos;s waters since 1987.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Designated moorings are available for visiting yachts and licensed vessels.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Anchoring is restricted to protect coral, seagrass, and the volcanic seabed.
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                Environmental stewardship helps preserve Saba&apos;s reefs, pinnacles, and marine life.
              </li>
            </ul>
            <TrackedOutboundButton
              variant="outline"
              className="mt-5 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white"
              href="https://sabapark.org/yachting-mooring/"
              eventName="social_click"
              buttonText="Saba Conservation Foundation Moorings"
              aria-label="View Saba Conservation Foundation yachting and mooring information, opens in a new tab"
            >
              SCF Yachting &amp; Mooring ↗
            </TrackedOutboundButton>
          </div>
        </FeatureImage>
        </div>
      </section>

      {/* FAQ */}
      <section id={yachtDivingAnchors.faq} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{faq.question}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Links */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Related Pages</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/diving"
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">Diving</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
          <Link
            href="/book?item=private"
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">Private Charters</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
          <Link
            href="/contact"
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">Equipment Rental</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
          <Link
            href="/contact?interest=private-charter"
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">Contact</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
          <Link
            href={`#${yachtDivingAnchors.faq}`}
            className="group flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span className="text-sm font-medium text-foreground">FAQ</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Ready to Dive Saba from Your Yacht?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Contact Sea Saba to arrange private charters, tender diving, or scheduled trips during your visit.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <TrackedInternalButton
            size="lg"
            className="text-base font-semibold"
            href="/contact?interest=private-charter"
            eventName="book_now_click"
            buttonText="Contact Sea Saba"
          >
            Contact Sea Saba
          </TrackedInternalButton>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/book?item=private">Book a Private Charter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
