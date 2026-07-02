import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { Button } from "@/components/ui/button";
import { Plane, PlaneTakeoff, Ship, Helicopter, Check, Droplets, Eye, Sun, Thermometer, Home, HelpCircle, Fish, Calendar, AlertTriangle, Bus, Ban, DollarSign, MessageCircle, Plug, Wifi, Timer, Utensils, Compass, Clock } from "lucide-react";
import { HotelPills } from "@/components/hotel-pills";
import { InsuranceCTAs } from "@/components/insurance-ctas";
import { planYourTripAnchors } from "@/lib/anchors";

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
    description: "Standard US voltage and US-style outlets are used throughout the island.",
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
    answer: "Most visitors travel through St. Maarten and connect to Saba by Winair flight or Makana Ferry. Sea Saba is located at Fort Bay Harbor, where most dive trips depart.",
  },
  {
    question: "How many days should I stay?",
    answer: "Most divers are happiest with 5–7 days on Saba. This gives you time for multiple dive days, a weather buffer, and a chance to enjoy hiking, restaurants, and island exploring.",
  },
  {
    question: "Is Nitrox included?",
    answer: "Complimentary 32% Nitrox is included for certified Nitrox divers. Please bring proof of Nitrox certification.",
  },
  {
    question: "Do I need a rental car?",
    answer: "Not usually. Sea Saba provides transportation for scheduled dive trips, and taxis are available for restaurants, hikes, and island exploring. Some guests still prefer a rental car for extra flexibility.",
  },
  {
    question: "Is Saba crowded?",
    answer: "No. Saba has no cruise ships, no mega resorts, and very little mass tourism. The island is quiet, natural, and best suited for travelers looking for something different.",
  },
  {
    question: "Is Saba good for non-divers?",
    answer: "Yes. Hiking, restaurants, birdwatching, art workshops, glass melting, scenic views, and a relaxed island atmosphere make Saba enjoyable for non-divers too.",
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
      <section id={planYourTripAnchors.gettingHere} className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">Getting to Saba</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {/* Winair */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Plane className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Winair</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Most visitors arrive via St. Maarten (SXM) and connect to Saba aboard Winair&apos;s iconic Twin Otter. The short flight offers one of the world&apos;s most spectacular airport approaches.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">⭐</span>
                Most Popular Option
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Approximately 12-minute flight
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  19-seat DHC-6 Twin Otter
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Multiple departures daily
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Lands at the world&apos;s shortest commercial runway
                </li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white">
              <a href="https://www.winair.sx/" target="_blank" rel="noopener noreferrer" aria-label="Check Winair Flight Schedule, opens in a new tab">
                Check Flight Schedule ↗
              </a>
            </Button>
          </div>

          {/* Makana Ferry */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Ship className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Makana Ferry</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The Makana Ferry provides a comfortable and scenic connection between St. Maarten and Saba, offering beautiful Caribbean views along the way.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">🌊</span>
                Most Scenic Journey
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Approximately 90-minute crossing
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Air-conditioned passenger cabin
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Open sun deck
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Onboard refreshments
                </li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white">
              <a href="https://makanaferryservice.com/" target="_blank" rel="noopener noreferrer" aria-label="View Makana Ferry Schedule, opens in a new tab">
                View Ferry Schedule ↗
              </a>
            </Button>
          </div>

          {/* West Indies Helicopters */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Helicopter className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">West Indies Helicopters</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                West Indies Helicopters offers luxury helicopter transfers from St. Maarten and St. Barths, providing the fastest and most flexible way to reach Saba.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">⚡</span>
                Fastest &amp; Most Flexible
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Airbus H125 / AS350 helicopters
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Up to 5 passengers
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Approximately 20–25 minute flight
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Ideal for private transfers
                </li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white">
              <a href="https://westindieshelicopters.com/" target="_blank" rel="noopener noreferrer" aria-label="Request Helicopter Charter, opens in a new tab">
                Request Helicopter Charter ↗
              </a>
            </Button>
          </div>

          {/* SXM Airways */}
          <div className="flex flex-col justify-between rounded-lg border border-border/60 bg-card p-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <PlaneTakeoff className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">SXM Airways</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                SXM Airways operates scheduled flights between St. Maarten and Saba aboard the iconic Britten-Norman Islander, offering a classic Caribbean island-hopper experience with reliable regional service.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span aria-hidden="true">👥</span>
                Best for Small Groups &amp; Charters
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  9-seat Britten-Norman Islander
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Scheduled flights between St. Maarten and Saba
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Classic island-hopper experience
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Reliable regional carrier
                </li>
              </ul>
            </div>
            <Button asChild variant="outline" className="mt-6 w-full border-primary/60 text-primary hover:border-primary hover:bg-primary hover:text-white">
              <a href="https://fly-sxmairways.com/" target="_blank" rel="noopener noreferrer" aria-label="Book SXM Airways, opens in a new tab">
                Book SXM Airways ↗
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* When to Visit */}
      <section id="when-to-visit" className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">When to Visit</h2>

        {/* Season cards */}
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {/* Dec–Apr */}
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">December &ndash; April</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Clear Water &amp; Humpback Whales</h3>
            </div>
            <ul className="w-full space-y-2">
              {[
                "Clearest water and excellent visibility.",
                "Humpback whales frequently seen January through April.",
                "Christmas winds bring breezier conditions and occasionally rougher seas.",
                "Saba Day is the first Friday of December.",
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
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">May &ndash; June</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Warm Water &amp; Fewer Crowds</h3>
            </div>
            <ul className="w-full space-y-2">
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
          <div className="not-prose rounded-xl border border-border/50 bg-card p-5 flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">July &ndash; November</p>
              <h3 className="mt-1 text-base font-semibold text-foreground">Calm Seas &amp; Island Festivals</h3>
            </div>
            <ul className="w-full space-y-2">
              {[
                "Late summer and fall often bring calm seas and excellent diving conditions when no tropical systems are nearby.",
                "Best weather without tropical system risks.",
                "July features Carnival.",
                "October features Sea & Learn.",
                "November features Rum & Lobster Fest.",
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
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Travel Insurance Recommended</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Because Saba is a small island served by flights and ferries, weather
                occasionally affects travel plans. We strongly recommend travel insurance
                for all visitors, regardless of season. Coverage for trip delays, weather
                disruptions, and medical emergencies provides peace of mind. Dive accident
                insurance and emergency medical evacuation coverage are also strongly recommended.
              </p>
              <div className="mt-4">
                <InsuranceCTAs />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Where to Stay */}
      <section id={planYourTripAnchors.whereToStay} className="mt-12 scroll-mt-24">
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
              Saba offers boutique hotels, charming cottages, and private villas instead of large resorts. Whether you&apos;re looking for a full-service hotel or a quiet island retreat, every accommodation is just a short drive from Fort Bay Harbor.
            </p>
            <HotelPills />
          </div>
        </FeatureImage>

        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          Select a hotel above to view photos, amenities, and a quick overview. Need personalized advice? Our team is happy to recommend the perfect place to stay based on your budget, travel style, and diving plans.
        </div>
      </section>

      {/* Good to Know */}
      <section id="good-to-know" className="mt-12 scroll-mt-24">
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
      <section id="what-to-bring" className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">What to Bring</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Required</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Certification card or digital certification
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Dive computer
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Logbook or digital dive history
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Swimwear
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Towel
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Reusable water bottle
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-6">
            <h3 className="font-semibold text-foreground">Optional</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Personal dive gear
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
                Hat or light jacket for the boat ride
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Dry bag
              </li>
              <li className="flex items-start gap-2">
                <Sun className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Motion sickness medication if needed
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Rental equipment is available, including BCD, regulator, wetsuit, mask, fins, and dive computer.</p>
          </div>
        </div>
      </section>

      {/* Restaurants */}
      <section id={planYourTripAnchors.restaurants} className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Utensils className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Restaurants &amp; Cafés</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba has a small but genuinely good dining scene. Most restaurants are intimate, owner-operated, and reflect the character of the island. Because the island is small and supplies arrive by boat, menus change with availability and not every restaurant is open every night.
        </p>

        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <h3 className="text-sm font-semibold text-foreground">Practical Tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Reservations are strongly recommended, especially for dinner. Many restaurants are small and fill quickly.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Opening days vary and can change seasonally. Call ahead or ask your accommodation to confirm.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Most restaurants are in Windwardside, within walking distance of the main hotels.</li>
            <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Saba has a craft brewery: Deep Dive Brewing Co. Cold beers are available at most restaurants and the dive center after your dives.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/colibri-cafe-saba.webp"
            alt="Colibri Café on Saba serving fresh food and drinks with island views"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Local Dining</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s dining scene is as welcoming as the island itself. From fresh Lobster overlooking the Caribbean to casual cafés and cozy local favorites, you&apos;ll find a surprising variety of excellent restaurants despite the island&apos;s small size. Most are independently owned, reservations are recommended during busy periods, and nearly all are just a short drive from your accommodation or the harbor.
              </p>
            </div>
          </FeatureImage>
          <FeatureImage
            src="/images/optimized/island-paradise-cafe-saba.webp"
            alt="Island Paradise Cafe on Saba with Caribbean views"
            objectPosition="center 30%"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Our Recommended Partners</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Looking for our favorite places to eat, stay, and explore?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We&apos;ve curated a collection of restaurants, accommodations, transportation providers, and local experiences that we confidently recommend to our guests. Browse our favorite local businesses to help you plan the perfect stay on Saba.
              </p>
              <Button asChild className="mt-4">
                <Link href="/partners">Explore Recommended Partners &rarr;</Link>
              </Button>
            </div>
          </FeatureImage>
        </div>
      </section>

      {/* Things to Do on Saba */}
      <section id={planYourTripAnchors.experiences} className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Things to Do on Saba</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba offers far more than world-class diving. Spend a day hiking through cloud forests, exploring local art galleries, snorkeling crystal-clear waters, enjoying a sunset cruise, or discovering one of the Caribbean&apos;s most unique island communities.
        </p>

        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/saba-sunset-cruise.webp"
            alt="Guests watching the sunset from the deck of a Sea Saba boat off Saba's coast"
            centerText
            imageRight
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sunset Cruise</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sea Saba runs private sunset cruises along the island&apos;s rugged coastline. Watch the sun drop behind Saba, enjoy drinks on deck, and see the island from the water.
              </p>
              <Button asChild className="mt-4">
                <Link href="/contact?interest=sunset-cruise">Book a Sunset Cruise &rarr;</Link>
              </Button>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-hiking-signs.webp"
            alt="Trail signs marking hiking routes across Saba's rainforest and cloud forest"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Hiking on Saba</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s award-winning trail network winds through dry coastal hillsides, lush rainforest, and misty cloud forests near the summit of Mount Scenery. Free trail maps are available.
              </p>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-snorkeling.webp"
            alt="Sea turtle swimming at the surface while snorkeling on Saba"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Snorkeling</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s shallow reefs are excellent for snorkeling. The afternoon snorkel trip runs alongside the dive boats, so snorkelers stay at the surface while divers go deeper. No certification required.
              </p>
            </div>
          </FeatureImage>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Arts &amp; Crafts</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Saba has a vibrant community of local artisans producing handmade crafts, jewelry, glass art, pottery, and the famous Saba Lace. Many pieces are inspired by the island&apos;s marine life, volcanic landscape, and Caribbean culture.
            </p>
          </div>

          <FeatureImage
            src="/images/optimized/saba-lace.webp"
            alt="Traditional Saba Lace, a delicate handcrafted island tradition"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Saba Lace</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba Lace is one of the island&apos;s most recognizable traditions. This delicate needlework has been made by hand for generations and is still sold in local shops today. Each piece carries the patience and skill of the artisan who made it.
              </p>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-beads-jewelry.webp"
            alt="Locally crafted jewelry inspired by Saba"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Jewelry Making</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Local jewelers work with volcanic stone, sea glass, and silver to create pieces inspired by Saba&apos;s colors and textures. Many designs are made entirely by hand and can only be found here.
              </p>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-glass-art.webp"
            alt="Glass artist shaping molten glass into handmade art"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Glass Art</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Skilled artisans transform molten glass into unique handmade pieces right before your eyes. Visitors can watch the process and take home one-of-a-kind ornaments, jewelry, and art inspired by the island.
              </p>
            </div>
          </FeatureImage>
        </div>
      </section>

      {/* Island History */}
      <section id={planYourTripAnchors.history} className="mt-12 scroll-mt-24">
        <h2 className="text-xl font-semibold text-foreground">The Island of Saba</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba is a five-square-mile volcanic island and Special Municipality of the Netherlands, rising dramatically from the Caribbean Sea to the 887-meter (2,910-foot) summit of Mount Scenery. Home to around 2,000 residents and almost no flat land, the island&apos;s dramatic landscape has shaped its history, culture, and way of life.
        </p>
        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/saba-ladder-bay.webp"
            alt="The historic stone ladder carved into Saba's cliffs at Ladder Bay"
            imageRight
            centerText
          >
            <div className="max-w-prose">
              <h3 className="text-lg font-semibold text-foreground">The Ladder</h3>
              <div className="space-y-4">
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Long before Saba had roads or a harbor, everyone and everything reached the island by climbing The Ladder: nearly 800 stone steps carved into the cliffs. From food to building materials, everything was carried by hand from the shoreline to the villages above.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Today, The Ladder remains one of Saba&apos;s most important historic landmarks. The restored trail is a rewarding hike that combines history with spectacular coastal views.
                </p>
              </div>
            </div>
          </FeatureImage>
          <FeatureImage
            src="/images/optimized/saba-the-road.webp"
            alt="The winding road through Saba's lush green hills and traditional cottages"
            centerText
          >
            <div className="max-w-prose">
              <h3 className="text-lg font-semibold text-foreground">The Road That Couldn&apos;t Be Built</h3>
              <div className="space-y-4">
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  For generations, experts insisted Saba&apos;s steep volcanic slopes made a road impossible, earning it the nickname &quot;The Road That Couldn&apos;t Be Built.&quot; Saban engineer Josephus Lambert Hassell taught himself road construction and led the effort to connect the island&apos;s villages.
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Completed in stages during the mid-20th century, the road transformed life on Saba by linking Windwardside, The Bottom, Hell&apos;s Gate, St. Johns, and Fort Bay. Today, it is one of the Caribbean&apos;s most scenic drives and a tribute to Saban perseverance.
                </p>
              </div>
            </div>
          </FeatureImage>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">A Unique Caribbean History</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Saba has been continuously inhabited since the 1640s, when Dutch settlers established the island&apos;s distinctive architecture of white-walled cottages with red roofs, a style still found throughout Windwardside and The Bottom today. The island changed hands between European powers multiple times before settling permanently under Dutch administration.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Because the island has no natural harbor, all cargo and visitors historically arrived by small boat through Fort Bay, making Saba one of the most isolated communities in the Caribbean for centuries.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <h3 className="text-sm font-semibold text-foreground">Saba Today</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Special Municipality of the Netherlands since 2010</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />No cruise ships, no casinos, no large resorts</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Home to the Saba University School of Medicine</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Known for artisan crafts, including Saba lace and glass-melting</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />The Bottom is the capital; Windwardside is the main village for tourism</li>
              <li className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Protected by the Saba Marine Park, established 1987</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id={planYourTripAnchors.faq} className="mt-12 scroll-mt-24">
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

