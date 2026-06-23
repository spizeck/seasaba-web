import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { Button } from "@/components/ui/button";
import { Plane, Ship, Check, Droplets, Eye, Sun, Thermometer, Home, HelpCircle, Fish, Camera, Calendar, AlertTriangle, Bus, Ban, DollarSign, MessageCircle, Plug, Wifi, Timer } from "lucide-react";

export const metadata = createMetadata({
  title: "Plan Your Trip to Saba",
  description:
    "How to get to Saba, where to stay, when to visit, and what to expect. Everything you need to plan your diving trip to the Caribbean's best-kept secret.",
  path: "/plan-your-trip",
});

const GOOD_TO_KNOW = [
  {
    icon: Bus,
    title: "Complimentary Taxi Shuttle",
    description: "Complimentary pickup and drop-off between your accommodation and the dive center is included for divers.",
  },
  {
    icon: Ban,
    title: "No Cruise Ships",
    description: "Quiet island atmosphere, uncrowded waters, and no mass tourism.",
  },
  {
    icon: DollarSign,
    title: "US Dollars Accepted",
    description: "US dollars are the official currency, and major credit cards are widely accepted.",
  },
  {
    icon: MessageCircle,
    title: "English Spoken Everywhere",
    description: "English is the primary language, making communication easy for international visitors.",
  },
  {
    icon: Plug,
    title: "120V US Power Outlets",
    description: "Standard US voltage and plugUS-style outlets are used throughout the island.",
  },
  {
    icon: Droplets,
    title: "Safe Drinking Water",
    description: "Clean, safe drinking water is readily available. Saba Splash, the island's local bottling plant, provides filtered water across the island.",
  },
  {
    icon: Wifi,
    title: "Reliable Internet",
    description: "Fiber Internet and Starlink are widely available.",
  },
  {
    icon: Timer,
    title: "Short Boat Rides",
    description: "Most dive sites are 5–15 minutes from the Fort Bay Harbor.",
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
    answer: "Yes. Hiking, restaurants, birdwatching, art workshops, glass melting and spectacular scenery make Saba enjoyable for everyone.",
  },
] as const;

export default function PlanYourTripPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/juancho-airport-approach-saba.webp"
        alt="Aerial view of Saba showing the dramatic approach to Juancho Airport"
        title="Plan Your Trip to Saba"
        subtitle="Everything you need to know before you arrive"
      />

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
                "Christmas winds bring breezier conditions and occasionally rougher seas.",
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
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">May &ndash; June</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Warm Water &amp; Fewer Crowds</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Warm water and reliable diving.",
                "Smaller crowds and relaxed atmosphere.",
                "Excellent time for underwater photography.",
                "Great for longer dive vacations.",
                "Generally lighter winds and comfortable sea conditions.",
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
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">July &ndash; November</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Calm Seas &amp; Island Festivals</h3>
            </div>
            <ul className="space-y-2">
              {[
                "Late summer and fall often bring calm seas and excellent diving conditions when no tropical systems are nearby.",
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
            <p className="mt-1 text-xs text-muted-foreground">77&ndash;86&deg;F (25&ndash;30&deg;C)</p>
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

        <FeatureImage
          src="/images/optimized/windwardside-village-saba.webp"
          alt="Windwardside village on Saba showing traditional cottages and lush greenery"
          imageRight
          centerText
        >
          <div>
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
          </div>
        </FeatureImage>

        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          Need help deciding? Our team is happy to recommend accommodations based on your budget, preferred atmosphere, and travel style.
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

