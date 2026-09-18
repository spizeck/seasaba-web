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
        your vessel, how clearance works, and how to dive with us while you&apos;re here. We work
        with everything from cruising sailboats to superyachts.
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Sea Saba is a dive center at {OPERATIONS.harbor}, not the port authority. Harbor, customs,
        immigration, and Marine Park rules are set by the Public Entity Saba and the Saba
        Conservation Foundation, and they can change. We link to the official sources throughout.
        It&apos;s worth verifying requirements before you arrive.
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
          { id: visitingYachtsAnchors.charter, label: "Private & Larger Yachts" },
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
          Moorings can&apos;t be reserved by guests or by Sea Saba. It&apos;s uncommon for every
          suitable visiting-yacht mooring to be taken, but availability depends on the season.
          Larger yachts generally anchor in the designated anchorage areas; the yacht moorings
          aren&apos;t designed for their size. If you want a current picture of the moorings and
          conditions,{" "}
          <Link href="/contact?interest=visiting-yacht" className="font-medium text-primary hover:underline underline-offset-4">
            ask us before you arrive
          </Link>
          . Current fees and mooring details are published by the{" "}
          <Link href="https://sabapark.org/yachting-mooring/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            Saba Conservation Foundation ↗
          </Link>{" "}
          and the{" "}
          <Link href="https://sabapark.org/yachting-mooring/cost-of-mooring/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            mooring fee schedule ↗
          </Link>
          .
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Saba&apos;s harbor infrastructure is also expanding. The{" "}
          <Link href="https://www.sabagov.nl/residents/infrastructure-spatial-development/projects-developments/black-rocks-harbor" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            Black Rocks Harbor project ↗
          </Link>{" "}
          is now under construction. We&apos;ll update this guide as the new harbor&apos;s yacht
          facilities and operating procedures are finalized.
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
              Office, the Marine Park office, and us. Fort Bay is Saba&apos;s only harbor, and
              Sea Saba&apos;s dive center at 66 Fort Bay Harbor sits close to both piers. Walking
              the full length of the harbor takes about five minutes.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Dock space and dinghy landing arrangements are the harbor&apos;s domain. If
              you&apos;re unsure where to leave the dinghy, ask at the Harbor Office when you
              check in. If you have a lot of gear to move, we can run it between the dock and the
              shop on our flatbed trucks.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Sea Saba monitors VHF channel 10; that&apos;s the channel for reaching the shop and
              our boats. We also keep a watch on channel 16, but that channel belongs to the
              Harbor Master and emergency traffic, so use 10 for us.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              Need to get online while you&apos;re ashore? We run an open guest Wi-Fi network at
              the Fort Bay office. Join through the guest portal and you get about 12 hours of
              access. It covers the area around the shop; don&apos;t count on it out on the
              moorings.
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
          The standard approach is to leave the yacht on its mooring, dinghy into Fort Bay, and
          join one of our scheduled boats. Bring your gear straight to the dive center and we can
          store it for you between dive days, and being at the shop means backup equipment is
          close by if anything gives you trouble. Our trips depart from and return to{" "}
          {OPERATIONS.harbor}, so there&apos;s no hotel pickup to coordinate. Just be at the dive
          center about 30 minutes before the boat leaves. Rental equipment is available, a dive
          computer is required on every dive (rentals available), and groups stay small at a
          maximum of {OPERATIONS.maxRecreationalDiversPerGuide} divers per guide.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          In some situations we can arrange a pickup from your vessel for the later dives of the
          day. It&apos;s not practical for the first dive, and it depends on your position, the
          conditions, and the day&apos;s schedule. If that would make your visit easier, ask us in
          advance rather than counting on it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          After diving you&apos;re welcome on our normal scheduled shuttle into town, and we can
          help coordinate taxis for anything beyond that.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The same eligibility rules apply as for every guest. Conservation contributions of{" "}
          ${OPERATIONS.conservationFees.marineParkPerDiveUsd + OPERATIONS.conservationFees.chamberContributionPerDiveUsd}{" "}
          per diver, per dive (Marine Park and hyperbaric chamber) come through on your Sea Saba
          diving invoice. Mooring, yacht registration, and harbor fees are handled separately,
          directly with the Marine Park and the Harbor Office. The full guide to our trips,
          certification fit, equipment, and park rules is on the{" "}
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
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Published pickup times are for hotel guests. From a yacht, be at the dive center about 30 minutes ahead of the boat&apos;s departure time.</span></li>
            <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>When booking online, tell us your vessel&apos;s name in the booking notes, or <Link href="/contact?interest=visiting-yacht" className="font-medium text-primary hover:underline underline-offset-4">send us a quick note</Link> or <Link href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">WhatsApp</Link> afterward so we know you&apos;ll be meeting us at Fort Bay rather than waiting for hotel pickup. Cell service can be weak around Ladder Bay, so it&apos;s worth reaching out before you arrive.</span></li>
          </ul>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Thinking about diving from your own vessel without a guide? Independent diving
          isn&apos;t permitted in the Saba National Marine Park. All scuba diving must be done
          with one of Saba&apos;s licensed dive operators, as stated on the Marine Park&apos;s{" "}
          <Link href="https://sabapark.org/wp-content/uploads/2026/03/SCF_Yacht_Registration_Form_2012.pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline underline-offset-4">
            yacht registration form ↗
          </Link>
          . Sea Saba&apos;s diving is guided, from our boats.
        </p>
      </section>

      {/* Private Charter */}
      <section id={visitingYachtsAnchors.charter} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <Ship className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Larger Yachts &amp; Private Diving</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A {DIVE_PRODUCTS.private.name.toLowerCase()} makes sense when the whole crew wants to
          dive together: mixed experience levels, a schedule shaped around your visit, or simply
          the privacy of your own boat and guide ({DIVE_PRODUCTS.private.capacity.toLowerCase()}).
          Routes and sites still follow the Marine Park&apos;s rules and the day&apos;s
          conditions, but the boat and the pace are yours.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We regularly work with larger yachts and superyachts, where a fully customized program
          usually fits better than a seat on a scheduled boat. Two setups cover most visits:
        </p>
        <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">A private charter on a Sea Saba boat.</strong>{" "}
              Our boat, our crew and guide, and a schedule and dive profile shaped to your guests
              and the conditions. It&apos;s the normal private-charter idea, arranged around your
              vessel&apos;s timetable.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 text-primary">✓</span>
            <span>
              <strong className="font-medium text-foreground">A Sea Saba guide aboard your tender.</strong>{" "}
              Common for larger and mega yachts: your tender normally picks the guide up, and the
              diving runs from the tender rather than the yacht itself. Even when our boat comes
              out to a large vessel, guests transfer by tender. We can provide whatever the
              planned diving needs, including cylinders, weights, rental equipment, and first-aid
              and oxygen kits. Many large yachts already carry substantial dive gear, in which
              case our guide may simply join with tanks and personal kit.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          For diving from a customer&apos;s tender, we&apos;ll confirm the tender and its safety
          equipment are appropriate before the diving plan is finalized. We&apos;re looking for a
          suitable dive platform and ladder, first-aid kit, oxygen, ship-to-shore radio, and a
          dive flag. If anything is missing we can supply first-aid and oxygen equipment,
          including DAN combination kits. Pricing and arrangements are tailored, so tell us what
          you have aboard and what you&apos;re planning.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For highly experienced or technical divers,{" "}
          <Link href="/contact?interest=private-charter" className="font-medium text-primary hover:underline underline-offset-4">
            contact us about a custom program
          </Link>
          . Profiles can be tailored to your guests&apos; certification and experience.
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
          For dives with us, equipment is easy: tanks and weights are part of the diving, full
          rental packages cover BCD, regulator, wetsuit, mask, and fins, and rental dive
          computers are available. Sea Saba fills its own cylinders for our trips, both air and{" "}
          {OPERATIONS.nitroxBlend} Nitrox. Certified Nitrox divers get complimentary Nitrox on
          qualifying dives.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For private yacht operations we can supply whatever the planned diving needs, including
          cylinders, weights, rental equipment, and first-aid or oxygen kits. Tell us what&apos;s
          already aboard and we&apos;ll work out the rest.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          One boundary to be clear on: we don&apos;t fill customer-owned cylinders, and we
          don&apos;t supply tanks for independent diving. Independent diving isn&apos;t
          permitted in the Marine Park, so there&apos;s no unguided-dive setup for us to equip.
          For anything else unusual, please ask before you arrive rather than assuming.
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
          The prevailing winds are commonly from the northeast, which often leaves Ladder Bay
          relatively calm. A north swell changes that quickly and can also wrap around toward
          Tent Bay. Other anchorage options around Fort Bay may work in calm conditions or
          particular wind directions. Where you moor or anchor stays a Harbor Master and Marine
          Park question, but{" "}
          <Link href="/contact?interest=visiting-yacht" className="font-medium text-primary hover:underline underline-offset-4">
            ask us
          </Link>{" "}
          and we&apos;ll tell you what current local conditions look like.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Build a weather buffer into your stay if diving is a priority, and check marine
          forecasts before and during your passage. Yacht itineraries already have enough moving
          parts. If weather changes your plans, contact us. We try to be flexible with
          rescheduling whenever we can, and we&apos;d rather help reduce the stress than add to
          it. Our{" "}
          <Link href="/terms" className="font-medium text-primary hover:underline underline-offset-4">
            booking terms
          </Link>{" "}
          cover the details.
        </p>
      </section>

      {/* Contact Before Arrival */}
      <section id={visitingYachtsAnchors.contact} className="mt-14 scroll-mt-40">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Tell Us Before You Arrive</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Yacht visits work a little differently from hotel stays, so it helps to hear from you
          before you arrive. Tell us your dates, how many divers, certifications, and what
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
        <p className="mt-4 text-sm text-muted-foreground">
          For full vessel-agency assistance, including clearance logistics and broader shore
          arrangements, we recommend{" "}
          <TrackedContactLink
            href="https://www.sabaferry.com/"
            eventName="ferry_link_click"
            buttonText="Saba C-Transport — visiting yachts"
            external
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            Saba C-Transport
          </TrackedContactLink>{" "}
          (+599 416 2299). For anything around the diving itself, like taxis, restaurant and
          hiking suggestions, or coordination where practical, just ask us.
        </p>
      </section>

      {/* CTA */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to dive Saba?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          We dive with crews off everything from cruising sailboats to superyachts. Book ahead
          and come see us at Fort Bay.
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
