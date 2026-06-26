/**
 * Dive site video configuration
 *
 * Add YouTube video IDs here as they become available.
 * Video naming convention on channel: "Saba Dive Sites - No.XX Site Name - Dutch Caribbean"
 * Channel: https://youtube.com/@sea_saba
 *
 * To find an ID: open the video on YouTube, copy the ?v= value from the URL.
 */

export type DiveSite = {
  name: string;
  area: string;
  description: string;
  videoId?: string; // undefined = "coming soon" state
};

export const DIVE_SITES: DiveSite[] = [
  // ── The Pinnacles ──────────────────────────────────────────────────────────
  {
    name: "Third Encounter",
    area: "The Pinnacles",
    description:
      "One of Saba's most celebrated dives — a deep volcanic seamount rising from the ocean floor with dramatic topography, large barrel sponges, and frequent pelagic visitors including sharks and schooling jacks.",
    videoId: "GcIUiaNwoCE",
  },
  {
    name: "The Needle",
    area: "The Pinnacles",
    description:
      "A slender volcanic spire that rises from depth, encrusted with black coral and sponges. Open-ocean exposure brings blue-water visibility and the chance of large pelagic encounters.",
    videoId: "GcIUiaNwoCE",
  },
  {
    name: "Twilight Zone",
    area: "The Pinnacles",
    description:
      "A deep plateau site at the edge of the open ocean, named for the eerie blue twilight that filters down at depth. Best suited for experienced divers comfortable with open-water conditions.",
    videoId: "-OBgucAKms0",
  },
  {
    name: "Outer Limits",
    area: "The Pinnacles",
    description:
      "Saba's most remote dive — a deep offshore seamount for advanced and technical divers. Exceptional sponge life and frequent shark sightings reward the journey.",
    videoId: "6UOwt2FjgoE",
  },
  {
    name: "Mt. Michel",
    area: "The Pinnacles",
    description:
      "A broad volcanic plateau with gorgonian fans and large barrel sponges. Multiple summit features create a dive full of variety within a single site.",
    videoId: undefined,
  },
  {
    name: "Shark Shoals",
    area: "The Pinnacles",
    description:
      "Consistently one of Saba's best sites for shark activity. Nurse sharks rest on sandy ledges while reef sharks and the occasional Caribbean reef shark patrol the blue water above.",
    videoId: "VgVEBsEDYP8",
  },

  // ── Tent Reef ──────────────────────────────────────────────────────────────
  {
    name: "Tent Shallow",
    area: "Tent Reef",
    description:
      "The shallower profile of the Tent Reef area — healthy coral gardens, turtles, and abundant reef fish. Excellent for second dives and underwater photography.",
    videoId: undefined,
  },
  {
    name: "Tent Deep",
    area: "Tent Reef",
    description:
      "Drops away from the shallow reef into dramatic wall diving. Large sponges, black coral, and occasional shark sightings reward divers who venture deeper.",
    videoId: "h29mG2ZT6cU",
  },
  {
    name: "Tent Reef",
    area: "Tent Reef",
    description:
      "The signature site of the area — a diverse reef with healthy coral, swim-throughs, turtles, and lobsters. One of the most frequently dived and consistently rewarding sites in the Marine Park.",
    videoId: "q2mf_ypzPYk",
  },
  {
    name: "Tent Boulders",
    area: "Tent Reef",
    description:
      "Massive volcanic boulders covered in coral and sponge life. The gaps and channels between formations create natural swim-throughs and sheltered habitats for reef fish.",
    videoId: undefined,
  },
  {
    name: "Tent Wall",
    area: "Tent Reef",
    description:
      "A dramatic vertical wall dropping into the blue. Gorgonian fans, large sponges, and open-water views make this one of Tent Reef's most visually striking sites.",
    videoId: "TxK4Hhw-7Ts",
  },
  {
    name: "The Three Sisters",
    area: "Tent Reef",
    description:
      "Three seamount pinnacles rising off the deep wall — covered in black coral, tube sponges, and surrounded by schooling fish. A memorable advanced dive off the Tent Reef wall.",
    videoId: undefined,
  },
  {
    name: "Tedran Wall",
    area: "Tent Reef",
    description:
      "A vertical wall dive with rich sponge encrustation and a wide variety of reef life. Good visibility and varied topography across a broad depth range.",
    videoId: "3t5xmIr-9HE",
  },

  // ── Ladder Bay ─────────────────────────────────────────────────────────────
  {
    name: "Rays n\u2019 Anchors",
    area: "Ladder Bay",
    description:
      "A classic Ladder Bay site named for the rays that glide over sandy patches between coral heads, and the historic anchors scattered across the bottom. A relaxed dive with reliable marine life encounters.",
    videoId: undefined,
  },
  {
    name: "Ladder Labyrinth",
    area: "Ladder Bay",
    description:
      "A maze of lava fingers and black sand chutes running between the shore and the reef. The swim-throughs, tunnels, and channels make every dive feel like an exploration.",
    videoId: "ratfiHSFi6M",
  },
  {
    name: "Hot Springs",
    area: "Ladder Bay",
    description:
      "Volcanic vents bubble through mustard-colored sand at depth, warming the water noticeably as you approach. A truly unique geological experience found nowhere else in the Caribbean.",
    videoId: "P_80oh1COI0",
  },
  {
    name: "50/50",
    area: "Ladder Bay",
    description:
      "A versatile mid-depth site split between boulder reef and sand. Good habitat for macro life, nudibranchs, and critters tucked into the crevices of coral-covered rocks.",
    videoId: undefined,
  },
  {
    name: "Porites Point",
    area: "Ladder Bay",
    description:
      "Named for the large star coral heads that dominate the site. Healthy coral formations, schooling fish, and a relaxed depth profile make this an excellent dive for all levels.",
    videoId: "ep7lYPDRHfI",
  },
  {
    name: "Customs House",
    area: "Ladder Bay",
    description:
      "Named for Saba's historic customs house visible on the clifftop above. Below the surface, giant coral-covered boulders and historic anchors reward careful exploration.",
    videoId: "__ZxcZOiYEE",
  },
  {
    name: "Babylon",
    area: "Ladder Bay",
    description:
      "A rich reef site with diverse coral formations, seagrass beds, and excellent macro life. Turtles are commonly encountered, and flying gurnards make regular appearances.",
    videoId: "Rnf1UY9dB74",
  },

  // ── Wells Bay ──────────────────────────────────────────────────────────────
  {
    name: "Otto's Limits",
    area: "Wells Bay",
    description:
      "A leeward site with healthy coral pinnacles and a relaxed reef profile. Named after a long-standing Sea Saba guide, it's a reliable and rewarding dive when northwest conditions allow.",
    videoId: undefined,
  },
  {
    name: "Torrens Point",
    area: "Wells Bay",
    description:
      "A scenic point dive along Saba's northwest coast. Healthy reef, turtles, and lobsters in a site that benefits from consistent water clarity and leeward protection.",
    videoId: undefined,
  },
  {
    name: "Diamond Rock",
    area: "Wells Bay",
    description:
      "A small volcanic rock rising from the sea with an underwater profile to match. Rays, turtles, and reef sharks are common, and the topography is dramatic from every angle.",
    videoId: "y0CcHSh-_Cs",
  },
  {
    name: "Man O'War Shoals",
    area: "Wells Bay",
    description:
      "An offshore shoal with exceptional reef health and blue-water visibility. Rays, turtles, and reef sharks patrol the area regularly, making every dive feel remote and wild.",
    videoId: "jdJqrdG-BlA",
  },

  // ── Windwardside ───────────────────────────────────────────────────────────
  {
    name: "Green Island",
    area: "Windwardside",
    description:
      "A small offshore islet with diverse reef systems on all sides. Healthy elkhorn coral, schooling fish, and excellent conditions for underwater photography.",
    videoId: "WKK4hlThKPs",
  },
  {
    name: "Big Rock Market",
    area: "Windwardside",
    description:
      "Named for the massive volcanic boulders that dominate the underwater landscape. White sand channels between the boulders are home to turtles, rays, and macro life.",
    videoId: undefined,
  },
  {
    name: "Core Gut",
    area: "Windwardside",
    description:
      "A sheltered gut site with healthy biological reef systems and calm conditions. Extensive coral formations and diverse reef fish make this an excellent photography site.",
    videoId: "yyBZJqI-9Lg",
  },
  {
    name: "Cove Bay",
    area: "Windwardside",
    description:
      "A protected bay with gentle conditions and rich reef life. Turtles, reef fish, and macro critters thrive in the healthy coral gardens that line the bay walls.",
    videoId: undefined,
  },
  {
    name: "Abrams Hole",
    area: "Windwardside",
    description:
      "A distinctive site featuring a natural hole in the reef structure. Unusual topography, good coral health, and the chance of encounter with larger reef species.",
    videoId: undefined,
  },
  {
    name: "Hole in the Corner",
    area: "Windwardside",
    description:
      "A compact site with interesting geological features and diverse marine life in a small area. Good for exploratory dives and macro photography in protected conditions.",
    videoId: "5ol78VSLpQw",
  },
  {
    name: "Greer Gut",
    area: "Windwardside",
    description:
      "A natural underwater gutter running along the volcanic coastline. Excellent habitat for reef fish, invertebrates, and the kind of close-up marine life encounters that reward patient divers.",
    videoId: "mHqSk9KRdQo",
  },
  {
    name: "Davids Dropoff",
    area: "Windwardside",
    description:
      "A dramatic drop-off site along the Windwardside coast with impressive vertical topography, sponge life, and open-water views. A rewarding dive when conditions allow access to this side of the island.",
    videoId: "0P1ZiO6HJiY",
  },
];

/** Quick lookup: site name → DiveSite */
export const DIVE_SITE_MAP = Object.fromEntries(
  DIVE_SITES.map((s) => [s.name, s])
) as Record<string, DiveSite>;
