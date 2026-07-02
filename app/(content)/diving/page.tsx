import { createMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Award, Ship, Droplets, ShieldCheck, Wind, HelpCircle } from "lucide-react";
import { InsuranceCTAs } from "@/components/insurance-ctas";
import { ExperienceSelector } from "@/components/experience-selector";

export const metadata = createMetadata({
  title: "Diving in Saba",
  description:
    "Professional boat diving in Saba's Marine Park. Small guided groups, comfortable boats, experienced local professionals. Open Water to technical.",
  path: "/diving",
});

const TRUST_SIGNALS = [
  { icon: Users, label: "Small Groups", sublabel: "Maximum 8 divers per guide" },
  { icon: Ship, label: "Complimentary Taxi Shuttle", sublabel: "Anywhere on Saba" },
  { icon: Droplets, label: "Free 32% Nitrox", sublabel: "For certified divers" },
  { icon: Award, label: "Since 1985", sublabel: "Saba's only continuously operating dive center" },
];

const DIVE_EXPERIENCES = [
  {
    title: "Classic 2-Tank Dive",
    subtitle: "THE CLASSIC SEA SABA EXPERIENCE",
    description:
      "Two relaxed dives in Saba's Marine Park. Perfect for most certified divers and our most popular option.",
    details: [
      "10:30 AM departure",
      "Return about 3:00 PM",
      "Two dives to ~70 ft / 21 m",
      "Free 32% Nitrox",
      "Scuba Diver minimum",
    ],
    cta: "Book Classic Diving",
    href: "/book?item=classic",
    itemId: "classic",
    featured: true,
  },
  {
    title: "Advanced 2-Tank Dive",
    subtitle: "FOR EXPERIENCED DIVERS",
    description:
      "Explore deeper pinnacles, walls, and seamounts with dramatic underwater terrain.",
    details: [
      "9:00 AM departure",
      "Return about 1:00 PM",
      "Dive 1 to ~110 ft / 33 m",
      "Dive 2 to ~70 ft / 21 m",
      "Free Nitrox (mandatory on Dive 1)",
      "AOW + 20 dives OR OW + 50 dives",
    ],
    cta: "Book Advanced Diving",
    href: "/book?item=advanced",
    itemId: "advanced",
    featured: false,
  },
  {
    title: "Afternoon 1-Tank Dive",
    subtitle: "A RELAXED AFTERNOON DIVE",
    description:
      "A single afternoon dive to one of Saba's signature sites. Great for adding another dive or enjoying a lighter day.",
    details: [
      "1:00 PM departure",
      "Return about 3:00 PM",
      "Up to ~70 ft / 21 m",
      "Scuba Diver minimum",
    ],
    cta: "Book Afternoon Dive",
    href: "/book?item=afternoon",
    itemId: "afternoon",
    featured: false,
  },
  {
    title: "Afternoon Snorkel Trip",
    subtitle: "SURFACE EXPLORATION",
    description:
      "Enjoy Saba's reefs, turtles, and marine life from the surface while divers explore below.",
    details: [
      "1:00 PM departure",
      "Return about 3:00 PM",
      "Equipment included",
      "Comfortable swimmers",
      "Unguided experience",
    ],
    cta: "Book Snorkeling",
    href: "/book?item=snorkel",
    itemId: "snorkel",
    featured: false,
  },
  {
    title: "Private Charter",
    subtitle: "EXCLUSIVE EXPERIENCES",
    description:
      "Private diving aboard our custom Caribbean-built catamarans with flexible schedules and personalized itineraries.",
    details: [
      "Half or full day",
      "Up to 8 guests",
      "Dedicated captain",
      "Flexible departure times",
    ],
    cta: "Book Private Charter",
    href: "/book?item=private",
    itemId: "private",
    featured: false,
  },
  {
    title: "SDI / TDI Courses",
    subtitle: "PROFESSIONAL INSTRUCTION",
    description:
      "From Discover Scuba to Divemaster, learn with experienced instructors in one of the Caribbean's most rewarding diving environments.",
    details: ["All certification levels", "Small classes", "SDI and TDI training", "Private instruction available"],
    cta: "View courses",
    href: "/courses",
    featured: false,
  },
] as const;

export default function DivingPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/diving-hero.webp"
        alt="Scuba divers exploring the reef in the Saba Marine Park"
        title="Diving with Sea Saba"
        subtitle="Professional boat diving in Saba's Marine Park since 1985"
        objectPosition="center bottom"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Sea Saba has been introducing divers to Saba since 1985. As the island&apos;s only 
        continuously operating dive center, we combine decades of local knowledge with 
        small groups, comfortable boats, and personalized service.
      </p>

      {/* Trust Signals */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_SIGNALS.map((signal) => (
          <div
            key={signal.label}
            className="flex flex-col rounded-lg border border-border/40 bg-muted/20 p-4"
          >
            <div className="flex items-center gap-2">
              <signal.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">{signal.label}</span>
            </div>
            <span className="mt-1 text-xs text-muted-foreground">{signal.sublabel}</span>
          </div>
        ))}
      </div>

      {/* Dive Experience Intro */}
      <section className="mt-12">
        <FeatureImage
          src="/images/optimized/guests-on-bow-saba.webp"
          alt="Guests sitting on the bow of a Sea Saba boat looking at Saba island."
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">The Sea Saba Experience</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Since 1985, generations of divers have explored Saba with Sea Saba. Our custom 38-foot
              catamarans are built for Caribbean conditions and designed around diver comfort, with
              spacious shaded decks, camera tables, freshwater rinse buckets, large ladders, and
              experienced local crews.
            </p>
          </div>
        </FeatureImage>

        {/* Feature checklist — full-width 2-col grid below the media row */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Complimentary taxi pickup anywhere on Saba</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Free 32% Nitrox for certified divers</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Saba&apos;s only continuously operating dive center since 1985</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Maximum 8 divers per guide</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Large stable catamarans with shade and marine heads</span></li>
          <li className="flex items-start gap-2"><span className="text-primary">✓</span><span>Equipment rinsed and delivered back to your accommodation</span></li>
        </ul>
      </section>

      {/* Dive Options Grid */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">Dive Options</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose the experience that fits your certification level and schedule.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {DIVE_EXPERIENCES.map((option) => (
            <div
              key={option.title}
              className={`relative flex flex-col rounded-lg border bg-card p-6 transition-colors hover:border-primary/30 ${
                option.featured
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border/60"
              }`}
            >
              {option.featured && (
                <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {option.subtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {option.details.map((detail) => (
                  <span
                    key={detail}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {detail}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <Button asChild variant={option.featured ? "default" : "outline"} className="w-full">
                  <Link href={option.href}>{option.cta}</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ExperienceSelector />

      {/* Dive More Save More */}
      <section className="mt-14">
        <FeatureImage
          src="/images/optimized/green-turtle-seagrass-divers.webp"
          alt="Divers observing a green sea turtle resting in seagrass at Saba's Marine Park."
          imageRight
          centerText
        >
          <div>
            <h2 className="text-xl font-semibold text-foreground">Dive More. Save More.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Stay longer. Experience more.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Most guests spend several days exploring Saba&apos;s world-famous pinnacles, walls, and reefs.
              Multi-day pricing rewards continuous diving schedules, and complimentary 32% Nitrox is
              included on qualifying dives.
            </p>
          </div>
        </FeatureImage>

        {/* Feature grid — full width below the image+text row */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Better Daily Rates</h4>
              <p className="text-xs text-muted-foreground">Multi-day packages lower your daily cost.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Free 32% Nitrox</h4>
              <p className="text-xs text-muted-foreground">Included on qualifying dives for certified divers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Flexible Schedule</h4>
              <p className="text-xs text-muted-foreground">One rest day is allowed without resetting package pricing.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Build Your Own Package</h4>
              <p className="text-xs text-muted-foreground">Add afternoon and night dives to customize your stay.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Rental Equipment Available</h4>
              <p className="text-xs text-muted-foreground">Full rental packages are available if needed.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">✓</span>
            <div>
              <h4 className="text-sm font-medium text-foreground">Full-Service Convenience</h4>
              <p className="text-xs text-muted-foreground">Equipment rinsed and delivered back to your accommodation.</p>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-center">
          <Button asChild variant="outline" size="sm">
            <Link href="/book">View Packages &amp; Pricing</Link>
          </Button>
        </div>
      </section>

      {/* A Day with Sea Saba */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold text-foreground">A Day with Sea Saba</h2>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">Before the Dive</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Complimentary transportation between your accommodation and the dive center</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Crew assistance with equipment setup, tank changes, and gear handling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>PRO valves compatible with both DIN and yoke regulators</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Detailed dive briefings covering conditions, marine life, and site highlights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Oxygen, first aid, spare equipment, and Save-a-Dive kits onboard</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">On the Boat</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Custom 38-foot power catamarans designed and built for Caribbean conditions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Shaded seating, spacious decks, bow lounging areas, and Fin &amp; Tonic&apos;s upper observation deck</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Camera tables, integrated freshwater rinse tanks, and freshwater hoses</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Large deep ladders for easy exits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Filtered drinking water and Gatorade available onboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Relaxed pace with experienced local crews</span>
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <h3 className="text-sm font-semibold text-foreground">After the Dive</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>At the end of your final dive day, simply leave your equipment with us</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Sea Saba rinses, stores, and delivers equipment back to your accommodation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Spend more time enjoying Saba instead of hauling wet gear around the island</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <span>Cold drinks are available at the dive center, including local juices, sodas, water, and Deep Dive Brewing Co. beer</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Nitrox */}
      <section id="nitrox" className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Wind className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Free Nitrox for Certified Divers</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sea Saba provides complimentary 32% Nitrox to all certified Nitrox divers — no extra charge, no rental fee. Please bring proof of Nitrox certification.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Why Nitrox on Saba?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Saba&apos;s dive profiles are deeper than average. Volcanic pinnacles like Third Encounter and Man O&apos; War Shoals regularly take divers to 90–120 feet. On a multi-day diving schedule with two dives per day, many divers appreciate the added no-decompression limit flexibility that Nitrox provides at these depths.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Nitrox also suits Saba&apos;s repetitive diving schedule well. When you&apos;re diving the same deep pinnacles two mornings in a row, reduced nitrogen loading between dives can be a meaningful advantage.
            </p>
          </div>
          <div className="rounded-lg border border-border/40 bg-muted/20 p-5">
            <h3 className="text-sm font-semibold text-foreground">Our Air Quality Standard</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sea Saba fills all tanks — air and Nitrox — using a high-pressure breathing air compressor maintained to IANTD standards. Our fill station is regularly tested to ensure clean, dry, safe breathing gas. We do not blend Nitrox by partial pressure from industrial oxygen; we use a dedicated membrane system to produce consistent 32% mixes.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Free 32% Nitrox on all qualifying dives</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Membrane system — consistent, clean mix</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />Proof of Nitrox certification required</li>
              <li className="flex items-center gap-2"><Droplets className="h-3.5 w-3.5 shrink-0 text-primary" />SDI/TDI Nitrox courses available on Saba</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Not yet Nitrox certified?{" "}
            <Link href="/courses" className="font-medium text-primary hover:underline underline-offset-4">
              View our SDI Nitrox course
            </Link>
            {" "}— get certified before your next dive trip and start using free Nitrox on Saba from day one.
          </p>
        </div>
      </section>

      {/* Altitude & Flying FAQ */}
      <section id="altitude-flying" className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Flying to Saba &amp; Diving the Same Day</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A common question from divers planning a Saba trip: &ldquo;I&apos;m flying into St. Maarten and connecting to Saba the same day — can I dive that afternoon?&rdquo;
        </p>
        <div className="mt-5 rounded-lg border border-border/40 bg-muted/20 p-5">
          <h3 className="text-sm font-semibold text-foreground">The Saba Flight Is Not a Standard Commercial Flight</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Standard dive planning guidelines for flying and diving are designed around commercial airline cabin altitudes, which are typically pressurized to the equivalent of 6,000–8,000 feet. The Winair Twin Otter flight from St. Maarten to Saba is a short, low-altitude island hop — the aircraft reaches approximately 2,000 feet for only a few minutes before descending. This is a fundamentally different pressure exposure than a standard commercial flight.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba follows conservative dive planning practices and has been operating these schedules since 1985. Divers who connect through St. Maarten and fly into Saba the same day regularly dive with us without issue under our standard schedule. That said, your individual dive history, nitrogen loading, and health are factors only you and your physician can fully assess.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            DAN (Divers Alert Network) has conducted research specifically on inter-island flying and repetitive diving in the Caribbean. We can share the relevant DAN report with guests who want more detail.
            {/* TODO: Link the DAN report PDF once placed in /public. Expected path: /downloads/dan-saba-altitude-report.pdf */}
          </p>
          <p className="mt-3 text-xs text-muted-foreground/70 italic">
            This information is provided for planning purposes only and does not constitute medical advice. If you have concerns about your specific situation, please consult your physician or contact DAN.
          </p>
        </div>
      </section>

      {/* Dive Insurance */}
      <div className="not-prose mt-10 flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Dive Accident Insurance Recommended</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Sea Saba carries oxygen and first aid onboard, but we strongly recommend all divers carry
            personal dive accident insurance. Short-term coverage through DAN covers a single trip and
            is available right up until departure. Comprehensive travel insurance covering medical
            evacuation is also strongly recommended.
          </p>
          <div className="mt-4">
            <InsuranceCTAs />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to dive Saba?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Join us for world-famous pinnacles, walls, reefs, and unforgettable marine life.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/book">Book Diving</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/dive-sites">Explore Dive Sites</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

