import { createMetadata } from "@/lib/metadata";
import { BookingCTA } from "@/components/booking-cta";

export const metadata = createMetadata({
  title: "Diving",
  description:
    "Explore Saba's world-class dive sites — pristine pinnacles, dramatic walls, and vibrant reefs in the Dutch Caribbean's protected marine park.",
  path: "/diving",
});

const DIVE_SITES = [
  {
    name: "Third Encounter",
    depth: "30m / 100ft",
    description:
      "Saba's most famous pinnacle. A submerged seamount rising from the deep, covered in sponges and surrounded by pelagic life.",
  },
  {
    name: "Tent Reef Wall",
    depth: "15–40m / 50–130ft",
    description:
      "A dramatic wall dive starting in the shallows and dropping into the blue. Excellent for all experience levels.",
  },
  {
    name: "Diamond Rock",
    depth: "5–25m / 15–80ft",
    description:
      "A volcanic rock formation with swim-throughs, nurse sharks, and vibrant coral gardens. Great for photography.",
  },
  {
    name: "Ladder Labyrinth",
    depth: "10–25m / 30–80ft",
    description:
      "A complex reef system with overhangs, tunnels, and an incredible diversity of marine life in a compact area.",
  },
] as const;

export default function DivingPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dive Sites
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Saba&apos;s marine park protects over 30 dive sites around the island.
        From shallow reef dives to deep pinnacles, there&apos;s something for
        every level of experience. Here are some of our favorites.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {DIVE_SITES.map((site) => (
          <div
            key={site.name}
            className="rounded-lg border border-border/60 bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {site.name}
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">
              {site.depth}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {site.description}
            </p>
          </div>
        ))}
      </div>

      <BookingCTA
        heading="Ready to explore?"
        description="Book your dives and check current availability."
        className="mt-12"
      />
    </>
  );
}
