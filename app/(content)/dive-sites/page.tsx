import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/page-hero";
import { FeatureImage } from "@/components/feature-image";
import { DiveAreaSites } from "@/components/dive-area-sites";
import { diveSiteAnchors } from "@/lib/anchors";

export const metadata = createMetadata({
  title: "Saba Dive Sites",
  description:
    "Explore Saba's world-famous dive sites by area. From The Pinnacles to Diamond Rock, discover volcanic pinnacles, walls, reefs, and seamounts in the Saba Marine Park.",
  path: "/dive-sites",
});

const DIVE_AREAS = [
  {
    id: diveSiteAnchors.pinnacles,
    title: "The Pinnacles",
    description:
      "The Pinnacles are the dives that helped put Saba on the map. Formed by ancient volcanic activity, these towering seamounts rise dramatically from the deep ocean floor, nourished by nutrient-rich currents that support some of the island's healthiest marine life. Massive barrel sponges, black corals, schools of jacks, turtles, large groupers, and frequent shark encounters make this one of the Caribbean's most iconic advanced diving areas.",
    sites: ["Third Encounter", "The Needle", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
    knownFor: ["Towering volcanic seamounts rising from the deep blue", "Giant barrel sponges, black corals, and vibrant reef life", "Reef sharks, nurse sharks, jacks, turtles, and large groupers", "The famous Eye of the Needle swim-through", "Saba's signature advanced diving experience"],
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imagePosition: "left",
  },
  {
    id: diveSiteAnchors.tentReef,
    title: "Tent Reef",
    description:
      "Just minutes from Fort Bay Harbor, Tent Reef is one of Saba's most diverse dive areas. What begins as a shallow volcanic ledge gradually transforms into dramatic walls, coral-covered buttresses, deep sand channels, and the famous Three Sisters seamounts. Every section offers something different, making Tent Reef a favorite for both daytime exploration and unforgettable night dives.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "The Three Sisters", "Tedran Wall"],
    knownFor: ["Mini walls, canyons, and swim-throughs", "Healthy coral gardens and giant barrel sponges", "The Three Sisters seamounts", "Octopus, turtles, lobster, and colorful reef life", "A different experience on every dive"],
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imagePosition: "right",
  },
  {
    id: diveSiteAnchors.ladderBay,
    title: "Ladder Bay",
    description:
      "Ladder Bay blends Saba's rich history with its volcanic origins. Named for the historic stone staircase that once served as the island's only gateway, this area features lava formations sculpted into a maze of ridges, coral-covered boulders, and warm volcanic sands. From grazing green turtles to tiny nudibranchs, Ladder Bay offers something for photographers, history buffs, and marine life enthusiasts alike.",
    sites: ["Rays n\u2019 Anchors", "Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
    knownFor: ["Historic Ladder Bay and Saba's original island landing", "Volcanic lava fingers and warm underwater hot springs", "Coral-covered boulders and historic anchors", "Green turtles, flying gurnards, nudibranchs, and macro life", "A unique blend of history, geology, and marine life"],
    image: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
    imagePosition: "left",
  },
  {
    id: diveSiteAnchors.wellsBay,
    title: "Wells Bay",
    description:
      "Wells Bay is home to some of Saba's most picturesque dive sites, where Diamond Rock and Man O' War Shoals rise from clear Caribbean waters to create vibrant, coral-covered reefs. These shallower dives offer long bottom times, abundant marine life, and spectacular volcanic scenery both above and below the surface, making them favorites for divers of all experience levels.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
    knownFor: ["Diamond Rock and Man O\u2019 War Shoals", "Healthy coral reefs with excellent fish life", "Green turtles, reef sharks, stingrays, and lobster", "Long bottom times and exceptional visibility", "Dramatic coastal scenery above and below the water"],
    image: "/images/optimized/wells-bay-dive-site-saba.webp",
    imagePosition: "right",
  },
  {
    id: diveSiteAnchors.windwardside,
    title: "Windwardside",
    description:
      "When the Atlantic Ocean is calm, the Windwardside reveals a completely different side of Saba diving. Here you'll find the island's only true coral reefs, built from limestone rather than volcanic rock, alongside brilliant white sand, thriving hard corals, and expansive elkhorn coral formations. The result is a colorful, high-contrast underwater landscape unlike anywhere else around the island.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner"],
    knownFor: ["Saba's only true coral reef systems", "Extensive elkhorn coral formations", "White sand, clear water, and vibrant hard corals", "Exceptional underwater photography opportunities", "A unique contrast to Saba's volcanic dive sites"],
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

