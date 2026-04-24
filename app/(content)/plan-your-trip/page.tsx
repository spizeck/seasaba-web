import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Ship, Home, Info } from "lucide-react";

export const metadata = createMetadata({
  title: "Plan Your Dive Trip to Saba",
  description:
    "How to get to Saba, where to stay, when to visit, and what to expect. Everything you need to plan your diving trip to the Caribbean's best-kept secret.",
  path: "/plan-your-trip",
});

const TRAVEL_OPTIONS = [
  {
    icon: Plane,
    title: "Winair Flight",
    description: "The most common route. Short 12-minute flights from St. Maarten (SXM) operate multiple times daily. Spectacular views of Saba's approach.",
    note: "Book in advance during peak season",
  },
  {
    icon: Ship,
    title: "High-Speed Ferry",
    description: "The Edge ferry operates between St. Maarten and Saba. Approximately 90 minutes. A more leisurely option with different scheduling.",
    note: "Weather dependent",
  },
] as const;

const SEASON_INFO = [
  {
    title: "Peak Season",
    period: "December – April",
    description: "Calmest seas, best visibility, most reliable conditions. Book accommodations and diving well in advance.",
  },
  {
    title: "Shoulder Season",
    period: "May – July",
    description: "Excellent diving with fewer visitors. Warm water, good visibility. A sweet spot for many divers.",
  },
  {
    title: "Low Season",
    period: "August – November",
    description: "Warmer water, occasional afternoon showers. Good diving with more flexibility in scheduling.",
  },
] as const;

export default function PlanYourTripPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Plan Your Trip to Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Saba is a five-square-mile volcanic island in the Dutch Caribbean — no beaches, 
        no cruise ships, just world-class diving. Getting here requires a bit more 
        planning than typical Caribbean destinations, but divers consistently describe 
        it as one of their most rewarding underwater experiences.
      </p>

      {/* Getting Here */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Getting to Saba</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          All routes go through St. Maarten (SXM). Most international visitors fly into 
          Princess Juliana Airport and connect from there.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {TRAVEL_OPTIONS.map((option) => (
            <div key={option.title} className="rounded-lg border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <option.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <Info className="mr-1 inline h-3 w-3" />
                {option.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* When to Visit */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">When to Visit</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Saba diving is rewarding year-round. Water temperatures range 76–84°F (24–29°C) 
          with visibility often exceeding 30m (100ft).
        </p>

        <div className="mt-6 space-y-4">
          {SEASON_INFO.map((season) => (
            <div
              key={season.title}
              className="flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/20 p-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <div className="sm:w-48">
                <h3 className="font-semibold text-foreground">{season.title}</h3>
                <p className="text-sm text-primary">{season.period}</p>
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{season.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Where to Stay */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Where to Stay</h2>
        <div className="mt-4 rounded-lg border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Accommodation in Saba</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Saba has no large resorts. Instead, find intimate guesthouses, boutique hotels, 
            and cottage rentals primarily in Windwardside and The Bottom. Most accommodations 
            offer stunning views and easy access to the island&apos;s small harbor at Fort Bay.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba is happy to recommend accommodation options that work well for divers. 
            Contact us for suggestions based on your preferences and budget.
          </p>
        </div>
      </section>

      {/* What to Expect */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">What to Expect</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-medium text-foreground">A Typical Dive Day</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Morning pickup from your accommodation</li>
              <li>• Check-in at Fort Bay harbor</li>
              <li>• Site briefing with your guide</li>
              <li>• Two guided boat dives with surface interval</li>
              <li>• Return by early afternoon</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground">What to Bring</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• Certification card and logbook</li>
              <li>• Personal dive gear (BCD, regulator, mask, fins)</li>
              <li>• Reef-safe sunscreen and hat</li>
              <li>• Light layer for boat rides</li>
              <li>• Underwater camera (optional)</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              Rental equipment available on request.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Ready to Plan Your Dive Trip?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Book your diving with Sea Saba and experience one of the Caribbean&apos;s 
          most pristine and rewarding underwater environments.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/book">Book Diving</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/contact">Ask a Question</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

