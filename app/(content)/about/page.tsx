import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Anchor, Users, Shield, MapPin } from "lucide-react";

export const metadata = createMetadata({
  title: "About Sea Saba",
  description:
    "Professional scuba diving in Saba since 1985. Small guided groups, experienced local professionals, and a commitment to exceptional underwater experiences.",
  path: "/about",
});

const TRUST_FACTS = [
  { number: "1985", label: "Operating since" },
  { number: "6", label: "Divers max per guide" },
  { number: "30+", label: "Dive sites accessible" },
  { number: "40+", label: "Years local expertise" },
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
            <p className="text-xs text-muted-foreground">{fact.label}</p>
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
            We limit our groups to a maximum of 6 divers per guide. This is not a marketing 
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

      {/* Location */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Location</h2>
        <div className="mt-4 rounded-lg border border-border/40 bg-muted/20 p-6">
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
      </section>

      {/* Why Saba */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Why Saba</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Saba is five square miles of volcanic rock rising steeply from the Caribbean Sea. 
          There are no beaches, no cruise ship terminals, no large resorts. What Saba offers 
          instead is some of the healthiest, most dramatic diving in the region — protected 
          by one of the Caribbean&apos;s oldest marine parks and accessed only by those who 
          make the effort to get here.
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          The underwater topography is exceptional: pinnacles and seamounts rising from hundreds 
          of feet below, sheer walls dropping into blue water, and coral gardens thriving under 
          decades of protection. For divers who value quality over convenience, Saba delivers.
        </p>
      </section>

      {/* CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Dive with Sea Saba</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Experience professional, small-group diving on one of the Caribbean&apos;s 
          most pristine and least-visited islands.
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

