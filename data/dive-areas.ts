import { diveSiteAnchors } from "@/lib/anchors";
import { formatImageCaption, IMAGE_ATTRIBUTIONS } from "@/data/image-attribution";

/**
 * Canonical dive-area records for the /dive-sites directory and the
 * individual site pages under /dive-sites/[slug]. The `id` doubles as the
 * on-page section anchor referenced by data/redirects.ts — keep it aligned
 * with lib/anchors.ts.
 */
export const DIVE_AREAS = [
  {
    id: diveSiteAnchors.pinnacles,
    title: "The Pinnacles",
    description:
      "The Pinnacles are the dives that helped put Saba on the map. Formed by ancient volcanic activity, these towering seamounts rise dramatically from the deep ocean floor, nourished by nutrient-rich currents that support some of the island's healthiest marine life. Massive barrel sponges, black corals, schools of jacks, turtles, large groupers, and frequent shark encounters make this one of the Caribbean's most iconic advanced diving areas.",
    sites: ["Third Encounter", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
    knownFor: ["Towering volcanic seamounts rising from the deep blue", "Giant barrel sponges, black corals, and vibrant reef life", "Reef sharks, nurse sharks, jacks, turtles, and large groupers", "The famous Third Encounter pinnacle", "Saba's signature advanced diving experience"],
    image: IMAGE_ATTRIBUTIONS["divers-above-pinnacle-saba.webp"].imageUrl,
    caption: formatImageCaption(IMAGE_ATTRIBUTIONS["divers-above-pinnacle-saba.webp"]),
    imageObjectPosition: "center top",
    imagePosition: "left",
  },
  {
    id: diveSiteAnchors.tentReef,
    title: "Tent Reef",
    description:
      "Just minutes from Fort Bay Harbor, Tent Reef is one of Saba's most diverse dive areas. What begins as a shallow volcanic ledge gradually transforms into dramatic walls, coral-covered buttresses, and deep sand channels. Every section offers something different, making Tent Reef a favorite for both daytime exploration and unforgettable night dives.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "Tedran Wall"],
    knownFor: ["Mini walls, canyons, and swim-throughs", "Healthy coral gardens and giant barrel sponges", "The famous Three Sisters seamounts on Tent Wall", "Octopus, turtles, lobster, and colorful reef life", "A different experience on every dive"],
    image: IMAGE_ATTRIBUTIONS["green-turtle-tent-reef.webp"].imageUrl,
    caption: formatImageCaption(IMAGE_ATTRIBUTIONS["green-turtle-tent-reef.webp"]),
    imagePosition: "right",
  },
  {
    id: diveSiteAnchors.ladderBay,
    title: "Ladder Bay",
    description:
      "Ladder Bay blends Saba's rich history with its volcanic origins. Named for the historic stone staircase that once served as the island's only gateway, this area features lava formations sculpted into a maze of ridges, coral-covered boulders, and warm volcanic sands. From grazing green turtles to tiny nudibranchs, Ladder Bay offers something for photographers, history buffs, and marine life enthusiasts alike.",
    sites: ["Rays n\u2019 Anchors", "Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
    knownFor: ["Historic Ladder Bay and Saba's original island landing", "Volcanic lava fingers and warm underwater hot springs", "Coral-covered boulders and historic anchors", "Green turtles, flying gurnards, nudibranchs, and macro life", "A unique blend of history, geology, and marine life"],
    image: IMAGE_ATTRIBUTIONS["nurse-shark-ladder-bay-saba.webp"].imageUrl,
    caption: formatImageCaption(IMAGE_ATTRIBUTIONS["nurse-shark-ladder-bay-saba.webp"]),
    imagePosition: "left",
  },
  {
    id: diveSiteAnchors.wellsBay,
    title: "Wells Bay",
    description:
      "Wells Bay is home to some of Saba's most picturesque dive sites, where Diamond Rock and Man O' War Shoals rise from clear Caribbean waters to create vibrant, coral-covered reefs. These shallower dives offer long bottom times, abundant marine life, and spectacular volcanic scenery both above and below the surface, making them favorites for divers of all experience levels.",
    sites: ["Otto's Limits", "Torrens Point", "Diamond Rock", "Man O'War Shoals"],
    knownFor: ["Diamond Rock and Man O\u2019 War Shoals", "Healthy coral reefs with excellent fish life", "Green turtles, reef sharks, stingrays, and lobster", "Long bottom times and exceptional visibility", "Dramatic coastal scenery above and below the water"],
    image: IMAGE_ATTRIBUTIONS["wells-bay-dive-site-saba.webp"].imageUrl,
    caption: formatImageCaption(IMAGE_ATTRIBUTIONS["wells-bay-dive-site-saba.webp"]),
    imagePosition: "right",
  },
  {
    id: diveSiteAnchors.windwardside,
    title: "Windwardside",
    description:
      "When the Atlantic Ocean is calm, the Windwardside reveals a completely different side of Saba diving. Here you'll find the island's only true coral reefs, built from limestone rather than volcanic rock, alongside brilliant white sand, thriving hard corals, and expansive elkhorn coral formations. The result is a colorful, high-contrast underwater landscape unlike anywhere else around the island.",
    sites: ["Green Island", "Big Rock Market", "Core Gut", "Cove Bay", "Abrams Hole", "Hole in the Corner", "Greer Gut", "Davids Dropoff"],
    knownFor: ["Saba's only true coral reef systems", "Extensive elkhorn coral formations", "White sand, clear water, and vibrant hard corals", "Exceptional underwater photography opportunities", "A unique contrast to Saba's volcanic dive sites"],
    image: IMAGE_ATTRIBUTIONS["windwardside-dive-site-saba.webp"].imageUrl,
    caption: formatImageCaption(IMAGE_ATTRIBUTIONS["windwardside-dive-site-saba.webp"]),
    imagePosition: "left",
  },
] as const;

export type DiveArea = (typeof DIVE_AREAS)[number];

/** Look up a dive-area record by its display title (as used in DIVE_SITES). */
export function diveAreaByTitle(title: string): DiveArea | undefined {
  return DIVE_AREAS.find((a) => a.title === title);
}
