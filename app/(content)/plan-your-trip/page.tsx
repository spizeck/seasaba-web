import { createMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Plan Your Trip to Saba",
  description:
    "Everything you need to plan a dive trip to Saba — how to get there, where to stay, when to visit, and what to expect from Sea Saba.",
  path: "/plan-your-trip",
});

export default function PlanYourTripPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Plan Your Trip to Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Saba is a small, remote volcanic island in the Dutch Caribbean. Getting
        here takes a little planning — but divers who make the trip consistently
        describe it as one of their most rewarding diving experiences.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        This section is designed to help you plan your Saba dive trip from start
        to finish. More detailed guides on each topic are coming soon.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Getting to Saba
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Saba is accessible by a short flight from St. Maarten (SXM) on Winair,
        or by high-speed ferry from St. Maarten. The flight takes approximately
        13 minutes. Most visitors fly into St. Maarten first and connect from there.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        When to Visit
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Saba diving is good year-round. Water temperatures typically range from
        76–84°F (24–29°C). Visibility is generally excellent. The peak diving
        season is December through April, when conditions are particularly calm
        and clear. Nurse sharks and large pelagics can appear throughout the year.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Where to Stay
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Saba has a small selection of hotels, guesthouses, and cottage rentals,
        mostly in Windwardside and The Bottom. Sea Saba is happy to offer
        recommendations. The island has no large resorts — accommodation is
        intimate and characterful by nature.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        What to Expect
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Sea Saba operates boat dives in small groups from Fort Bay, Saba&apos;s
        harbour. Dive boats are large and comfortable. Most dive days include
        two guided dives. We provide tanks and weights; bring your own BCD and
        regulator, or rent on request.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Booking with Sea Saba
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        All bookings are handled through Checkfront, our online reservation
        system. We recommend booking in advance, especially during peak season.
        Contact us directly if you have questions about your trip or need help
        planning your schedule.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/book"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Book Diving →
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Contact Us →
        </Link>
      </div>
    </>
  );
}
