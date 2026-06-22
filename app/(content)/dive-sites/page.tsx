import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";

export const metadata = createMetadata({
  title: "Saba Dive Sites",
  description:
    "Explore Saba's world-famous dive sites by area. From The Pinnacles to Diamond Rock, discover volcanic pinnacles, walls, reefs, and seamounts in the Saba Marine Park.",
  path: "/dive-sites",
});

const DIVE_AREAS = [
  {
    id: "pinnacles",
    title: "The Pinnacles",
    description:
      "The Pinnacles are the dives that helped put Saba on the map. About a mile offshore, these volcanic seamounts and deep plateau sites rise from the blue and deliver some of Saba's most dramatic underwater terrain. These dives are best suited for experienced divers due to depth and open-ocean exposure.",
    sites: ["Third Encounter", "The Needle", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
    depth: "23–45m+ / 75–150ft+",
    marineLife: ["Reef sharks", "Nurse sharks", "Schooling jacks", "Barracuda", "Black coral", "Large sponges"],
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imagePosition: "left",
  },
  {
    id: "tent-reef",
    title: "Tent Reef",
    description:
      "Tent Reef is one of Saba's most versatile dive areas, beginning with shallower reef and mini-wall profiles before developing into dramatic wall diving. The area includes healthy coral, turtles, blue-water views, and the famous Three Sisters seamounts off the wall.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "The Three Sisters", "Tedran Wall"],
    depth: "6–45m+ / 20–150ft+",
    marineLife: ["Green turtles", "Reef fish", "Sponges", "Lobsters", "Occasional reef sharks", "Schooling fish"],
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imagePosition: "right",
  },
  {
    id: "ladder-bay",
    title: "Ladder Bay",
    description:
      "Ladder Bay offers volcanic landscapes, shallow-to-mid-depth reefs, swim-throughs, and some of Saba's most interesting small marine life. This area includes Hot Springs, where volcanic vents create warm, mustard-colored sand.",
    sites: ["Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
    depth: "12–30m / 40–100ft",
    marineLife: ["Nurse sharks", "Green turtles", "Flying gurnards", "Spiny lobsters", "Octopus", "Macro life"],
    image: "/images/optimized/spiny-lobster-ladder-bay.webp",
    imagePosition: "left",
  },
  {
    id: "wells-bay",
    title: "Wells Bay",
    description:
      "Wells Bay sits along Saba's rugged northwest coast and offers scenic volcanic terrain, healthy reefs, and sites that are often chosen when conditions favor the island's leeward side. These dives can include reef slopes, boulders, and blue-water views.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
    depth: "6–25m / 20–80ft",
    marineLife: ["Green turtles", "Spiny lobsters", "Reef fish", "Occasional sharks", "Rays at Diamond Rock and Man O'War Shoals"],
    image: "/images/optimized/saba-volcanic-coastline.webp",
    imagePosition: "right",
  },
  {
    id: "windwardside",
    title: "Windwardside",
    description:
      "The Windwardside area offers a different side of Saba diving, with reef systems and coastal sites shaped by the island's volcanic shoreline. When conditions allow, these sites provide scenic profiles, healthy coral, and rewarding marine life encounters.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner"],
    depth: "10–30m / 30–100ft",
    marineLife: ["Reef fish", "Green turtles", "Sponges", "Coral gardens", "Macro life"],
    image: "/images/optimized/green-turtle-with-diver-saba.webp",
    imagePosition: "left",
  },
] as const;

export default function DiveSitesPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/divers-above-coral-pinnacle-saba.webp"
        alt="Scuba divers above a coral-encrusted pinnacle in the Saba Marine Park"
        title="Saba Dive Sites"
        subtitle="30+ protected sites across volcanic pinnacles, walls, and reefs"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        The Saba Marine Park protects over 30 dive sites around this volcanic island.
        Explore the world-famous pinnacles, dramatic walls, healthy reefs, and seamounts
        that make Saba one of the Caribbean&apos;s most rewarding dive destinations.
      </p>

      {/* Dive Area Sections */}
      <div className="mt-12 space-y-16">
        {DIVE_AREAS.map((area) => (
          <section key={area.id} id={area.id} className="scroll-mt-20">
            <FeatureImage
              src={area.image}
              alt={`Diving at ${area.title} in the Saba Marine Park`}
              imageRight={area.imagePosition === "right"}
            >
              <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {area.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {area.description}
                  </p>

                  {/* Site Chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {area.sites.map((site) => (
                      <span
                        key={site}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {site}
                      </span>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Depth Range
                      </h4>
                      <p className="mt-1 text-sm font-medium text-foreground">{area.depth}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Signature Marine Life
                      </h4>
                      <p className="mt-1 text-sm text-foreground">
                        {area.marineLife.slice(0, 3).join(" • ")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/dive-sites/${area.id}`}
                    className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    Explore {area.title} sites →
                  </Link>
              </div>
            </FeatureImage>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <section className="mt-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Ready to explore?
        </h2>
        <p className="mt-3 text-base text-muted-foreground">
          Sea Saba&apos;s experienced guides know every site intimately and match conditions to your experience level.
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="text-base font-semibold">
            <Link href="/diving">View Diving Options</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base font-semibold">
            <Link href="/book">Book Your Dive</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

