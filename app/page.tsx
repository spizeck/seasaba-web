import Link from "next/link";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { Button } from "@/components/ui/button";

const ROUTES = [
  {
    title: "Dive Sites",
    description:
      "Explore Saba's pinnacles, walls, and reefs — consistently rated among the Caribbean's finest.",
    href: "/diving",
  },
  {
    title: "Courses & Certifications",
    description:
      "From Open Water to Divemaster. Learn with experienced instructors who know these waters.",
    href: "/courses",
  },
  {
    title: "About Sea Saba",
    description:
      "Small groups, personal attention, and decades of experience on one of the Caribbean's best-kept secrets.",
    href: "/about",
  },
  {
    title: "Contact Us",
    description:
      "Questions about diving in Saba? Get in touch — we're happy to help you plan.",
    href: "/contact",
  },
] as const;

export default function Home() {
  return (
    <>
      {/* 1. Hero — static image, extends behind navbar */}
      <Hero />

      {/* 2. Supporting section — "Why Saba" */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Why Saba?
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            No crowds. No cruise ships. Just pristine reefs, dramatic underwater
            topography, and some of the healthiest marine ecosystems in the
            Caribbean. Saba&apos;s marine park protects over 30 dive sites — from
            shallow coral gardens to deep pinnacles teeming with pelagic life.
          </p>
        </div>
      </section>

      {/* 3. Video section + CTA */}
      <VideoSection />

      {/* 4. Routing sections — cards linking to deeper pages */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {ROUTES.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="group rounded-lg border border-border/60 bg-card p-8 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {route.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {route.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <section className="border-t border-border/40 bg-secondary/30 py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Ready to dive?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Check availability and book your next underwater adventure in Saba.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="text-base font-semibold">
              <Link href="/book">Check Availability</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
