import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Anchor, Users, Shield, MapPin, Star } from "lucide-react";
import { TeamCarousel, TimelineItem } from "@/components/about-page-client";

export const metadata = createMetadata({
  title: "About Sea Saba",
  description:
    "Professional scuba diving in Saba since 1985. Small guided groups, experienced local professionals, and a commitment to exceptional underwater experiences.",
  path: "/about",
});

const TRUST_FACTS = [
  { number: "1985", label: "Operating continuously since 1985" },
  { number: "8:1", label: "Maximum guide ratio" },
  { number: "30+", label: "Dive sites" },
  { number: "4.8★", label: "Google & TripAdvisor" },
] as const;

const TIMELINE = [
  {
    year: "1985",
    title: "Sea Saba founded",
    description: "The original dive center established at Fort Bay Harbor, becoming Saba's gateway to world-class diving.",
  },
  {
    year: "1987",
    title: "Saba Marine Park established",
    description: "One of the Caribbean's first and most successful marine protected areas, preserving Saba's underwater treasures.",
  },
  {
    year: "2021",
    title: "Chad and Katy become owners",
    description: "New ownership brings renewed commitment to the Sea Saba tradition of personalized, professional diving.",
  },
  {
    year: "Today",
    title: "Continuously operating",
    description: "Sea Saba remains Saba's only continuously operating dive center, serving divers from around the world.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        About Sea Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Sea Saba is a professional scuba diving operation based at Fort Bay Harbor 
        on the island of Saba. Since 1985, we have guided divers through some of 
        the Caribbean&apos;s most dramatic and pristine underwater terrain — from 
        submerged pinnacles rising from the deep to sheer walls dropping into blue water.
      </p>

      {/* Trust Facts */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {TRUST_FACTS.map((fact) => (
          <div key={fact.label} className="rounded-lg border border-border/40 bg-muted/20 p-4 text-center">
            <p className="text-2xl font-bold text-primary">{fact.number}</p>
            <p className="mt-1 text-xs text-muted-foreground">{fact.label}</p>
          </div>
        ))}
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
            point — it is how we believe diving should be conducted. Small groups allow 
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
            professionals who have spent years — in many cases decades — diving 
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
            to preserve what makes Saba exceptional — not just for today&apos;s divers, 
            but for the future.
          </p>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Meet the Team</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Experienced professionals dedicated to making your Saba diving experience exceptional.
        </p>
        <div className="mt-6">
          <TeamCarousel />
        </div>
      </section>

      {/* Our Story - Timeline */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Our Story</h2>
        <div className="mt-6 max-w-2xl">
          {TIMELINE.map((item, index) => (
            <TimelineItem
              key={item.year}
              year={item.year}
              title={item.title}
              description={item.description}
              isLast={index === TIMELINE.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Location</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Fort Bay Harbor, Saba</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We operate from Fort Bay, Saba&apos;s small harbor on the southern coast. 
                  The dive boats depart directly from the dock, with the island&apos;s dramatic 
                  volcanic cliffs rising behind us. Windwardside and The Bottom are a short 
                  drive up the mountain — our taxi service provides pickup from most accommodations.
                </p>
              </div>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden lg:h-full lg:min-h-[280px]">
            <Image
              src="/images/optimized/fort-bay-harbor-saba.webp"
              alt="Fort Bay Harbor on Saba showing the dive boat dock and volcanic cliffs"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Why Saba */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Why Saba</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-muted-foreground">
              Saba is five square miles of volcanic rock rising steeply from the Caribbean Sea. 
              What Saba offers is some of the healthiest, most dramatic diving in the region.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">No cruise ships</p>
                <p className="text-xs text-muted-foreground">Uncrowded waters</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Protected marine park</p>
                <p className="text-xs text-muted-foreground">Since 1987</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Dramatic topography</p>
                <p className="text-xs text-muted-foreground">Pinnacles & walls</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                <p className="text-sm font-medium text-foreground">Small-island atmosphere</p>
                <p className="text-xs text-muted-foreground">Authentic Caribbean</p>
              </div>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden lg:h-full lg:min-h-[300px]">
            <Image
              src="/images/optimized/saba-volcanic-coastline.webp"
              alt="Dramatic volcanic coastline of Saba rising from the Caribbean Sea"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
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

