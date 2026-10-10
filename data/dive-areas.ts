// Relative `.ts` import (not `@/`): this module is also loaded by the Dive
// Notes generator script running under Node's type-stripping, which resolves
// neither path aliases nor extensionless specifiers. Vite/tsc/bundler handle
// the explicit extension via allowImportingTsExtensions.
import { diveSiteAnchors } from "../lib/anchors.ts";

/**
 * The five dive areas presented on /dive-sites, with the site names the dive
 * log uses. Extracted to a data module so both the page and offline tooling
 * (e.g. the Dive Notes draft generator, #245) share one canonical mapping —
 * `DiveSiteArea.id` doubles as the page's section anchor.
 *
 * Keep `sites` in sync with the names used by the Firestore dive log: the
 * generator matches a logged site name to an area for canonical links, and
 * falls back to the plain /dive-sites page when a name isn't listed here.
 */
export interface DiveArea {
  /** Section anchor on /dive-sites (from lib/anchors). */
  id: string;
  title: string;
  description: string;
  /** Site names as recorded in the dive log and shown on the page. */
  sites: readonly string[];
  knownFor: readonly string[];
  image: string;
  imagePosition: "left" | "right";
}

export const DIVE_AREAS: readonly DiveArea[] = [
  {
    id: diveSiteAnchors.pinnacles,
    title: "The Pinnacles",
    description:
      "The Pinnacles are the dives that helped put Saba on the map. Formed by ancient volcanic activity, these towering seamounts rise dramatically from the deep ocean floor, nourished by nutrient-rich currents that support some of the island's healthiest marine life. Massive barrel sponges, black corals, schools of jacks, turtles, large groupers, and frequent shark encounters make this one of the Caribbean's most iconic advanced diving areas.",
    sites: ["Third Encounter", "Twilight Zone", "Outer Limits", "Mt. Michel", "Shark Shoals"],
    knownFor: ["Towering volcanic seamounts rising from the deep blue", "Giant barrel sponges, black corals, and vibrant reef life", "Reef sharks, nurse sharks, jacks, turtles, and large groupers", "The famous Third Encounter pinnacle", "Saba's signature advanced diving experience"],
    image: "/images/optimized/divers-above-pinnacle-saba.webp",
    imagePosition: "left",
  },
  {
    id: diveSiteAnchors.tentReef,
    title: "Tent Reef",
    description:
      "Just minutes from Fort Bay Harbor, Tent Reef is one of Saba's most diverse dive areas. What begins as a shallow volcanic ledge gradually transforms into dramatic walls, coral-covered buttresses, and deep sand channels. Every section offers something different, making Tent Reef a favorite for both daytime exploration and unforgettable night dives.",
    sites: ["Tent Shallow", "Tent Deep", "Tent Reef", "Tent Boulders", "Tent Wall", "Tedran Wall"],
    knownFor: ["Mini walls, canyons, and swim-throughs", "Healthy coral gardens and giant barrel sponges", "The famous Three Sisters seamounts on Tent Wall", "Octopus, turtles, lobster, and colorful reef life", "A different experience on every dive"],
    image: "/images/optimized/green-turtle-tent-reef.webp",
    imagePosition: "right",
  },
  {
    id: diveSiteAnchors.ladderBay,
    title: "Ladder Bay",
    description:
      "Ladder Bay blends Saba's rich history with its volcanic origins. Named for the historic stone staircase that once served as the island's only gateway, this area features lava formations sculpted into a maze of ridges, coral-covered boulders, and warm volcanic sands. From grazing green turtles to tiny nudibranchs, Ladder Bay offers something for photographers, history buffs, and marine life enthusiasts alike.",
    sites: ["Rays n’ Anchors", "Ladder Labyrinth", "Hot Springs", "50/50", "Porites Point", "Customs House", "Babylon"],
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
    knownFor: ["Diamond Rock and Man O’ War Shoals", "Healthy coral reefs with excellent fish life", "Green turtles, reef sharks, stingrays, and lobster", "Long bottom times and exceptional visibility", "Dramatic coastal scenery above and below the water"],
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
];
