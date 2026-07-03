export type PartnerCategory =
  | "local"
  | "dive"
  | "training"
  | "equipment"
  | "travel"
  | "conservation";

export type PartnerSubcategory =
  | "Hotels"
  | "Restaurants"
  | "Transportation"
  | "Things to Do";

export interface Partner {
  name: string;
  category: PartnerCategory;
  subcategory?: PartnerSubcategory;
  description: string;
  website: string;
  logo?: string;
  image?: string;
  featured?: boolean;
}

export const PARTNERS: Partner[] = [
  // Local Partners — Hotels
  {
    name: "Juliana's Hotel",
    category: "local",
    subcategory: "Hotels",
    description:
      "A Saba favorite for over 30 years. Boutique rooms, suites, and cottages in the heart of Windwardside with Tropics Café and a pool.",
    website: "https://www.julianashotelsaba.com/",
    image: "/images/optimized/julianas-hotel.webp",
  },
  {
    name: "Saba Arawak Hotel",
    category: "local",
    subcategory: "Hotels",
    description:
      "A centrally located hotel in Windwardside offering clean, comfortable rooms and easy access to the village.",
    website: "https://sabaarawak.com/",
    image: "/images/optimized/arawak-hotel.webp",
  },
  {
    name: "El Momo Cottages",
    category: "local",
    subcategory: "Hotels",
    description:
      "Private wooden cottages perched on the slopes of Booby Hill, surrounded by tropical gardens and sweeping Caribbean views.",
    website: "https://elmomocottages.com/",
    image: "/images/optimized/el-momo-cottages.webp",
  },
  {
    name: "Cottage Club",
    category: "local",
    subcategory: "Hotels",
    description:
      "Gingerbread-style private cottages with full kitchens and a pool set along a scenic ridge in Windwardside.",
    website: "https://www.cottage-club.com/",
    image: "/images/optimized/cottage-club.webp",
  },
  {
    name: "Scenery Hotel",
    category: "local",
    subcategory: "Hotels",
    description:
      "One of Saba's newest hotels, offering modern rooms, an infinity-edge pool, and panoramic Caribbean Sea views in Windwardside.",
    website: "https://sceneryhotelsaba.com/",
    image: "/images/optimized/scenery-hotel.webp",
  },

  // Local Partners — Restaurants
  {
    name: "Tropics Café",
    category: "local",
    subcategory: "Restaurants",
    description:
      "One of Saba's most popular dining spots, located at Juliana's Hotel in Windwardside. Known for fresh food and a welcoming atmosphere.",
    website: "https://www.julianashotelsaba.com/",
  },
  {
    name: "Brigadoon Restaurant",
    category: "local",
    subcategory: "Restaurants",
    description:
      "A beloved Windwardside restaurant serving fresh local and international cuisine in a relaxed island setting.",
    website: "#",
  },
  {
    name: "Scout's Place",
    category: "local",
    subcategory: "Restaurants",
    description:
      "A casual Windwardside favorite known for its local dishes, cold drinks, and friendly atmosphere.",
    website: "#",
  },

  // Local Partners — Transportation
  {
    name: "Winair",
    category: "local",
    subcategory: "Transportation",
    description:
      "Daily flights connecting St. Maarten (SXM) to Saba's Juancho Airport aboard the iconic Twin Otter.",
    website: "https://www.winair.sx/",
  },
  {
    name: "Makana Ferry",
    category: "local",
    subcategory: "Transportation",
    description:
      "A comfortable ferry service connecting St. Maarten and Saba with panoramic Caribbean Sea views along the way.",
    website: "https://makanaferryservice.com/",
  },
  {
    name: "West Indies Helicopters",
    category: "local",
    subcategory: "Transportation",
    description:
      "Luxury helicopter transfers from St. Maarten and St. Barths — the fastest and most flexible way to reach Saba.",
    website: "https://westindieshelicopters.com/",
  },
  {
    name: "SXM Airways",
    category: "local",
    subcategory: "Transportation",
    description:
      "Private charter flights throughout the northeastern Caribbean, ideal for custom itineraries and small groups.",
    website: "https://fly-sxmairways.com/",
  },

  // Local Partners — Things to Do
  {
    name: "Saba Hiking Trails",
    category: "local",
    subcategory: "Things to Do",
    description:
      "A network of well-maintained hiking trails covering Mount Scenery, the Crispeen Track, and more.",
    website: "https://www.sabatourism.com/hiking/",
    image: "/images/optimized/saba-hiking-signs.webp",
  },
  {
    name: "Saba Tourism Bureau",
    category: "local",
    subcategory: "Things to Do",
    description:
      "The official tourism resource for Saba, covering activities, events, accommodations, and everything you need to plan your visit.",
    website: "https://www.sabatourism.com/",
  },

  // Caribbean Dive Partners
  {
    name: "Statia Divers",
    category: "dive",
    description:
      "The trusted dive operator on St. Eustatius, offering easy connections and complementary diving to a Saba itinerary.",
    website: "https://www.statiadivers.com/",
  },
  {
    name: "Scuba Shop (St. Maarten)",
    category: "dive",
    description:
      "A full-service St. Maarten dive shop helping divers with gear, training, and logistics before heading to Saba.",
    website: "https://www.scubashopsxm.com/",
  },
  {
    name: "Dive St. Maarten",
    category: "dive",
    description:
      "Local dive operator on St. Maarten offering daily diving and support for travelers continuing to Saba.",
    website: "https://www.divestmaarten.com/",
  },

  // Training Agencies
  {
    name: "SDI",
    category: "training",
    description: "Scuba Diving International — the recreational training agency behind our open-water and advanced programs.",
    website: "https://www.tdisdi.com/",
  },
  {
    name: "TDI",
    category: "training",
    description: "Technical Diving International — the technical and overhead-environment training agency we teach under.",
    website: "https://www.tdisdi.com/",
  },
  {
    name: "ERDI",
    category: "training",
    description: "Emergency Response Diving International — public-safety diving certifications for professional responders.",
    website: "https://www.tdisdi.com/",
  },

  // Equipment Partners
  {
    name: "Scubapro",
    category: "equipment",
    description: "Professional-grade regulators, BCDs, fins, and masks trusted by recreational and technical divers worldwide.",
    website: "https://www.scubapro.com/",
  },
  {
    name: "Kraken",
    category: "equipment",
    description: "Innovative underwater housings and camera gear built for demanding dive environments.",
    website: "https://krakenaquatics.com/",
  },
  {
    name: "Garmin",
    category: "equipment",
    description: "Advanced dive computers and GPS devices used for surface intervals, navigation, and expedition planning.",
    website: "https://www.garmin.com/",
  },
  {
    name: "Suunto",
    category: "equipment",
    description: "Reliable dive computers and instruments known for clear displays, durability, and intuitive operation.",
    website: "https://www.suunto.com/",
  },

  // Travel & Tour Operators
  {
    name: "Travel Agencies & Wholesalers",
    category: "travel",
    description:
      "Sea Saba works with travel professionals, wholesalers, and group organizers to make planning dive vacations easy. Contact us to coordinate accommodations, transportation, and custom itineraries.",
    website: "/contact",
  },
  {
    name: "Group Organizers",
    category: "travel",
    description:
      "From dive clubs to family trips, we help organizers build seamless Saba experiences with lodging, boats, and conservation experiences.",
    website: "/contact",
  },

  // Conservation & Community
  {
    name: "Saba Conservation Foundation",
    category: "conservation",
    description:
      "The organization responsible for managing the Saba Marine Park and Saba's protected land areas. Essential to the island's world-class diving and natural environment.",
    website: "https://www.sabaconservation.org/",
    image: "/images/optimized/saba-volcanic-coastline.webp",
  },
  {
    name: "Sea & Learn",
    category: "conservation",
    description:
      "An annual week-long series of free educational programs held each October on Saba. Visiting scientists lead presentations and field activities covering marine biology, coral ecology, and conservation.",
    website: "https://www.seaandlearn.org/",
    image: "/images/optimized/green-turtle-seagrass-divers.webp",
  },
  {
    name: "STENAPA",
    category: "conservation",
    description:
      "The St. Eustatius National Parks Foundation supports marine and terrestrial conservation across the Dutch Caribbean.",
    website: "https://www.statiapark.org/",
    image: "/images/optimized/cove-bay-saba.webp",
  },
];

export const LOCAL_PARTNER_SUBCATEGORIES: PartnerSubcategory[] = [
  "Hotels",
  "Restaurants",
  "Transportation",
  "Things to Do",
];
