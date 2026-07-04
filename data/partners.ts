export type PartnerCategory =
  | "local"
  | "dive"
  | "training"
  | "equipment"
  | "travel"
  | "conservation";

export type PartnerSubcategory = "Restaurants" | "Transportation";

export type AccommodationType = "hotel" | "cottage" | "villa";

export interface Partner {
  name: string;
  category: PartnerCategory;
  subcategory?: PartnerSubcategory;
  description?: string;
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
  village?: string;
  island?: string;
  transportationType?: "airplane" | "ferry" | "helicopter";
  linkType?: "website" | "facebook" | "google";
}

export interface Accommodation {
  name: string;
  type: AccommodationType;
  village: string;
  description: string;
  website: string;
  filters: string[]; // filterable tags (e.g., "pool", "ocean-view", "full-kitchen")
  amenities: string[]; // display-only tags on cards
  image?: string;
}

export const ACCOMMODATIONS: Accommodation[] = [
  // Hotels
  {
    name: "Cottage Club",
    type: "hotel",
    village: "Windwardside",
    description:
      "Gingerbread-style private cottages with full kitchens, a shared pool, and a scenic ridge location in Windwardside.",
    website: "https://www.cottage-club.com/",
    image: "/images/optimized/cottage-club.webp",
    filters: ["full-kitchen", "pool", "walk-to-village"],
    amenities: ["Gingerbread Style"],
  },
  {
    name: "El Momo Cottages",
    type: "hotel",
    village: "Booby Hill",
    description:
      "Private wooden cottages perched on Booby Hill slopes, surrounded by tropical gardens and sweeping Caribbean views.",
    website: "https://elmomocottages.com/",
    image: "/images/optimized/el-momo-cottages.webp",
    filters: ["ocean-view"],
    amenities: ["Tropical Gardens", "Private Cottages"],
  },
  {
    name: "Juliana's Hotel",
    type: "hotel",
    village: "Windwardside",
    description:
      "A Saba favorite for over 30 years, with boutique rooms, suites, cottages, Tropics Café, and a pool in Windwardside.",
    website: "https://www.julianashotelsaba.com/",
    image: "/images/optimized/julianas-hotel.webp",
    filters: ["pool", "walk-to-village"],
    amenities: ["Boutique", "Restaurant"],
  },
  {
    name: "Saba Arawak Hotel",
    type: "hotel",
    village: "Windwardside",
    description:
      "A centrally located hotel in Windwardside offering clean, comfortable rooms and easy access to the village.",
    website: "https://sabaarawak.com/",
    image: "/images/optimized/arawak-hotel.webp",
    filters: ["walk-to-village"],
    amenities: ["Central", "Comfortable Rooms"],
  },
  {
    name: "Scenery Hotel",
    type: "hotel",
    village: "Windwardside",
    description:
      "One of Saba's newest hotels with modern rooms, a pool, and panoramic Caribbean Sea views in Windwardside.",
    website: "https://sceneryhotelsaba.com/",
    image: "/images/optimized/scenery-hotel.webp",
    filters: ["pool", "ocean-view", "walk-to-village"],
    amenities: ["Modern"],
  },

  // Cottages & Villas
  {
    name: "Althea Cottage",
    type: "cottage",
    village: "Windwardside",
    description:
      "A restored 150-year-old Saban cottage with sweeping Caribbean and mountain views, flexible layouts, and a full kitchen.",
    website: "https://www.airbnb.com/rooms/32723308/",
    filters: ["historic", "ocean-view", "full-kitchen"],
    amenities: ["Sleeps 5"],
  },
  {
    name: "Compass Cottage",
    type: "cottage",
    village: "Booby Hill",
    description:
      "A stylish two-bedroom cottage with tropical gardens, a private pool, and expansive sea views near Windwardside.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["pool", "ocean-view"],
    amenities: ["Two Bedrooms", "Garden"],
  },
  {
    name: "Flamboyant Cottage",
    type: "cottage",
    village: "Booby Hill",
    description:
      "A classic gingerbread-style Saban cottage with two bedrooms, a private pool, gazebo, and views toward Statia and St. Kitts.",
    website: "https://www.airbnb.com/rooms/32723308/",
    filters: ["pool", "ocean-view"],
    amenities: ["Gingerbread Style", "Gazebo"],
  },
  {
    name: "Haiku House",
    type: "villa",
    village: "Troy Hill",
    description:
      "A luxury three-bedroom villa designed by Jan des Bouvrie, featuring a private pool, Jacuzzi, rainforest setting, and magnificent views.",
    website: "https://sabavillas.com/",
    filters: ["luxury", "pool"],
    amenities: ["Three Bedrooms", "Jacuzzi"],
  },
  {
    name: "Hidden Garden Cottage",
    type: "cottage",
    village: "St. John's",
    description:
      "One of Saba's most historic cottages, dating to 1890, with original stained glass, antique furnishings, and peaceful gardens.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["historic", "walk-to-village"],
    amenities: ["Antique Interiors", "Garden"],
  },
  {
    name: "Hibiscus Cottage",
    type: "cottage",
    village: "Windwardside",
    description:
      "A charming classic Saban cottage with lush tropical gardens, mountain views, two ensuite bedrooms, and easy access to trails.",
    website: "https://www.sabahibiscus.com/",
    filters: ["mountain-view"],
    amenities: ["Tropical Gardens", "Two Bedrooms", "Walk to Trails"],
  },
  {
    name: "House on the Path",
    type: "cottage",
    village: "Windwardside",
    description:
      "A secluded restored Saban cottage along a footpath above Windwardside, ideal for couples seeking a private eco-friendly escape.",
    website: "https://www.houseonthepath.com/",
    filters: ["historic"],
    amenities: ["Eco-Friendly", "Secluded", "Two Bedrooms"],
  },
  {
    name: "Hummingbird Villa",
    type: "villa",
    village: "English Quarter",
    description:
      "An award-winning luxury villa with tropical gardens, a freeform pool, guest cottage, gourmet kitchen, and stunning Caribbean views.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["luxury", "pool"],
    amenities: ["Guest Cottage", "Gourmet Kitchen"],
  },
  {
    name: "Iris House",
    type: "cottage",
    village: "Windwardside",
    description:
      "A finely preserved traditional Saban cottage with two bedrooms, landscaped gardens, a private pool, gazebo, and spectacular Caribbean views.",
    website: "https://www.airbnb.com/rooms/32723308/",
    filters: ["pool", "ocean-view"],
    amenities: ["Traditional", "Gazebo"],
  },
  {
    name: "Novel Cottage",
    type: "cottage",
    village: "St. John's",
    description:
      "A renovated century-old Saban cottage with panoramic views toward Statia, St. Kitts, and Nevis, perfect for couples.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["historic", "ocean-view"],
    amenities: ["One Bedroom", "Renovated"],
  },
  {
    name: "Peter Hytte by Althea",
    type: "cottage",
    village: "Windwardside",
    description:
      "A cozy modern stone cottage with views of Mt. Scenery, Windwardside, and the sea, with flexible one or two bedrooms.",
    website: "https://www.airbnb.com/rooms/37491370/",
    filters: ["mountain-view"],
    amenities: ["Modern Stone", "Sea View", "Flexible Layout"],
  },
  {
    name: "Poets and Painters Cottage",
    type: "cottage",
    village: "Windwardside",
    description:
      "A luxurious heritage cottage with antique furnishings, two bedrooms, modern amenities, and walking distance to Windwardside restaurants.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["walk-to-village"],
    amenities: ["Heritage", "Antique Furnishings", "Two Bedrooms"],
  },
  {
    name: "Spyglass Villa",
    type: "villa",
    village: "Booby Hill",
    description:
      "A private Booby Hill villa with expansive verandas, panoramic Caribbean views, two bedrooms, and outdoor entertaining spaces.",
    website: "https://www.airbnb.com/rooms/2367234",
    filters: [],
    amenities: ["Private Villa", "Panoramic View", "Two Bedrooms", "Outdoor Living"],
  },
  {
    name: "Troy Villa",
    type: "villa",
    village: "Troy Hill",
    description:
      "A spacious contemporary villa with cathedral ceilings, two ensuite bedrooms, expansive verandas, and breathtaking Caribbean views.",
    website: "https://www.sabaislandpremierproperties.com/",
    filters: ["ocean-view"],
    amenities: ["Contemporary", "Two Bedrooms", "Ensuite"],
  },
];

export const PARTNERS: Partner[] = [
  // Local Partners — Restaurants
  {
    name: "Amonhana",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/people/Amonhana-Saba/61567249710942/",
    linkType: "facebook",
  },
  {
    name: "Bizzy B Bakery (The Bottom)",
    category: "local",
    subcategory: "Restaurants",
    village: "The Bottom",
    website: "https://www.facebook.com/SabaBakery/",
    linkType: "facebook",
  },
  {
    name: "Bizzy B Bakery (Windwardside)",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/SabaBakery/",
    linkType: "facebook",
  },
  {
    name: "Brigadoon Restaurant",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/BrigadoonSaba",
    linkType: "facebook",
  },
  {
    name: "Choi & Suzan Chinese Restaurant",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "",
  },
  {
    name: "Colibri Cafe",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/people/Colibri-Caf-Saba/61557320200110/",
    linkType: "facebook",
  },
  {
    name: "D Corner Streetfood",
    category: "local",
    subcategory: "Restaurants",
    village: "Fort Bay",
    website: "https://www.facebook.com/people/D-Corner/61575684740662/",
    linkType: "facebook",
  },
  {
    name: "Island Flavor",
    category: "local",
    subcategory: "Restaurants",
    village: "The Bottom",
    website: "https://www.facebook.com/Island-Flavor-671817589617548/",
    linkType: "facebook",
  },
  {
    name: "Liam's Cuisine Bar & Restaurant",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/Liams-Cuisine-101391342634709/",
    linkType: "facebook",
  },
  {
    name: "Lollipops Restaurant",
    category: "local",
    subcategory: "Restaurants",
    village: "The Bottom",
    website: "https://www.facebook.com/LollipopSaba/",
    linkType: "facebook",
  },
  {
    name: "Maribel's Restaurant",
    category: "local",
    subcategory: "Restaurants",
    village: "The Bottom",
    website: "",
  },
  {
    name: "Pop's Place",
    category: "local",
    subcategory: "Restaurants",
    village: "Fort Bay",
    website: "https://www.facebook.com/popsplace.saba",
    linkType: "facebook",
  },
  {
    name: "Saba Snack",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/Saba-Snack-851037678247495/",
    linkType: "facebook",
  },
  {
    name: "Saba Snack Gourmet",
    category: "local",
    subcategory: "Restaurants",
    village: "The Bottom",
    website: "",
  },
  {
    name: "Swinging Doors",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "",
  },
  {
    name: "Tank'd",
    category: "local",
    subcategory: "Restaurants",
    village: "Fort Bay",
    website: "",
  },
  {
    name: "The Dive Bar",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "",
  },
  {
    name: "The Hideaway",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/thehideawaysaba",
    linkType: "facebook",
  },
  {
    name: "Tropics Café",
    category: "local",
    subcategory: "Restaurants",
    village: "Windwardside",
    website: "https://www.facebook.com/TropicsCafeSaba",
    linkType: "facebook",
  },
  // Local Partners — Transportation
  {
    name: "Makana Ferry",
    category: "local",
    subcategory: "Transportation",
    transportationType: "ferry",
    website: "https://makanaferryservice.com/",
  },
  {
    name: "SXM Airways",
    category: "local",
    subcategory: "Transportation",
    transportationType: "airplane",
    website: "https://fly-sxmairways.com/",
  },
  {
    name: "West Indies Helicopters",
    category: "local",
    subcategory: "Transportation",
    transportationType: "helicopter",
    website: "https://westindieshelicopters.com/",
  },
  {
    name: "Winair",
    category: "local",
    subcategory: "Transportation",
    transportationType: "airplane",
    website: "https://www.winair.sx/",
  },

  // Caribbean Dive Partners
  {
    name: "Dive St. Maarten",
    category: "dive",
    island: "St. Maarten",
    website: "https://www.divestmaarten.com/",
  },
  {
    name: "Scuba Shop (St. Maarten)",
    category: "dive",
    island: "St. Maarten",
    website: "https://www.scubashopsxm.com/",
  },
  {
    name: "Serial Divers",
    category: "dive",
    island: "St. Barths",
    website: "https://www.serialdivers.com/en/",
  },
  {
    name: "Statia Divers",
    category: "dive",
    island: "St. Eustatius",
    website: "https://www.statiadivers.com/",
  },

  // Training Agencies
  {
    name: "First Response Training International",
    category: "training",
    website: "https://www.firstresponse-ed.com/",
  },
  {
    name: "SDI",
    category: "training",
    website: "https://www.tdisdi.com/",
  },
  {
    name: "TDI",
    category: "training",
    website: "https://www.tdisdi.com/",
  },

  // Equipment Partners
  {
    name: "Kraken",
    category: "equipment",
    website: "https://krakenaquatics.com/",
  },
  {
    name: "Scubapro",
    category: "equipment",
    website: "https://www.scubapro.com/",
  },
  {
    name: "XS Scuba",
    category: "equipment",
    website: "https://www.xsscuba.com/",
  },

  // Travel & Tour Operators
  {
    name: "Group Organizers",
    category: "travel",
    description:
      "From dive clubs to family trips, we help organizers build seamless Saba experiences with lodging, boats, and conservation experiences.",
    website: "/contact",
  },
  {
    name: "Travel Agencies & Wholesalers",
    category: "travel",
    description:
      "Sea Saba works with travel professionals, wholesalers, and group organizers to make planning dive vacations easy. Contact us to coordinate accommodations, transportation, and custom itineraries.",
    website: "/contact",
  },

  // Conservation & Community
  {
    name: "Dutch Caribbean Nature Alliance",
    category: "conservation",
    website: "https://dcnanature.org/",
  },
  {
    name: "Public Entity Saba",
    category: "conservation",
    website: "https://www.sabagov.nl/",
  },
  {
    name: "ReefGrazers",
    category: "conservation",
    website: "https://wwfdutchcaribbean.org/project/reef-grazers/",
  },
  {
    name: "Saba Conservation Foundation",
    category: "conservation",
    website: "https://www.sabaconservation.org/",
  },
  {
    name: "Sea & Learn Foundation",
    category: "conservation",
    website: "https://www.seaandlearn.org/",
  },
];

export const LOCAL_PARTNER_SUBCATEGORIES: PartnerSubcategory[] = ["Restaurants", "Transportation"];
