import { createMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Dive Sites",
  description:
    "Explore Saba's world-class dive sites — dramatic pinnacles, seamounts, walls, and reef gardens protected by the Saba Marine Park.",
  path: "/dive-sites",
});

export default function DiveSitesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Dive Sites
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Saba&apos;s underwater topography is unlike anything else in the Caribbean.
        The island rises steeply from the ocean floor, and that drama continues
        beneath the surface — sheer walls, volcanic pinnacles, and open-ocean
        seamounts that attract sharks, rays, and large pelagic species year-round.
      </p>

      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        The Saba Marine Park — one of the oldest protected marine areas in the
        Caribbean — encompasses over 30 dive sites. No anchoring, no cruise ships,
        no overuse. The result is some of the healthiest reef systems in the region.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        What makes Saba diving exceptional?
      </h2>
      <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground list-none pl-0">
        <li>
          <strong className="text-foreground">Dramatic pinnacles and seamounts</strong> — structures rising hundreds of feet from the ocean floor, encrusted with black coral, sponges, and surrounded by open-water life.
        </li>
        <li>
          <strong className="text-foreground">Sheer walls</strong> — vertical drop-offs along the island&apos;s flanks, home to large grouper, turtles, and abundant reef fish.
        </li>
        <li>
          <strong className="text-foreground">Marine park protection</strong> — strict regulations mean exceptional visibility, healthy corals, and undisturbed marine life.
        </li>
        <li>
          <strong className="text-foreground">No crowds</strong> — no cruise ship dive operations, no large group dive tours. Sea Saba runs small groups only.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Featured Dive Sites
      </h2>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Individual dive site pages with detailed profiles — depth, topography,
        marine life, and skill level — are coming soon.
      </p>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Notable sites include Third Encounter, Eye of the Needle, Twilight Zone,
        Shark Shoals, Ladder Labyrinth, and Man O&apos; War Shoals.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          href="/diving"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          View Diving Options →
        </Link>
        <Link
          href="/book"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Book Diving →
        </Link>
      </div>
    </>
  );
}
