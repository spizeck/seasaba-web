export type PartnerCategory =
  | "Accommodation"
  | "Transportation"
  | "Restaurants & Cafés"
  | "Island Activities"
  | "Conservation & Community";

export interface Partner {
  name: string;
  category: PartnerCategory;
  description: string;
  url: string;
}

export const PARTNERS: Partner[] = [
  // Accommodation
  {
    name: "Juliana's Hotel",
    category: "Accommodation",
    description:
      "A Saba favorite for over 30 years. Boutique rooms, suites, and cottages in the heart of Windwardside with Tropics Café and a pool.",
    url: "https://www.julianashotelsaba.com/",
  },
  {
    name: "Saba Arawak Hotel",
    category: "Accommodation",
    description:
      "A centrally located hotel in Windwardside offering clean, comfortable rooms and easy access to the village.",
    url: "https://sabaarawak.com/",
  },
  {
    name: "El Momo Cottages",
    category: "Accommodation",
    description:
      "Private wooden cottages perched on the slopes of Booby Hill, surrounded by tropical gardens and sweeping Caribbean views.",
    url: "https://elmomocottages.com/",
  },
  {
    name: "Cottage Club",
    category: "Accommodation",
    description:
      "Gingerbread-style private cottages with full kitchens and a pool set along a scenic ridge in Windwardside.",
    url: "https://www.cottage-club.com/",
  },
  {
    name: "Scenery Hotel",
    category: "Accommodation",
    description:
      "One of Saba's newest hotels, offering modern rooms, an infinity-edge pool, and panoramic Caribbean Sea views in Windwardside.",
    url: "https://sceneryhotelsaba.com/",
  },

  // Transportation
  {
    name: "Winair",
    category: "Transportation",
    description:
      "Daily flights connecting St. Maarten (SXM) to Saba's Juancho Airport aboard the iconic Twin Otter — one of the world's most scenic approaches.",
    url: "https://www.winair.sx/",
  },
  {
    name: "Makana Ferry",
    category: "Transportation",
    description:
      "A comfortable ferry service connecting St. Maarten and Saba with panoramic Caribbean Sea views along the way.",
    url: "https://makanaferryservice.com/",
  },
  {
    name: "West Indies Helicopters",
    category: "Transportation",
    description:
      "Luxury helicopter transfers from St. Maarten and St. Barths — the fastest and most flexible way to reach Saba.",
    url: "https://westindieshelicopters.com/",
  },
  {
    name: "Windward Express",
    category: "Transportation",
    description:
      "Private fixed-wing charter flights throughout the northeastern Caribbean. Ideal for small groups and custom itineraries.",
    url: "http://www.windwardexpress.com/",
  },

  // Restaurants & Cafés
  {
    name: "Tropics Café",
    category: "Restaurants & Cafés",
    description:
      "One of Saba's most popular dining spots, located at Juliana's Hotel in Windwardside. Known for fresh food and a welcoming atmosphere.",
    // TODO: Confirm or update URL
    url: "https://www.julianashotelsaba.com/",
  },
  {
    name: "Brigadoon Restaurant",
    category: "Restaurants & Cafés",
    description:
      "A beloved Windwardside restaurant serving fresh local and international cuisine in a relaxed island setting.",
    // TODO: Add direct URL when available
    url: "#",
  },
  {
    name: "Scout's Place",
    category: "Restaurants & Cafés",
    description:
      "A casual Windwardside favorite known for its local dishes, cold drinks, and friendly atmosphere.",
    // TODO: Add URL when available
    url: "#",
  },

  // Island Activities
  {
    name: "Saba Conservation Foundation",
    category: "Conservation & Community",
    description:
      "The organization responsible for managing the Saba Marine Park and Saba's protected land areas. Essential to the island's world-class diving and natural environment.",
    url: "https://www.sabaconsersation.org/",
  },
  {
    name: "Sea & Learn",
    category: "Conservation & Community",
    description:
      "An annual week-long series of free educational programs held each October on Saba. Visiting scientists lead presentations and field activities covering marine biology, coral ecology, humpback whale research, and island conservation. A unique and beloved event that draws researchers and nature lovers from around the world.",
    url: "https://www.seaandlearn.org/",
  },
  {
    name: "STENAPA",
    category: "Conservation & Community",
    description:
      "The St. Eustatius National Parks Foundation supports marine and terrestrial conservation across the Dutch Caribbean.",
    url: "https://www.statiapark.org/",
  },
  {
    name: "Saba Hiking Trails",
    category: "Island Activities",
    description:
      "A network of well-maintained hiking trails covering Mount Scenery, the Crispeen Track, and more. Some of the best hiking in the Caribbean.",
    url: "https://www.sabatourism.com/hiking/",
  },
  {
    name: "Saba Tourism Bureau",
    category: "Island Activities",
    description:
      "The official tourism resource for Saba, covering activities, events, accommodations, and everything you need to plan your visit.",
    url: "https://www.sabatourism.com/",
  },
];

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  "Accommodation",
  "Transportation",
  "Restaurants & Cafés",
  "Island Activities",
  "Conservation & Community",
];
