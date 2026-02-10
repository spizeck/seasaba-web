import Link from "next/link";
import { Hero } from "@/components/hero";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    title: "World-Class Dive Sites",
    description:
      "Pristine pinnacles, dramatic walls, and vibrant reefs. Saba's marine park is consistently rated among the Caribbean's finest.",
    href: "/diving",
  },
  {
    title: "Expert-Led Courses",
    description:
      "From Open Water to Divemaster. Learn with experienced instructors who know these waters intimately.",
    href: "/courses",
  },
  {
    title: "Small Groups, Big Experiences",
    description:
      "We keep groups small so every diver gets personal attention and the best possible underwater experience.",
    href: "/about",
  },
] as const;

export default function Home() {
  return (
    <>
      <Hero />

      {/* Feature cards — routing section */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="group rounded-lg border border-border/60 bg-card p-8 transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="border-t border-border/40 bg-muted/20 py-20">
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
