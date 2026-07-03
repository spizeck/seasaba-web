export type PartnerCategory =
  | "local"
  | "dive"
  | "training"
  | "equipment"
  | "travel"
  | "conservation";

export type PartnerSubcategory =
  | "Restaurants"
  | "Transportation"
  | "Things to Do";

export type AccommodationCategory = "hotel" | "cottage" | "villa";

export interface Partner {
  name: string;
  category: PartnerCategory;
  subcategory?: PartnerSubcategory;
  description: string;
  website: string;
  logo?: string;
  image?: string;
  featured?: boolean;
  phone?: string;
  email?: string;
  managedBy?: {
    name: string;
    website: string;
  };
}

export interface Accommodation {
  name: string;
  category: AccommodationCategory;
  village: string;
  description: string;
  website: string;
  features: string[];
  image?: string;
}

export const ACCOMMODATIONS: Accommodation[] = [
  // Hotels
  {
    name: "Juliana's Hotel",
    category: "hotel",
    village: "Windwardside",
    description:
      "A Saba favorite for over 30 years, with boutique rooms, suites, cottages, Tropics Café, and a pool in Windwardside.",
    website: "https://www.julianashotelsaba.com/",
    image: "/images/optimized/julianas-hotel.webp",
    features: ["Boutique", "Pool", "Restaurant", "Walk to Village"],
  },
  {
    name: "Saba Arawak Hotel",
    category: "hotel",
    village: "Windwardside",
    description:
      "A centrally located hotel in Windwardside offering clean, comfortable rooms and easy access to the village.",
    website: "https://sabaarawak.com/",
    image: "/images/optimized/arawak-hotel.webp",
    features: ["Central", "Comfortable Rooms", "Walk to Village"],
  },
  {
    name: "Scenery Hotel",
    category: "hotel",
    village: "Windwardside",
    description:
      "One of Saba's newest hotels with modern rooms, a pool, and panoramic Caribbean Sea views in Windwardside.",
    website: "https://sceneryhotelsaba.com/",
    image: "/images/optimized/scenery-hotel.webp",
    features: ["Modern", "Pool", "Ocean View", "Walk to Village"],
  },

  // Cottages & Villas
  {
    name: "Althea Cottage",
    category: "cottage",
    village: "Windwardside",
    description:
      "A restored 150-year-old Saban cottage with sweeping Caribbean and mountain views, flexible layouts, and a full kitchen.",
    website: "https://www.airbnb.com/rooms/32723308/",
    features: ["Historic", "Ocean View", "Full Kitchen", "Sleeps 5"],
  },
  {
    name: "Compass Cottage",
    category: "cottage",
    village: "Booby Hill",
    description:
      "A stylish two-bedroom cottage with tropical gardens, a private pool, and expansive sea views near Windwardside.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Pool", "Ocean View", "Two Bedrooms", "Garden"],
  },
  {
    name: "Cottage Club",
    category: "cottage",
    village: "Windwardside",
    description:
      "Gingerbread-style private cottages with full kitchens, a shared pool, and a scenic ridge location in Windwardside.",
    website: "https://www.cottage-club.com/",
    image: "/images/optimized/cottage-club.webp",
    features: ["Gingerbread Style", "Full Kitchen", "Pool", "Walk to Village"],
  },
  {
    name: "El Momo Cottages",
    category: "cottage",
    village: "Booby Hill",
    description:
      "Private wooden cottages perched on Booby Hill slopes, surrounded by tropical gardens and sweeping Caribbean views.",
    website: "https://elmomocottages.com/",
    image: "/images/optimized/el-momo-cottages.webp",
    features: ["Ocean View", "Tropical Gardens", "Private Cottages", "Booby Hill"],
  },
  {
    name: "Flamboyant Cottage",
    category: "cottage",
    village: "Booby Hill",
    description:
      "A classic gingerbread-style Saban cottage with two bedrooms, a private pool, gazebo, and views toward Statia and St. Kitts.",
    website: "https://www.airbnb.com/rooms/32723308/",
    features: ["Gingerbread Style", "Pool", "Gazebo", "Ocean View"],
  },
  {
    name: "Hidden Garden Cottage",
    category: "cottage",
    village: "St. John's",
    description:
      "One of Saba's most historic cottages, dating to 1890, with original stained glass, antique furnishings, and peaceful gardens.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Historic", "Antique Interiors", "Garden", "Walk to Village"],
  },
  {
    name: "House on the Path",
    category: "cottage",
    village: "Windwardside",
    description:
      "A secluded restored Saban cottage along a footpath above Windwardside, ideal for couples seeking a private eco-friendly escape.",
    website: "https://www.houseonthepath.com/",
    features: ["Eco-Friendly", "Secluded", "Historic", "Two Bedrooms"],
  },
  {
    name: "Hibiscus Cottage",
    category: "cottage",
    village: "Windwardside",
    description:
      "A charming classic Saban cottage with lush tropical gardens, mountain views, two ensuite bedrooms, and easy access to trails.",
    website: "https://www.sabahibiscus.com/",
    features: ["Tropical Gardens", "Mountain View", "Two Bedrooms", "Walk to Trails"],
  },
  {
    name: "Hummingbird Villa",
    category: "villa",
    village: "English Quarter",
    description:
      "An award-winning luxury villa with tropical gardens, a freeform pool, guest cottage, gourmet kitchen, and stunning Caribbean views.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Luxury", "Pool", "Guest Cottage", "Gourmet Kitchen"],
  },
  {
    name: "Iris House",
    category: "cottage",
    village: "Windwardside",
    description:
      "A finely preserved traditional Saban cottage with two bedrooms, landscaped gardens, a private pool, gazebo, and spectacular Caribbean views.",
    website: "https://www.airbnb.com/rooms/32723308/",
    features: ["Traditional", "Pool", "Gazebo", "Ocean View"],
  },
  {
    name: "Novel Cottage",
    category: "cottage",
    village: "St. John's",
    description:
      "A renovated century-old Saban cottage with panoramic views toward Statia, St. Kitts, and Nevis, perfect for couples.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Historic", "Ocean View", "One Bedroom", "Renovated"],
  },
  {
    name: "Peter Hytte by Althea",
    category: "cottage",
    village: "Windwardside",
    description:
      "A cozy modern stone cottage with views of Mt. Scenery, Windwardside, and the sea, with flexible one or two bedrooms.",
    website: "https://www.airbnb.com/rooms/37491370/",
    features: ["Modern Stone", "Mountain View", "Sea View", "Flexible Layout"],
  },
  {
    name: "Poets and Painters Cottage",
    category: "cottage",
    village: "Windwardside",
    description:
      "A luxurious heritage cottage with antique furnishings, two bedrooms, modern amenities, and walking distance to Windwardside restaurants.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Heritage", "Antique Furnishings", "Two Bedrooms", "Walk to Village"],
  },
  {
    name: "Spyglass Villa",
    category: "villa",
    village: "Booby Hill",
    description:
      "A private Booby Hill villa with expansive verandas, panoramic Caribbean views, two bedrooms, and outdoor entertaining spaces.",
    website: "https://www.airbnb.com/rooms/2367234",
    features: ["Private Villa", "Panoramic View", "Two Bedrooms", "Outdoor Living"],
  },
  {
    name: "Troy Villa",
    category: "villa",
    village: "Troy Hill",
    description:
      "A spacious contemporary villa with cathedral ceilings, two ensuite bedrooms, expansive verandas, and breathtaking Caribbean views.",
    website: "https://www.sabaislandpremierproperties.com/",
    features: ["Contemporary", "Two Bedrooms", "Ensuite", "Ocean View"],
  },
  {
    name: "Haiku House",
    category: "villa",
    village: "Troy Hill",
    description:
      "A luxury three-bedroom villa designed by Jan des Bouvrie, featuring a private pool, Jacuzzi, rainforest setting, and magnificent views.",
    website: "https://sabavillas.com/",
    features: ["Luxury", "Three Bedrooms", "Pool", "Jacuzzi"],
  },
];

export const PARTNERS: Partner[] = [
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
  "Restaurants",
  "Transportation",
  "Things to Do",
];
