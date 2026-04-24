import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mountain, Waves, Fish, Compass } from "lucide-react";

export const metadata = createMetadata({
  title: "Saba Dive Sites",
  description:
    "Over 30 dive sites in the Saba Marine Park. Pinnacles, walls, seamounts, and reef gardens. Protected, pristine, and professionally guided.",
  path: "/dive-sites",
});

const SITE_CATEGORIES = [
  {
    icon: Mountain,
    title: "Pinnacles & Seamounts",
    description:
      "Saba's signature dives. Submerged volcanic formations rising from the deep, encrusted with sponges and black coral. Third Encounter, Eye of the Needle, and Diamond Rock define this category.",
    sites: ["Third Encounter", "Eye of the Needle", "Diamond Rock", "Tent Reef"],
    depth: "18–40m / 60–130ft",
    experience: "Intermediate to Advanced",
  },
  {
    icon: Waves,
    title: "Walls & Drop-offs",
    description:
      "Sheer vertical walls along Saba's flanks. Dramatic topography with ledges, overhangs, and swim-throughs. Home to large grouper, turtles, and schooling fish.",
    sites: ["Tent Reef Wall", "Ladder Bay", "Green Island"],
    depth: "10–40m / 30–130ft",
    experience: "All levels",
  },
  {
    icon: Fish,
    title: "Reef Gardens",
    description:
      "Colorful coral gardens with exceptional visibility. Perfect for photographers and marine life enthusiasts. Dense populations of reef fish and invertebrates.",
    sites: ["Ladder Labyrinth", "Cove Bay", "The Hole"],
    depth: "5–25m / 15–80ft",
    experience: "All levels",
  },
  {
    icon: Compass,
    title: "Specialty Sites",
    description:
      "Unique dives with specific characteristics — from shark encounters to macro photography havens. Each offers something distinct for experienced divers.",
    sites: ["Shark Shoals", "Twilight Zone", "Man O' War Shoals", "Customs House"],
    depth: "12–35m / 40–115ft",
    experience: "Intermediate",
  },
] as const;

const FEATURED_SITES = [
  {
    name: "Third Encounter",
    tagline: "Saba's most famous pinnacle",
    description:
      "A submerged seamount rising from the abyss, covered in sponges and coral. Expect pelagic life — sharks, rays, and large jacks. The definitive Saba dive.",
    depth: "18–40m",
    highlight: "Signature site",
  },
  {
    name: "Eye of the Needle",
    tagline: "Dramatic spire formation",
    description:
      "A narrow volcanic spire rising vertically from the depths. Divers circumnavigate the structure, finding black coral, barracuda, and exceptional visibility.",
    depth: "20–35m",
    highlight: "Topography",
  },
  {
    name: "Ladder Labyrinth",
    tagline: "Intricate reef complexity",
    description:
      "A maze-like reef system with tunnels, overhangs, and canyons. Dense marine life in a compact area — ideal for photographers and curious explorers.",
    depth: "10–25m",
    highlight: "Marine life",
  },
  {
    name: "Tent Reef Wall",
    tagline: "Classic wall diving",
    description:
      "A dramatic vertical wall with ledges and crevices. Large grouper, turtles, and abundant reef fish. Excellent for all experience levels.",
    depth: "12–40m",
    highlight: "Versatile",
  },
] as const;

export default function DiveSitesPage() {
  return (
    <>
      {/* Page Hero */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dive Sites of Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        The Saba Marine Park protects over 30 dive sites around this volcanic island. 
        Dramatic underwater topography — pinnacles rising from the deep, sheer walls 
        dropping into blue water, and pristine reef systems — makes Saba one of the 
        Caribbean&apos;s most rewarding dive destinations.
      </p>

      {/* Marine Park Note */}
      <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-6">
        <h2 className="text-base font-semibold text-foreground">The Saba Marine Park</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Established in 1987, the Saba Marine Park was one of the Caribbean&apos;s first 
          comprehensive protected marine areas. Strict regulations — no anchoring, no 
          fishing, no cruise ships — have preserved exceptional coral health and marine 
          biodiversity. Visibility often exceeds 30m (100ft).
        </p>
      </div>

      {/* Site Categories */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-foreground">Site Categories</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Saba&apos;s dive sites fall into distinct types, each offering a different experience.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {SITE_CATEGORIES.map((category) => (
            <div
              key={category.title}
              className="rounded-lg border border-border/60 bg-card p-6 transition-colors hover:border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <category.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.sites.map((site) => (
                  <span
                    key={site}
                    className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {site}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{category.depth}</span>
                <span>•</span>
                <span>{category.experience}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Sites */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-foreground">Featured Sites</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These sites define the Saba diving experience and are consistently rated among the Caribbean&apos;s best.
        </p>

        <div className="mt-6 space-y-4">
          {FEATURED_SITES.map((site) => (
            <div
              key={site.name}
              className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card p-6 sm:flex-row sm:items-start"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{site.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {site.highlight}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{site.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {site.description}
                </p>
              </div>
              <div className="sm:text-right">
                <span className="text-sm font-medium text-foreground">{site.depth}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Diving with Sea Saba CTA */}
      <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8">
        <h2 className="text-xl font-semibold text-foreground">Experience These Sites</h2>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          All Saba dive sites are accessible only by boat. Sea Saba operates guided dive 
          trips daily, with small groups led by experienced professionals who know these 
          waters intimately. We match sites to conditions and diver experience for the 
          best possible underwater experience.
        </p>
        <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/diving">View Diving Options</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/book">Book Diving</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

