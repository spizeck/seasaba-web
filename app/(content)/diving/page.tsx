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
  { icon: Users, label: "Small guided groups" },
  { icon: Ship, label: "Custom dive boats" },
  { icon: Droplets, label: "Nitrox available" },
  { icon: Shield, label: "Saba Marine Park" },
];

const DIVE_EXPERIENCES = [
  {
    title: "Advanced 2-Tank Dive",
    subtitle: "For experienced divers",
    description:
      "Two guided dives at Saba's premier sites — pinnacles, walls, and seamounts. Maximum 6 divers per guide. Includes tanks, weights, and professional guidance.",
    details: ["7:30 AM departure", "6+ divers max per guide", "Advanced Open Water required"],
    cta: "Book Advanced Diving",
    href: "/book",
    featured: true,
  },
  {
    title: "Classic 2-Tank Dive",
    subtitle: "Our most popular option",
    description:
      "Two guided dives suitable for all certified divers. Explore Saba's dramatic underwater topography with experienced guides in small groups.",
    details: ["7:30 AM departure", "6 divers max per guide", "Open Water certification required"],
    cta: "Book Diving",
    href: "/book",
    featured: false,
  },
  {
    title: "Afternoon 1-Tank Dive",
    subtitle: "For the time-conscious",
    description:
      "Single afternoon dive when conditions permit. A focused experience at one of Saba&apos;s signature sites. Perfect for those with limited time.",
    details: ["2:00 PM departure", "Subject to conditions", "Open Water certification required"],
    cta: "Check Availability",
    href: "/book",
    featured: false,
  },
  {
    title: "Afternoon Snorkel Trip",
    subtitle: "Surface exploration",
    description:
      "Guided snorkel trip to Saba&apos;s shallow sites. Excellent visibility, volcanic formations, and abundant marine life accessible from the surface.",
    details: ["2:00 PM departure", "All experience levels", "Equipment available"],
    cta: "Book Snorkeling",
    href: "/book",
    featured: false,
  },
  {
    title: "SDI / TDI Courses",
    subtitle: "Professional instruction",
    description:
      "From Discover Scuba to Divemaster. Learn in one of the Caribbean's most rewarding environments with certified, experienced instructors.",
    details: ["Small class sizes", "All certification levels", "Theory + practical"],
    cta: "View Courses",
    href: "/courses",
    featured: false,
  },
  {
    title: "Private Charter",
    subtitle: "Exclusive experiences",
    description:
      "Full or half-day private boat charter with dedicated guide. Customized itinerary for your group. Ideal for photographers, families, or special occasions.",
    details: ["Custom scheduling", "Dedicated guide", "Full boat access"],
    cta: "Inquire Now",
    href: "/contact",
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
        Professional boat diving in the Saba Marine Park since 1985. Small guided 
        groups on custom dive boats with experienced local professionals who know 
        these waters intimately.
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
          We run small guided groups on large, comfortable dive boats. Every dive is led 
          by experienced guides who have spent years exploring Saba&apos;s waters. Our approach 
          is professional but unhurried — we take the time to do things right.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <Award className="mt-0.5 h-4 w-4 text-primary" />
            <span>Operating in Saba since 1985 — decades of local expertise</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 text-primary" />
            <span>Maximum 6 divers per guide — small groups, personal attention</span>
          </li>
          <li className="flex items-start gap-2">
            <Ship className="mt-0.5 h-4 w-4 text-primary" />
            <span>Custom dive boats designed for Saba&apos;s conditions — spacious and stable</span>
          </li>
          <li className="flex items-start gap-2">
            <Droplets className="mt-0.5 h-4 w-4 text-primary" />
            <span>Nitrox included on qualifying dives — longer bottom times, shorter surface intervals</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="mt-0.5 h-4 w-4 text-primary" />
            <span>Saba Marine Park protection — healthy reefs, exceptional visibility, no crowds</span>
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
                <span className="absolute -top-3 left-6 bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
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
              <div className="mt-6">
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
              <li>• Check-in at Fort Bay harbor — gear setup assistance available</li>
              <li>• Site briefing with your guide — conditions, topography, marine life</li>
              <li>• Small group boarding — no rushing, no overcrowding</li>
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

