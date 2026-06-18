import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DiveSitesMap } from "@/components/dive-sites-map";

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
      "Saba's most iconic dive sites. These submerged volcanic formations rise from the deep, creating dramatic underwater pinnacles encrusted with sponges and black coral.",
    sites: ["Third Encounter", "Eye of the Needle", "The Pinnacles", "Tent Reef Pinnacle"],
    depth: "18–40m / 60–130ft",
    marineLife: ["Pelagic sharks", "Eagle rays", "Schooling jacks", "Barracuda", "Turtles"],
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imagePosition: "left",
  },
  {
    id: "tent-reef",
    title: "Tent Reef",
    description:
      "A versatile area offering both the famous Tent Reef Pinnacle and the dramatic Tent Reef Wall. Perfect for divers of all levels with exceptional visibility.",
    sites: ["Tent Reef Pinnacle", "Tent Reef Wall", "Tent Reef Ledge"],
    depth: "10–40m / 30–130ft",
    marineLife: ["Green turtles", "Caribbean reef sharks", "Colorful sponges", "Schooling fish"],
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imagePosition: "right",
  },
  {
    id: "ladder-bay",
    title: "Ladder Bay",
    description:
      "Named for the historic 800-step ladder carved into the cliffside, this area features dramatic walls, intricate reef systems, and consistently excellent visibility.",
    sites: ["Ladder Labyrinth", "Ladder Bay Wall", "The Hole", "Cove Bay"],
    depth: "10–35m / 30–115ft",
    marineLife: ["Spiny lobsters", "Spotted eagle rays", "Octopus", "Dense coral formations"],
    image: "/images/optimized/spiny-lobster-ladder-bay.webp",
    imagePosition: "left",
  },
  {
    id: "wells-bay",
    title: "Wells Bay",
    description:
      "The northwest corner of Saba offers some of the island's most pristine and rarely visited sites. Expect exceptional visibility and untouched coral.",
    sites: ["Wells Bay", "Man O' War Shoals", "Twilight Zone"],
    depth: "15–40m / 50–130ft",
    marineLife: ["Reef sharks", "Schooling barracuda", "Giant sponges", "Macro life"],
    image: "/images/optimized/saba-volcanic-coastline.webp",
    imagePosition: "right",
  },
  {
    id: "windwardside",
    title: "Windwardside",
    description:
      "The protected eastern side of the island offers calm, clear waters perfect for divers of all experience levels. Excellent for photographers and marine life enthusiasts.",
    sites: ["Green Island", "Flat Point", "Sandy Bay"],
    depth: "10–30m / 30–100ft",
    marineLife: ["Green turtles", "Stingrays", "Seahorses", "Colorful reef fish"],
    image: "/images/optimized/green-turtle-with-diver-saba.webp",
    imagePosition: "left",
  },
  {
    id: "diamond-rock",
    title: "Diamond Rock",
    description:
      "A dramatic offshore pinnacle rising from 50 meters to within 5 meters of the surface. One of Saba's most spectacular and challenging sites.",
    sites: ["Diamond Rock", "Shark Shoals"],
    depth: "5–50m / 15–165ft",
    marineLife: ["Hammerhead sharks", "Silky sharks", "Eagle rays", "Pelagic predators"],
    image: "/images/optimized/reef-shark-pinnacle.webp",
    imagePosition: "right",
  },
] as const;

export default function DiveSitesPage() {
  return (
    <>
      {/* Page Hero */}
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Explore Saba&apos;s Dive Sites
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        The Saba Marine Park protects over 30 dive sites around this volcanic island. 
        Click on the map to explore each area, or scroll to discover the world-famous 
        pinnacles, walls, reefs, and seamounts that make Saba legendary.
      </p>

      {/* Interactive Map */}
      <section className="mt-8 rounded-xl border border-border/40 bg-muted/20 p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Interactive Site Map</h2>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
          <DiveSitesMap />
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Saba&apos;s dive sites cluster around distinct coastal areas, each offering 
              unique topography and marine life. Click a point on the map to jump to that section.
            </p>
            <div className="flex flex-wrap gap-2">
              {DIVE_AREAS.map((area) => (
                <a
                  key={area.id}
                  href={`#${area.id}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  {area.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dive Area Sections */}
      <div className="mt-12 space-y-16">
        {DIVE_AREAS.map((area, index) => (
          <section key={area.id} id={area.id} className="scroll-mt-20">
            <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${area.imagePosition === "right" ? "lg:[&>*:first-child]:order-2" : ""}`}>
              {/* Image */}
              <div className="overflow-hidden rounded-lg">
                <img
                  src={area.image}
                  alt={`Diving at ${area.title}`}
                  className="h-64 w-full object-cover object-center sm:h-80 lg:h-96"
                />
              </div>
              
              {/* Content */}
              <div className={area.imagePosition === "right" ? "lg:order-1" : ""}>
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
                
                {/* Link */}
                <Link
                  href={`/dive-sites/${area.id}`}
                  className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  Explore {area.title} sites →
                </Link>
              </div>
            </div>
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

