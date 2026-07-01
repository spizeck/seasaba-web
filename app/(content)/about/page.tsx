import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { InlineImage } from "@/components/inline-image";
import { Button } from "@/components/ui/button";
import { Anchor, Users, Shield, Ship, Bus, MapPin } from "lucide-react";
import { TeamCarousel, OwnerFeature } from "@/components/about-page-client";

export const metadata = createMetadata({
  title: "About Us",
  description:
    "Professional scuba diving in Saba since 1985. Small guided groups, experienced local professionals, and a commitment to exceptional underwater experiences.",
  path: "/about",
});

const TRUST_FACTS: { number: string; label: string; href?: string }[] = [
  { number: "1985", label: "Operating continuously since 1985" },
  { number: "8:1", label: "Maximum guide ratio" },
  { number: "30+", label: "Dive sites" },
  { number: "4.8★", label: "Google & TripAdvisor", href: "https://share.google/WnkPS93TFHU4rCFl9" },
];


export default function AboutPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/fort-bay-harbor-saba.webp"
        alt="Sea Saba diving operation at Fort Bay Harbor, Saba"
        title="About Sea Saba"
        subtitle="Professional diving in Saba since 1985"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        Sea Saba is a professional scuba diving operation based at Fort Bay Harbor 
        on the island of Saba. Since 1985, we have guided divers through some of 
        the Caribbean&apos;s most dramatic and pristine underwater terrain: from 
        submerged pinnacles rising from the deep to sheer walls dropping into blue water.
      </p>

      {/* Trust Facts */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_FACTS.map((fact) => {
          const cls = "rounded-lg border border-border/40 bg-muted/20 p-4 text-center";
          const inner = (
            <>
              <p className="text-2xl font-bold text-primary">{fact.number}</p>
              <p className="mt-1 text-xs text-muted-foreground">{fact.label}</p>
            </>
          );
          return fact.href ? (
            <a key={fact.label} href={fact.href} target="_blank" rel="noopener noreferrer" className={`${cls} block transition-opacity hover:opacity-80`}>{inner}</a>
          ) : (
            <div key={fact.label} className={cls}>{inner}</div>
          );
        })}
      </div>

      {/* Our Approach */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Our Approach</h2>
        <div className="mt-4 rounded-lg border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Small Groups, Personal Attention</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We maintain a maximum 8:1 diver-to-guide ratio. This is not a marketing 
            point. It is how we believe diving should be conducted. Small groups allow 
            for better briefings, more flexible site selection, and a more personal 
            experience on every dive.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Anchor className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Experienced Local Professionals</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our guides are not seasonal staff passing through. They are experienced 
            professionals who have spent years, in some cases decades, diving 
            Saba&apos;s waters. They understand the conditions, the sites, and how 
            to match divers to the right experience.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Conservation and Stewardship</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Saba&apos;s Marine Park was established in 1987 and remains one of the 
            Caribbean&apos;s most successful protected areas. We operate within its 
            guidelines, educate our divers on responsible reef interaction, and work 
            to preserve what makes Saba exceptional, not just for today&apos;s divers, 
            but for the future.
          </p>
        </div>
      </section>

      {/* Meet the Owners */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Meet the Owners</h2>
        <div className="mt-6">
          <OwnerFeature />
        </div>
      </section>

      {/* Meet the Crew */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Meet the Crew</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Our crew brings together local knowledge, professional experience, and
          the warm hospitality that keeps guests coming back.
        </p>
        <div className="mt-6">
          <TeamCarousel />
        </div>
      </section>

      {/* Our Historic Home in Fort Bay Harbor */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Our Historic Home in Fort Bay Harbor</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-5 lg:items-center">
          {/* Image 60% */}
          <div className="lg:col-span-3">
            <InlineImage
              src="/images/optimized/fort-bay-two-boats.webp"
              alt="Two Sea Saba custom dive catamarans moored at Fort Bay Harbor, Saba"
              aspectRatio="4/3"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          {/* Text 40% */}
          <div className="lg:col-span-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Sea Saba has proudly operated from Fort Bay Harbor for decades, the island&apos;s
              traditional gateway to the sea. Every dive trip begins just steps from our dock,
              with complimentary transportation available from accommodations anywhere on Saba.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              As Saba prepares for the future with the new Black Rocks Harbor development, we
              continue to welcome divers from our historic Fort Bay location while looking
              forward to an even better waterfront home in the years ahead.
            </p>
            <ul className="mt-5 space-y-3">
              {[
                { icon: Ship, label: "Direct harbor departures" },
                { icon: Bus, label: "Complimentary island-wide shuttle" },
                { icon: Anchor, label: "Custom dive catamarans" },
                { icon: MapPin, label: "Conveniently located minutes from Windwardside and The Bottom" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why Divers Love Saba */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">Why Divers Love Saba</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-5 lg:items-center">
          {/* Text left */}
          <div className="lg:col-span-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Saba isn&apos;t a typical Caribbean destination. There are no cruise ships,
              sprawling resorts, or crowded beaches. Instead, visitors come for dramatic
              volcanic scenery, protected reefs, exceptional visibility, and a slower island
              rhythm that feels worlds away from the usual tourist trail.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-foreground">No crowds, no cruise ships</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Saba has deliberately kept large-scale tourism at arm&apos;s length. The result is an island that still feels like itself.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Protected Marine Park</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">The Saba Marine Park has actively managed its reefs since 1987. Healthy coral, abundant fish life, and exceptional visibility are the direct result.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Adventure beyond the dive</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Volcanic peaks, cloud forest trails, and a quiet village pace give topside days their own reward.</p>
              </div>
            </div>
            <blockquote className="mt-5 border-l-2 border-primary pl-4">
              <p className="text-sm italic leading-relaxed text-foreground">
                Saba rewards travelers looking for quality over crowds.
              </p>
            </blockquote>
          </div>
          {/* Image right 60% */}
          <div className="lg:col-span-3">
            <InlineImage
              src="/images/optimized/saba-volcanic-scenery.webp"
              alt="Dramatic volcanic scenery and coastline of Saba, Caribbean Netherlands"
              aspectRatio="4/3"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Dive with Sea Saba</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Experience professional, small-group diving with a team that has been exploring 
          Saba&apos;s waters since 1985.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/book">Book Diving</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/diving">View Diving Options</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

