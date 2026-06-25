import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { DiveAreaSites } from "@/components/dive-area-sites";

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
    sites: ["Third Encounter (The Needle)", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
    knownFor: ["Volcanic seamounts rising from the blue", "Massive barrel sponges and black coral", "Deep reefs and open-ocean exposure", "Saba's most iconic advanced dives"],
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imagePosition: "left",
  },
  {
    id: "tent-reef",
    title: "Tent Reef",
    description:
      "Tent Reef is one of Saba's most versatile dive areas, beginning with shallower reef and mini-wall profiles before developing into dramatic wall diving. The area includes healthy coral, turtles, blue-water views, and the famous Three Sisters seamounts off the wall.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "The Three Sisters", "Tedran Wall"],
    knownFor: ["Mini walls, canyons, and swim-throughs", "Coral gardens and healthy reef systems", "Depths ranging from shallow reefs to deep walls", "Something different on nearly every dive"],
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imagePosition: "right",
  },
  {
    id: "ladder-bay",
    title: "Ladder Bay",
    description:
      "Ladder Bay offers volcanic landscapes, shallow-to-mid-depth reefs, swim-throughs, and some of Saba's most interesting small marine life. This area includes Hot Springs, where volcanic vents create warm, mustard-colored sand.",
    sites: ["Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
    knownFor: ["Lava fingers separated by black sand chutes", "Giant coral-covered boulders and historic anchors", "Seagrass beds with turtles and macro life", "Flying gurnards, nudibranchs, and hidden critters"],
    image: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
    imagePosition: "left",
  },
  {
    id: "wells-bay",
    title: "Wells Bay",
    description:
      "Wells Bay sits along Saba's rugged northwest coast and offers scenic volcanic terrain, healthy reefs, and sites that are often chosen when conditions favor the island's leeward side. These dives can include reef slopes, boulders, and blue-water views.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
    knownFor: ["Healthy coral-covered pinnacles", "Diamond Rock and Man O\u2019 War Shoals", "Turtles, lobster, and reef sharks", "Remote sites with exceptional visibility"],
    image: "/images/optimized/wells-bay-dive-site-saba.webp",
    imagePosition: "right",
  },
  {
    id: "windwardside",
    title: "Windwardside",
    description:
      "The Windwardside area offers a different side of Saba diving, with reef systems and coastal sites shaped by the island's volcanic shoreline. When conditions allow, these sites provide scenic profiles, healthy coral, and rewarding marine life encounters.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner"],
    knownFor: ["Extensive elkhorn coral formations", "White sand and massive volcanic boulders", "Healthy biological reef systems", "Excellent conditions for photography"],
    image: "/images/optimized/windwardside-dive-site-saba.webp",
    imagePosition: "left",
  },
] as const;

export default function DiveSitesPage() {
  return (
    <>
      <PageHero
        src="/images/optimized/green-turtle-with-diver-saba.webp"
        alt="Green sea turtle swimming with a diver in the Saba Marine Park"
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

                  {/* Known For */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Known For</h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {area.knownFor.map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-border/50 bg-muted/40 px-2.5 py-1 text-xs text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Site Chips — interactive, open video modal */}
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dive Sites</h4>
                    <DiveAreaSites sites={area.sites} />
                  </div>

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

