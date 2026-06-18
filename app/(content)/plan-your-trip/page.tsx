import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plane, Ship, Check, Droplets, Eye, Sun, Thermometer, Home, HelpCircle } from "lucide-react";

export const metadata = createMetadata({
  title: "Plan Your Trip to Saba",
  description:
    "How to get to Saba, where to stay, when to visit, and what to expect. Everything you need to plan your diving trip to the Caribbean's best-kept secret.",
  path: "/plan-your-trip",
});

const GOOD_TO_KNOW = [
  {
    icon: Check,
    title: "Complimentary Taxi Shuttle",
    description: "Transportation anywhere on Saba is included for divers.",
  },
  {
    icon: Ship,
    title: "No Cruise Ships",
    description: "Quiet island atmosphere and uncrowded dive sites.",
  },
  {
    icon: Check,
    title: "US Dollars Accepted",
    description: "No currency exchange needed.",
  },
  {
    icon: Check,
    title: "English Spoken Everywhere",
    description: "Easy communication throughout the island.",
  },
  {
    icon: Check,
    title: "110V US Power Outlets",
    description: "Standard US voltage and plugs.",
  },
  {
    icon: Droplets,
    title: "Safe Drinking Water",
    description: "Rainwater cistern water is used throughout the island.",
  },
  {
    icon: Check,
    title: "Reliable Internet",
    description: "Fiber and Starlink are widely available.",
  },
] as const;

const FAQS = [
  {
    question: "How do I get to Saba?",
    answer: "Most visitors connect through St. Maarten by Winair or Makana Ferry.",
  },
  {
    question: "How many days should I stay?",
    answer: "Most guests spend 5–7 days.",
  },
  {
    question: "Is Nitrox included?",
    answer: "Complimentary 32% Nitrox is included for certified divers.",
  },
  {
    question: "Do I need a rental car?",
    answer: "No. Sea Saba provides transportation and taxis are readily available.",
  },
  {
    question: "Is Saba crowded?",
    answer: "No. Saba has no cruise ships and very little mass tourism.",
  },
  {
    question: "Is Saba good for non-divers?",
    answer: "Yes. Hiking, restaurants, birdwatching, and spectacular scenery make Saba enjoyable for everyone.",
  },
] as const;

export default function PlanYourTripPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative -mx-4 -mt-6 mb-8 overflow-hidden sm:-mx-6 lg:-mx-8">
        <div className="relative h-64 sm:h-80 lg:h-96">
          <Image
            src="/images/optimized/juancho-airport-approach-saba.webp"
            alt="Aerial view of Saba showing the dramatic approach to Juancho Airport"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
                Plan Your Trip to Saba
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <p className="text-base leading-relaxed text-muted-foreground">
        Saba is a five-square-mile volcanic island in the Caribbean Netherlands. With no cruise ships and no large resorts, Saba offers a quiet and authentic Caribbean experience that divers consistently describe as one of their favorite destinations.
      </p>

      {/* Getting to Saba */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Getting to Saba</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Winair Flight */}
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Plane className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Winair Flight</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Most visitors arrive via St. Maarten (SXM) and connect to Saba on Winair. The short 12-minute flight offers one of the world&apos;s most spectacular airport approaches and multiple departures daily.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                12-minute flight
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Most popular option
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Multiple departures daily
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Incredible views
              </li>
            </ul>
          </div>

          {/* Makana Ferry */}
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Makana Ferry</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The Makana Ferry operates between St. Maarten and Saba in approximately 90 minutes. It offers beautiful views and a relaxing alternative to flying.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                About 90 minutes
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Scenic route
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Comfortable catamaran
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                Weather dependent
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* When to Visit */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">When to Visit</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="font-semibold text-foreground">December–April</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Best visibility and calmest seas. Popular season, so book early.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="font-semibold text-foreground">May–July</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Excellent conditions with fewer visitors and warm water.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="font-semibold text-foreground">August–November</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Warmest water and flexible schedules with occasional afternoon showers.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-card p-4 text-center">
            <Thermometer className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">Water temperature</p>
            <p className="mt-1 text-sm font-semibold text-foreground">78–84°F (26–29°C)</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-card p-4 text-center">
            <Eye className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">Visibility</p>
            <p className="mt-1 text-sm font-semibold text-foreground">80–100+ ft</p>
          </div>
        </div>
      </section>

      {/* Where to Stay */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Where to Stay</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Accommodation</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Saba has no large resorts. Most visitors stay in boutique hotels, cottages, and guesthouses in Windwardside or The Bottom.
            </p>
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">Recommended properties:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>• Juliana&apos;s Hotel</li>
                <li>• El Momo Cottages</li>
                <li>• Queen&apos;s Gardens Resort</li>
                <li>• Saba Arawak Hotel</li>
                <li>• House on the Path</li>
                <li>• Scout&apos;s Place Hotel</li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Need help deciding? Sea Saba is happy to recommend accommodations based on your budget and travel style.
            </p>
          </div>

          <div className="relative h-64 rounded-lg overflow-hidden lg:h-full lg:min-h-[280px]">
            <Image
              src="/images/optimized/windwardside-village-saba.webp"
              alt="Windwardside village on Saba showing traditional cottages and lush greenery"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Good to Know */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Good to Know</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOOD_TO_KNOW.map((item) => (
            <div key={item.title} className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <item.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typical Dive Day */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">A Typical Dive Day</h2>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-sm font-semibold text-primary">8:30 AM</span>
              </div>
              <div>
                <p className="text-sm text-foreground">Taxi pickup from your accommodation.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-sm font-semibold text-primary">9:00 AM</span>
              </div>
              <div>
                <p className="text-sm text-foreground">Advanced departures.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-sm font-semibold text-primary">10:30 AM</span>
              </div>
              <div>
                <p className="text-sm text-foreground">Classic 2-tank departures.</p>
                <p className="mt-1 text-xs text-muted-foreground">Two guided dives with surface interval and drinks.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-16 shrink-0 text-right">
                <span className="text-sm font-semibold text-primary">1:00 PM</span>
              </div>
              <div>
                <p className="text-sm text-foreground">Return to harbor.</p>
                <p className="mt-1 text-xs text-muted-foreground">Afternoon dives and snorkeling depart at 1:00 PM.</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-4">
              <p className="text-sm text-muted-foreground">
                Equipment is rinsed and delivered back to your accommodation after your final dive day.
              </p>
            </div>
          </div>

          <div className="relative h-64 rounded-lg overflow-hidden lg:h-full lg:min-h-[320px]">
            <Image
              src="/images/optimized/guests-on-bow-saba.webp"
              alt="Divers relaxing on the bow of the Sea Saba dive boat"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">What to Bring</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Required</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Certification card
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Dive computer
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Logbook (digital acceptable)
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Optional</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Personal gear
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Underwater camera
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Reef-safe sunscreen
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Hat and light jacket
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Rental equipment is available.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>

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

      {/* Final CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Ready for Saba?</h2>
        <p className="mt-3 text-base text-muted-foreground">
          We&apos;ll help with accommodations, transportation, and diving so you can focus on enjoying one of the Caribbean&apos;s most pristine marine parks.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/book">Book Diving</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

