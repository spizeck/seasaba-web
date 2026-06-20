import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plane, Ship, Anchor, Check, Droplets, Eye, Sun, Thermometer, Home, HelpCircle, Fish, Camera, Calendar, AlertTriangle, Coffee, Package } from "lucide-react";

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

        {/* Season cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {/* Dec–Apr */}
          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">December &ndash; April</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Clear Water &amp; Humpback Whales</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Clearest water and excellent visibility.",
                "Humpback whales frequently seen January through April.",
                "Trade winds bring breezier conditions.",
                "Water temperatures are coolest in February.",
                "Christmas and spring break periods book early.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* May–Jul */}
          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">May &ndash; July</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Warm Water &amp; Fewer Crowds</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Warm water and reliable diving.",
                "Smaller crowds and relaxed atmosphere.",
                "Excellent time for underwater photography.",
                "Great for longer dive vacations.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Aug–Nov */}
          <div className="rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">August &ndash; November</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Calm Seas &amp; Island Festivals</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Hurricane season often brings the calmest seas when no storms are present.",
                "Warmest water temperatures.",
                "October features Sea & Learn.",
                "November features Rum & Lobster Fest.",
                "Flexible schedules and fewer visitors.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Thermometer className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Water Temperature</p>
            <p className="mt-1 text-xs text-muted-foreground">78&ndash;84&deg;F (26&ndash;29&deg;C)</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Warm year-round, coolest in February.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Eye className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Visibility</p>
            <p className="mt-1 text-xs text-muted-foreground">80&ndash;100+ ft</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Often exceeding 100 feet in winter.</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Fish className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Humpback Whale Season</p>
            <p className="mt-1 text-xs text-muted-foreground">January &ndash; April</p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <Calendar className="mx-auto h-5 w-5 text-primary" />
            <p className="mt-2 text-xs font-semibold text-foreground">Festivals</p>
            <p className="mt-1 text-xs text-muted-foreground">July, October, November &amp; December</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Carnival, Sea &amp; Learn, Rum &amp; Lobster Fest, and Saba Day.</p>
          </div>
        </div>

        {/* Travel insurance callout */}
        <div className="mt-6 rounded-xl border border-amber-200/60 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-foreground">Travel Insurance Recommended</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Because Saba is a small island served by flights and ferries, weather
                occasionally affects travel plans. We strongly recommend travel insurance
                for all visitors, regardless of season. Coverage for trip delays, weather
                disruptions, and medical emergencies provides peace of mind.
              </p>
            </div>
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
              Saba has no large resorts. Instead, visitors enjoy boutique hotels and intimate
              accommodations in Windwardside and The Bottom, all within a short drive of Fort Bay Harbor.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Juliana's Hotel", "Saba Arawak Hotel", "El Momo Cottages", "Cottage Club", "Scenery Hotel"].map((name) => (
                <span key={name} className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs text-foreground">
                  {name}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Need help deciding? Our team is happy to recommend accommodations based on your budget, preferred atmosphere, and travel style.
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

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            {/* Timeline */}
            <div className="space-y-0">
              {[
                { time: "7:30 AM", icon: Coffee, label: "Breakfast at most hotels and a relaxed start to the day." },
                { time: "8:30 AM", icon: Ship, label: "Taxi pickup for Advanced 2-Tank divers." },
                { time: "9:00 AM", icon: Anchor, label: "Advanced boat departs." },
                { time: "10:00 AM", icon: Ship, label: "Taxi pickup for Classic 2-Tank divers." },
                { time: "10:30 AM", icon: Anchor, label: "Classic 2-Tank departure." },
                { time: "12:30 PM", icon: Ship, label: "Taxi pickup for Afternoon Divers and Snorkelers." },
                { time: "1:00 PM", icon: Anchor, label: "Afternoon dive and snorkel departures." },
              ].map(({ time, icon: Icon, label }, i, arr) => (
                <div key={time} className="flex gap-4">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border/60 my-1" />}
                  </div>
                  {/* Content */}
                  <div className={i < arr.length - 1 ? "pb-5" : "pb-0"}>
                    <p className="text-xs font-semibold text-primary">{time}</p>
                    <p className="mt-0.5 text-sm text-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Approximate times note */}
            <p className="mt-4 text-xs text-muted-foreground/70 italic">
              Times are approximate and may vary slightly depending on accommodations and weather conditions.
            </p>

            {/* After your last dive day */}
            <div className="mt-5 rounded-xl border border-border/50 bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">After Your Last Dive Day</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Our team rinses your equipment and delivers it back to your accommodation,
                    allowing you to relax and enjoy the rest of your stay.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-sm lg:sticky lg:top-6">
            <Image
              src="/images/optimized/guests-on-bow-saba.webp"
              alt="Divers relaxing on the bow of the Sea Saba dive boat"
              fill
              className="object-cover object-center"
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

