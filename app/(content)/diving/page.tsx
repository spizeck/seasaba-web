import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Users, Clock, Award, Ship, Droplets, Shield } from "lucide-react";

export const metadata = createMetadata({
  title: "Diving with Sea Saba",
  description:
    "Professional boat diving in Saba's Marine Park. Small guided groups, comfortable boats, experienced local professionals. Open Water to technical.",
  path: "/diving",
});

const TRUST_SIGNALS = [
  { icon: Users, label: "Small Guided Groups" },
  { icon: Ship, label: "Caribbean-Built Dive Boats" },
  { icon: Droplets, label: "Free 32% Nitrox" },
  { icon: Shield, label: "Saba Marine Park" },
];

const DIVE_EXPERIENCES = [
  {
    title: "Classic 2-Tank Dive",
    subtitle: "THE CLASSIC SEA SABA EXPERIENCE",
    description:
      "Two relaxed morning dives showcasing Saba's famous pinnacles, walls, and reefs. Perfect for most certified divers and our most popular option.",
    details: ["10:30 AM departure", "8 divers max per guide", "Nitrox included", "Scuba Diver certification minimum"],
    cta: "Book classic diving",
    href: "/book?item=classic",
    itemId: "classic",
    featured: true,
  },
  {
    title: "Advanced 2-Tank Dive",
    subtitle: "FOR EXPERIENCED DIVERS",
    description:
      "Explore deeper pinnacles, walls, and seamounts with extended bottom times. Designed for experienced divers comfortable with deeper profiles.",
    details: ["9:00 AM departure", "Nitrox included", "Dive computer required", "Advanced Open Water + 20 dives OR Open Water + 50 dives"],
    cta: "Book advanced diving",
    href: "/book?item=advanced",
    itemId: "advanced",
    featured: false,
  },
  {
    title: "Afternoon 1-Tank Dive",
    subtitle: "A RELAXED AFTERNOON DIVE",
    description:
      "A single afternoon dive to one of Saba's signature sites. Great for adding an extra dive or enjoying a lighter day.",
    details: ["1:00 PM departure", "Up to 70 ft / 21 m", "Open Water minimum", "Dive computer required"],
    cta: "Book afternoon dive",
    href: "/book?item=afternoon",
    itemId: "afternoon",
    featured: false,
  },
  {
    title: "Afternoon Snorkel Trip",
    subtitle: "SURFACE EXPLORATION",
    description:
      "Join the afternoon boat and experience Saba's clear water, coral reefs, turtles, and abundant marine life from the surface.",
    details: ["1:00 PM departure", "Equipment included", "Open water conditions", "Optional private guide available"],
    cta: "Book snorkeling",
    href: "/book?item=snorkel",
    itemId: "snorkel",
    featured: false,
  },
  {
    title: "Private Charter",
    subtitle: "EXCLUSIVE EXPERIENCES",
    description:
      "Private diving aboard our custom 38-foot catamarans. Flexible schedules and personalized dive plans for families, photographers, and groups.",
    details: ["Half or full day", "Up to 8 guests", "Dedicated captain", "Flexible itinerary"],
    cta: "Book private charter",
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
      {/* Page Hero */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Diving with Sea Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Sea Saba is Saba's only continuously operating dive center since 1985. Four 
        decades of uninterrupted operation, experienced local guides with unmatched 
        knowledge of the island, and generations of divers have explored Saba with us.
      </p>

      {/* Trust Signals */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_SIGNALS.map((signal) => (
          <div
            key={signal.label}
            className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/20 p-4"
          >
            <signal.icon className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{signal.label}</span>
          </div>
        ))}
      </div>

      {/* Dive Experience Intro */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">The Sea Saba Experience</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Sea Saba operates 38-foot power catamarans built in the Caribbean for Caribbean 
          conditions. We run relaxed, professional dive days with small guided groups, 
          experienced local guides, and spacious boats. Our approach is safety-focused 
          and unhurried.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Award className="mt-0.5 h-4 w-4 text-primary" />
            <span>Saba's only continuously operating dive center since 1985</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 text-primary" />
            <span>Maximum 8 divers per guide for small groups and personal attention</span>
          </li>
          <li className="flex items-start gap-2">
            <Ship className="mt-0.5 h-4 w-4 text-primary" />
            <span>38-foot power catamarans with large shaded decks, camera tables, marine head, fresh water, and stable platform</span>
          </li>
          <li className="flex items-start gap-2">
            <Droplets className="mt-0.5 h-4 w-4 text-primary" />
            <span>Free 32% Nitrox for qualified divers</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-primary" />
            <span>Saba Marine Park diving with volcanic pinnacles, walls, reefs, and protected waters</span>
          </li>
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
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    <Clock className="h-3 w-3" />
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

      {/* What to Expect */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8">
        <h2 className="text-xl font-semibold text-foreground">What to Expect</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          A typical dive day with Sea Saba follows a relaxed but professional rhythm. 
          We prioritize safety, comfort, and getting you in the water at the right sites 
          under the right conditions.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-medium text-foreground">Before the Dive</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>• Hotel taxi pickup from Windwardside or The Bottom</li>
              <li>• Check-in at Fort Bay harbor. Gear setup assistance available</li>
              <li>• Site briefing with your guide covering conditions, topography, and marine life</li>
              <li>• Small group boarding with no rushing or overcrowding</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-foreground">On the Boat</h3>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>• Short, comfortable ride to dive sites</li>
              <li>• Gear check and final briefing at the site</li>
              <li>• Entry assistance from crew</li>
              <li>• Surface interval with refreshments and surface support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to dive Saba?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Book directly with Sea Saba for professional, small-group diving in the Caribbean's most pristine marine park.
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

