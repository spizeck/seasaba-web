import Link from "next/link";
import { Hero } from "@/components/hero";
import { VideoSection } from "@/components/video-section";
import { ReviewsSection } from "@/components/reviews-section";
import { Button } from "@/components/ui/button";

const ROUTING_CARDS = [
  {
    title: "Diving",
    description:
      "Boat diving with small groups, experienced guides, and access to Saba's most dramatic sites. Recreational and technical divers welcome.",
    href: "/diving",
    cta: "View Diving Options",
  },
  {
    title: "Dive Sites",
    description:
      "Pinnacles, seamounts, walls, and reef gardens — over 30 protected sites in the Saba Marine Park. Explore what makes Saba special.",
    href: "/dive-sites",
    cta: "Explore Dive Sites",
  },
  {
    title: "Courses",
    description:
      "From Discover Scuba to Divemaster, learn in one of the Caribbean's most rewarding dive environments with certified instructors.",
    href: "/courses",
    cta: "View Courses",
  },
  {
    title: "Plan Your Trip",
    description:
      "Getting to Saba takes some planning — we can help. Find information on travel, accommodation, timing, and what to expect.",
    href: "/plan-your-trip",
    cta: "Start Planning",
  },
] as const;

const WHY_SABA = [
  {
    heading: "Extraordinary Topography",
    body:
      "Saba rises directly from the ocean floor. Underwater, that means dramatic pinnacles, sheer walls, and seamounts that draw pelagic life year-round.",
  },
  {
    heading: "Pristine and Protected",
    body:
      "The Saba Marine Park protects over 30 dive sites. No cruise ships. No overcrowding. Just healthy reefs and exceptional visibility.",
  },
  {
    heading: "Small-Group, Expert-Led",
    body:
      "Sea Saba runs small groups on large, comfortable dive boats. Experienced guides who know these waters — not generic dive tour operators.",
  },
] as const;

export default function Home() {
  return (
    <>
      {/* 1. Hero — static image, extends behind navbar */}
      <Hero />

      {/* 2. Supporting section — Why Dive Saba */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Why dive Saba?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Saba is not a typical Caribbean dive destination. It is one of the
              region&apos;s most rewarding — and least crowded — underwater environments.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {WHY_SABA.map((item) => (
              <div key={item.heading}>
                <h3 className="text-base font-semibold text-foreground">
                  {item.heading}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Video section + CTA */}
      <VideoSection />

      {/* 4. Routing sections — what can I choose / where do I go next */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Where would you like to go?
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {ROUTING_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col rounded-lg border border-border/60 bg-card p-8 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
                <span className="mt-6 text-sm font-medium text-primary">
                  {card.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof — TripAdvisor reviews */}
      <ReviewsSection />

      {/* 5. Final CTA */}
      <section className="border-t border-border/40 bg-[#0B0F3B] py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Ready to dive Saba?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/70">
            Book directly with Sea Saba. Small groups, professional guides, and
            one of the Caribbean&apos;s finest dive operations.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 text-base font-semibold">
              <Link href="/book">Book Diving</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/40 bg-transparent text-white hover:bg-white/10 text-base font-semibold">
              <Link href="/plan-your-trip">Plan Your Trip</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
