import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Anchor, Ship, ClipboardCheck, Waves, Wind, MessageCircle, FileText } from "lucide-react";
import { PageSectionNav } from "@/components/navigation/PageSectionNav";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import { CONTACT } from "@/lib/constants";
import { visitingYachtsAnchors, divingAnchors } from "@/lib/anchors";
import { DIVE_PRODUCTS, OPERATIONS, bookingHref } from "@/data/operations";

export const metadata = createMetadata({
  title: "Visiting Saba by Yacht or Sailboat",
  description:
    "A practical guide for yachts and sailboats visiting Saba: Fort Bay arrival and clearance, Marine Park moorings, and how to dive with Sea Saba from your vessel.",
  path: "/visiting-yachts",
});

const SCHEDULED_TRIPS = [
  {
    name: DIVE_PRODUCTS.classic.name,
    summary: `Two relaxed guided dives; departs ${DIVE_PRODUCTS.classic.schedule.departure}. Our most popular trip and the right fit for most certified divers.`,
    href: bookingHref("classic"),
    slug: DIVE_PRODUCTS.classic.slug,
    cta: "Book Classic Diving",
  },
  {
    name: DIVE_PRODUCTS.advanced.name,
    summary: `Our earlier ${DIVE_PRODUCTS.advanced.schedule.departure} trip for more experienced divers, with access to advanced dive profiles when conditions allow. Eligibility: ${DIVE_PRODUCTS.advanced.requirement}.`,
    href: bookingHref("advanced"),
    slug: DIVE_PRODUCTS.advanced.slug,
    cta: "Book Advanced Diving",
  },
  {
    name: DIVE_PRODUCTS.afternoon.name,
    summary: `A single afternoon dive departing ${DIVE_PRODUCTS.afternoon.schedule.departure}. Easy to add around your arrival or departure day.`,
    href: bookingHref("afternoon"),
    slug: DIVE_PRODUCTS.afternoon.slug,
    cta: "Book Afternoon Dive",
  },
  {
    name: DIVE_PRODUCTS.snorkel.name,
    summary: `Non-divers in the crew can join the afternoon boat and snorkel while the divers are below.`,
    href: bookingHref("snorkel"),
    slug: DIVE_PRODUCTS.snorkel.slug,
    cta: "Book Snorkeling",
  },
] as const;

export default function VisitingYachtsPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/fort-bay-harbor-saba.webp"
        alt="Fort Bay Harbor on Saba, the island's port of entry for visiting yachts"
        title="Visiting Saba by Yacht"
        subtitle="Arriving, clearing in, and diving with Sea Saba from Fort Bay"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Cruising yachts and sailboats stop at Saba every season for a few days of diving, hiking,
        and a quieter island. This page covers the practical side of that visit: where to secure
        your vessel, how clearance works, and how to dive with us while you&apos;re here.
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        One note up front: Sea Saba is a dive center at {OPERATIONS.harbor}, not the port
        authority. Harbor, customs, immigration, and Marine Park rules are set by the Public
        Entity Saba and the Saba Conservation Foundation, and they can change. We link to the
        official sources throughout, and it&apos;s worth verifying requirements before you arrive.
      </p>

      {/* On This Page */}
      <PageSectionNav
        className="mt-8"
        offset={0}
        items={[
          { id: visitingYachtsAnchors.arriving, label: "Arriving" },
          { id: visitingYachtsAnchors.mooring, label: "Moorings" },
          { id: visitingYachtsAnchors.comingAshore, label: "Coming Ashore" },
          { id: visitingYachtsAnchors.diving, label: "Diving" },
          { id: visitingYachtsAnchors.charter, label: "Private Charter" },
          { id: visitingYachtsAnchors.equipment, label: "Tanks & Gear" },
          { id: visitingYachtsAnchors.conditions, label: "Conditions" },
          { id: visitingYachtsAnchors.contact, label: "Contact" },
        ]}
      />

      {/* Arriving on Saba by Yacht */}
      <section id={visitingYachtsAnchors.arriving} className="mt-12 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Ship className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Arriving on Saba by Yacht</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Fort Bay, on Saba&apos;s southwest coast, is the island&apos;s harbor and the port of
          entry for visiting vessels. The Public Entity Saba and the Saba Conservation Foundation
          both direct arriving yachts to proceed to Fort Bay as soon as possible. We strongly
          advise against coming ashore anywhere else: Well&apos;s Bay, Ladder Bay, and Cove Bay
          can be treacherous in sea conditions that look calm from aboard your vessel.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The clearance sequence published by the Marine Park:
        </p>
        <ol className="mt-4 space-y-2.5 text-sm text-muted-foreground">
          {[
            "Secure your vessel on a mooring or the check-in buoy",
            "Dinghy to Fort Bay",
            "Clear Customs and Immigration",
            "Check in and out with the Harbor Master",
            "Register your yacht at the Saba National Marine Park office, also at Fort Bay",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          The Harbor Office is open from 6 AM to 6 PM; if Customs and Immigration aren&apos;t
          available when you land, proceed there directly. The Harbor Master monitors VHF
          channel 16. Entry forms for customs, immigration, and yacht registration can be
          completed in advance.
        </p>

        <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm text-muted-foreground">
              <p>
                Official sources for current requirements:
              </p>
              <ul className="mt-2 space-y-1.5">
                <li>
                  <Link href="https://www.sabagov.nl/units-directorates/fort-bay-harbor/entry-requirements" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
                    Public Entity Saba: Fort Bay entry requirements ↗
                  </Link>
                </li>
                <li>
                  <Link href="https://sabapark.org/yachting-mooring/check-in-procedure-coming-ashore/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
                    Saba Conservation Foundation: check-in procedure ↗
                  </Link>
                </li>
                <li>
                  <Link href="https://www.sabagov.nl/units-directorates/fort-bay-harbor/entry-requirements/entry-forms" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
                    Entry forms for customs, immigration, and yacht registration ↗
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Moorings & Anchoring */}
      <section id={visitingYachtsAnchors.mooring} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Anchor className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Moorings &amp; Anchoring</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The Saba National Marine Park circles the entire island from the high-water mark down
          to 60 m (200 ft), so almost everywhere you&apos;d stop counts as park waters. The park
          is managed by the Saba Conservation Foundation, and mooring and anchoring are their
          rules, not ours.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Yacht Moorings</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Yellow moorings are for visiting yachts up to 20 m (66 ft) or 50 t</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>First-come, first-served; they cannot be reserved</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Maximum stay of seven days on a mooring</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Red and white moorings are reserved for licensed dive vessels</span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Anchoring &amp; Fees</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Anchoring is only allowed in designated anchorage zones, never on coral or in recreational dive zones</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Yacht fee: $3 per person (vessels over 100 tons: $0.10 per ton)</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Nature fee: $1 per visitor per night, charged at yacht registration</span></li>
            </ul>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Moorings can&apos;t be reserved and availability depends on the season, so have a plan
          for arriving when the moorings are taken. Current fees and mooring details are published
          by the{" "}
          <Link href="https://sabapark.org/yachting-mooring/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            Saba Conservation Foundation ↗
          </Link>{" "}
          and the{" "}
          <Link href="https://sabapark.org/yachting-mooring/cost-of-mooring/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            mooring fee schedule ↗
          </Link>
          .
        </p>
      </section>

      {/* Coming Ashore at Fort Bay */}
      <section id={visitingYachtsAnchors.comingAshore} className="mt-14 scroll-mt-40">
        <FeatureImage
          src="/images/optimized/fort-bay-two-boats.webp"
          alt="Sea Saba's dive boats moored at Fort Bay Harbor, Saba"
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Coming Ashore at Fort Bay</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Everything you need on arrival is at Fort Bay: Customs and Immigration, the Harbor
              Office, the Marine Park office, and us. Sea Saba&apos;s dive center is at 66 Fort
              Bay Harbor, a short walk along the waterfront, so once your vessel is secured and
              you&apos;re cleared in, you can literally walk to the dive shop.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Dock space and dinghy landing arrangements are the harbor&apos;s domain. If
              you&apos;re unsure where to leave the dinghy, ask at the Harbor Office when you
              check in.
            </p>
          </div>
        </FeatureImage>
      </section>

      {/* Diving with Sea Saba from Your Yacht */}
      <section id={visitingYachtsAnchors.diving} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Waves className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Diving with Sea Saba from Your Yacht</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The simplest way to dive Saba from a visiting vessel is to leave the yacht on its
          mooring and join one of our guided boats. Our trips depart from and return to{" "}
          {OPERATIONS.harbor}, so there&apos;s no taxi to coordinate: you&apos;re already where
          the boats leave. Rental equipment is available, a dive computer is required on every
          dive (rentals available), and groups stay small at a maximum of{" "}
          {OPERATIONS.maxRecreationalDiversPerGuide} divers per guide.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The same eligibility rules apply as for every guest, and conservation contributions of{" "}
          ${OPERATIONS.conservationFees.marineParkPerDiveUsd + OPERATIONS.conservationFees.chamberContributionPerDiveUsd}{" "}
          per diver, per dive support the Marine Park and the island&apos;s hyperbaric chamber.
          The full guide to our trips, certification fit, equipment, and park rules lives on the{" "}
          <Link href="/diving" className="font-medium text-primary hover:underline underline-offset-4">
            Diving page
          </Link>
          .
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {SCHEDULED_TRIPS.map((trip) => (
            <div key={trip.slug} className="flex flex-col rounded-lg border border-border/60 bg-card p-5">
              <h3 className="text-base font-semibold text-foreground">{trip.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{trip.summary}</p>
              <TrackedInternalButton
                variant="outline"
                className="mt-4 w-full"
                href={trip.href}
                eventName="book_now_click"
                buttonText={trip.cta}
                buttonLocation="visiting_yachts_trip_card"
                bookingItem={trip.slug}
              >
                {trip.cta}
              </TrackedInternalButton>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold text-foreground">Booking and timing</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Book ahead where you can. Space on scheduled trips depends on availability, and we can&apos;t promise same-day seats.</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Published pickup times are for hotel guests; from a yacht, simply be at the dive center ahead of the boat&apos;s departure time.</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>If you book online, <Link href="/contact?interest=visiting-yacht" className="font-medium text-primary hover:underline underline-offset-4">send us a quick note</Link> or <Link href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">WhatsApp</Link> afterward to let us know you&apos;re arriving by vessel, so we know you don&apos;t need the shuttle.</span></li>
          </ul>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Thinking about diving independently from your own vessel? That&apos;s governed by the
          Marine Park&apos;s rules, not ours. Check current requirements with the{" "}
          <Link href="https://sabapark.org/saba-national-marine-park/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            Saba Conservation Foundation ↗
          </Link>{" "}
          before planning unguided dives. Sea Saba&apos;s diving is guided, from our boats.
        </p>
      </section>

      {/* Private Charter */}
      <section id={visitingYachtsAnchors.charter} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Ship className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Prefer Your Own Boat for the Day?</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A {DIVE_PRODUCTS.private.name.toLowerCase()} makes sense when the whole crew wants to
          dive together: mixed experience levels, a schedule shaped around your visit, or simply
          the privacy of your own boat and guide ({DIVE_PRODUCTS.private.capacity.toLowerCase()}).
          Routes and sites still follow the Marine Park&apos;s rules and the day&apos;s
          conditions, but the boat and the pace are yours.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <TrackedInternalButton
            variant="default"
            href={bookingHref("private")}
            eventName="book_now_click"
            buttonText="Book Private Charter"
            buttonLocation="visiting_yachts_charter"
            bookingItem={DIVE_PRODUCTS.private.slug}
          >
            Book Private Charter
          </TrackedInternalButton>
          <Button asChild variant="outline">
            <Link href="/contact?interest=private-charter">Ask About a Charter</Link>
          </Button>
        </div>
      </section>

      {/* Tanks, Fills & Equipment */}
      <section id={visitingYachtsAnchors.equipment} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Wind className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Tanks, Fills &amp; Equipment</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For dives with us, equipment is easy: full rental packages cover BCD, regulator,
          wetsuit, mask, and fins, and rental dive computers are available. Sea Saba fills its
          own cylinders, air and {OPERATIONS.nitroxBlend} Nitrox, for our trips, and certified
          Nitrox divers get complimentary Nitrox on qualifying dives.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For anything beyond gear for our own trips (fills for privately owned cylinders,
          tank exchange, or delivery to your vessel), please ask before you arrive rather than
          assuming. We&apos;ll tell you honestly what we can and can&apos;t do.
        </p>
      </section>

      {/* Conditions */}
      <section id={visitingYachtsAnchors.conditions} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Waves className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Weather &amp; Sea Conditions</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba sits in open ocean, and conditions drive everything: which sites we can dive,
          how comfortable a mooring is, and how easy the dinghy landing feels. Our crew chooses
          each day&apos;s sites for the actual weather, and the east side of the island is only
          diveable in settled conditions.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Build a weather buffer into your stay if diving is a priority, and check marine
          forecasts before and during your passage. If a scheduled dive day looks marginal, talk
          to us. Rescheduling is usually easier than forcing a rough day.
        </p>
      </section>

      {/* Contact Before Arrival */}
      <section id={visitingYachtsAnchors.contact} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Tell Us Before You Arrive</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Yacht visits work a little differently from hotel stays, so a quick note before you
          arrive goes a long way. Tell us your dates, how many divers, certifications, and what
          you&apos;d like to do, and we&apos;ll suggest the right trips or a charter to fit your
          stay.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/contact?interest=visiting-yacht">
              <ClipboardCheck className="h-4 w-4" />
              Contact Us About Your Visit
            </Link>
          </Button>
          <TrackedContactLink
            href={CONTACT.whatsappHref}
            eventName="whatsapp_click"
            buttonText="WhatsApp — visiting yachts"
            external
            className="inline-flex items-center justify-center rounded-md border border-green-700 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 hover:text-green-800"
          >
            WhatsApp Sea Saba
          </TrackedContactLink>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          The contact form prepares your inquiry in your own email app; it doesn&apos;t send
          anything from the website directly.
        </p>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to dive Saba?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Secure the boat, clear in at Fort Bay, and come see us. We&apos;ll handle the diving.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <TrackedInternalButton
            size="lg"
            className="text-base font-semibold"
            href="/book"
            eventName="book_now_click"
            buttonText="Book Diving"
            buttonLocation="visiting_yachts_footer_cta"
          >
            Book Diving
          </TrackedInternalButton>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href={`/diving#${divingAnchors.options}`}>See the Dive Options</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
