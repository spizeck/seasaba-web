import { SITE_URL } from "@/lib/constants";

/**
 * Sea Saba staff roster — single source of truth for owner/crew presentation,
 * biography routes, and Person structured data. Facts here appear in schema;
 * keep every field accurate to the person it describes. Do not add surnames,
 * qualifications, languages, employment dates, favorite dive sites, or image
 * assets without an approved source.
 */

export interface TeamMemberImage {
  src: string;
  alt: string;
  objectPosition?: string;
}

export interface TeamMember {
  /** Stable profile slug and Person entity key for identifiable people. */
  slug?: string;
  /** Name shown in compact staff contexts such as the carousel. */
  name: string;
  /** Full published name where it is verified; falls back to `name`. */
  fullName?: string;
  title: string;
  /** Short approved biography excerpt used on cards and schema descriptions. */
  bio: string;
  image?: string;
  objectPosition?: string;
  funFact?: string;
  languages?: string[];
  /**
   * Whether this entry is one identifiable person (default true) — controls
   * Person structured data and profile generation. False for non-humans or
   * joint entries; never set false to hide a real person's expertise signal.
   */
  isPerson?: boolean;
  /** Owners stay in Meet the Owners instead of the crew carousel. */
  isOwner?: boolean;
  /** Approved long-form biography paragraphs. Falls back to `bio`. */
  biography?: string[];
  qualifications?: string[];
  experience?: string[];
  interests?: string[];
  /** Dive-site names exactly as catalogued in data/dive-site-videos.ts. */
  favoriteDiveSites?: string[];
  additionalImages?: TeamMemberImage[];
  relatedLinks?: {
    title: string;
    href: string;
    relationship: "authored" | "reviewed";
  }[];
}

export const STAFF_MEMBERS: TeamMember[] = [
  {
    slug: "chad-nuttall",
    name: "Chad",
    fullName: "Chad Nuttall",
    title: "Owner & Managing Director",
    bio: "Chad is Sea Saba's Owner and Managing Director, bringing a diverse background in leadership, mechanics, construction, and problem-solving to the business.",
    image: "/images/optimized/chad-nuttall.webp",
    biography: [
      "Growing up in Arizona, Chad never imagined he'd end up owning a dive operation on a tiny Caribbean island. In fact, after being stung by a stingray as a child in Rocky Point, Mexico, he was terrified of the ocean! His childhood was spent skiing, riding horses, and enjoying the lakes of Arizona, with scuba diving nowhere on the radar.",
      "After high school, Chad joined the U.S. Army, serving with the 1st Infantry Division at Fort Riley, Kansas, including a 13-month deployment to Iraq in 2006–2007. Following his military service, he pursued a career in construction and aviation maintenance, earning his FAA Airframe and Powerplant certification at the University of Alaska Anchorage. His career eventually took him around the world managing military airfield construction projects.",
      "It was during a project on remote Wake Island in the Pacific Ocean that Chad finally discovered scuba diving, and everything changed. What started as a new hobby quickly became a passion. As he and his wife fell more in love with diving, they began looking for a place where they could build a life closer to the ocean.",
      "After nearly settling on Guam, they discovered Saba and a dive shop that happened to be for sale. They traveled to the island, completed their quarantine, and by their second day, knew they'd found home.",
      "Today, as Owner and Managing Director of Sea Saba, Chad brings his diverse background in leadership, mechanics, construction, and problem-solving to the business. But what he values most is the opportunity to make a positive difference in people's lives.",
      "\"We're incredibly fortunate to be in a position where we can make a positive impact on people. Whether it's helping someone discover the underwater world for the first time or creating an unforgettable experience, that's what makes this so rewarding.\"",
    ],
    qualifications: ["FAA Airframe and Powerplant certification"],
    experience: [
      "Served with the 1st Infantry Division at Fort Riley, Kansas, including a 13-month deployment to Iraq in 2006–2007",
      "Career in construction and aviation maintenance",
      "Managed military airfield construction projects around the world",
    ],
    interests: ["Playing guitar", "Writing code"],
    favoriteDiveSites: ["Diamond Rock"],
    funFact: "When he's not working on Sea Saba, you'll probably find Chad playing guitar or writing code.",
    isOwner: true,
  },
  {
    slug: "katy-nuttall",
    name: "Katy",
    fullName: "Katy Nuttall",
    title: "Co-Owner",
    bio: "Katy is one of the people keeping Sea Saba running smoothly behind the scenes, bringing a steady, thoughtful approach to the operation.",
    image: "/images/optimized/katy-nuttall.webp",
    biography: [
      "Growing up in Kotzebue, a small community in northwest Alaska, Katy's childhood was a world away from the warm Caribbean waters of Saba. Raised in a family deeply connected to their community, with a father who served as a pastor and later trained other pastors, Katy spent her early years surrounded by Alaska's rugged wilderness.",
      "Hunting, fishing, and outdoor adventures were a natural part of everyday life. Her summer jobs were a little different from those of most teenagers, including counting fish and collecting DNA samples for fisheries research!",
      "After high school, Katy attended school in Soldotna, Alaska, where she eventually met Chad shortly before he completed his service in the U.S. Army. The two moved to Arizona in 2009 and married in 2010. Katy went on to work as a contracts administrator, developing the organizational and administrative skills that would later prove invaluable at Sea Saba.",
      "As their shared passion for scuba diving grew, Katy and Chad began dreaming of a life closer to the ocean. Their search eventually led them to the tiny Dutch Caribbean island of Saba, where a visit to explore a dive business turned into a life-changing decision.",
      "Today, as co-owner of Sea Saba, Katy is one of the people keeping everything running smoothly behind the scenes. From managing administrative details to helping keep the many moving parts of the business organized, she brings a steady, thoughtful approach to the operation.",
      "Katy is also working toward completing her Divemaster certification, continuing to develop her diving skills while helping manage the business.",
      "From counting fish in the rivers of Alaska to helping run a dive operation in the Caribbean, Katy's journey has certainly come full circle!",
    ],
    experience: [
      "Contracts administrator before joining Sea Saba",
      "Working toward completing her Divemaster certification",
    ],
    favoriteDiveSites: ["Man O'War Shoals"],
    funFact: "Before moving to the Caribbean, Katy grew up hunting and fishing in Arctic Alaska, and even worked collecting fish DNA samples for research!",
    isOwner: true,
  },
  {
    slug: "mel",
    name: "Mel",
    title: "Guest Services Manager",
    bio: "A Saba resident for over 20 years, Mel is your go-to source for island tips, hidden gems, and neighboring island adventures. After spending 12 years with Sea Saba, she recently returned to the team and will likely be your first point of contact. When she's not helping guests plan their perfect trip, you'll probably find her hiking one of Saba's trails or dreaming up new ideas for the shop.",
    image: "/images/optimized/mel.webp",
    languages: ["English", "Dutch", "German"],
    objectPosition: "center 30%",
    experience: [
      "Saba resident for over 20 years",
      "Spent 12 years with Sea Saba before recently returning to the team",
    ],
    interests: ["Hiking Saba's trails", "Developing new ideas for the shop"],
  },
  {
    slug: "otto-de-vries",
    name: "Otto",
    fullName: "Otto de Vries",
    title: "Head Boat Captain & Dive Instructor",
    bio: "Born and raised on Saba, Otto has been diving and running boats for decades. He doesn't have much of a filter, loves to laugh, and believes diving should always be an adventure. A passionate technical diver and fisherman, Otto is happiest when he's on the water, below it, or telling stories about both.",
    image: "/images/optimized/otto.webp",
    languages: ["English", "Spanish"],
    funFact: "Sea Saba's first Divemaster in 1985",
    experience: [
      "Born and raised on Saba",
      "Diving and running boats for decades",
    ],
    interests: ["Technical diving", "Fishing", "Being on or below the water"],
  },
  {
    slug: "aaron-smith",
    name: "Aaron",
    fullName: "Aaron Smith",
    title: "Senior Boat Captain & Dive Instructor",
    bio: "Originally from the United States, Aaron has spent more than 14 years with Sea Saba. A USCG 100-ton Master Captain and instructor, he's known for his calm professionalism and easygoing personality. Off the boat, you'll usually find him watching Texas football or spoiling his cats. His experience and sense of humor have made him a favorite with guests and crew alike.",
    languages: ["English"],
    image: "/images/optimized/aaron.webp",
    qualifications: ["USCG 100-ton Master Captain"],
    experience: ["More than 14 years with Sea Saba"],
    interests: ["Texas football", "Spoiling his cats"],
  },
  {
    slug: "lenny",
    name: "Lenny",
    title: "Boat Captain & Divemaster",
    bio: "Originally from St. Vincent, Lenny earned every certification along the way, progressing from Open Water Diver to Divemaster with Sea Saba. A guest favorite and sunset cruise entertainer, he's known for his big smile, great sense of humor, and ability to make everyone feel like part of the family.",
    image: "/images/optimized/lenny.webp",
    languages: ["English"],
    objectPosition: "center 100%",
    funFact: "Lenny is known as Captain Giggles.",
    experience: [
      "Progressed from Open Water Diver to Divemaster with Sea Saba",
      "Boat captain and sunset cruise entertainer",
    ],
  },
  {
    slug: "robins",
    name: "Robins",
    title: "Boat Captain & Divemaster",
    bio: "Originally from Haiti, Robins combines excellent boat handling with a passion for diving and a personality that keeps everyone smiling. Known for his humor, easygoing attitude, and love of dancing, he's happiest when he's on the water, underwater, or finding a reason to celebrate. Guests quickly discover that a day with Robins is never boring.",
    image: "/images/optimized/robins.webp",
    objectPosition: "center 100%",
    languages: ["English", "French", "Spanish", "Haitian Creole"],
    interests: ["Diving", "Dancing", "Being on the water"],
  },
  {
    slug: "lionel",
    name: "Lionel",
    title: "Dive Instructor",
    bio: "A Saban native, freelance instructor, and harbor master, Lionel simply can't stay away from the ocean. Whether he's leading REEF surveys, hunting lionfish, or sharing his love of Saba's reefs with guests, he's happiest in the water. If there's a chance to dive, chances are Lionel is already geared up.",
    languages: ["English"],
    image: "/images/optimized/lionel.webp",
    funFact: "Lionel is a professional smiler.",
    experience: ["Saban native", "Freelance instructor", "Harbor master"],
    interests: ["REEF surveys", "Lionfish hunting", "Sharing Saba's reefs"],
  },
  {
    slug: "anthony",
    name: "Anthony",
    title: "Guest Transportation",
    bio: "Originally from Sint Maarten, Anthony is often the first friendly face guests meet on Saba. Loaded with island knowledge and always happy to share it, he loves introducing visitors to the people, history, and stories that make Saba special. A ride with Anthony is usually equal parts transportation and island tour.",
    image: "/images/optimized/anthony.webp",
    languages: ["English", "Spanish", "Dutch"],
    objectPosition: "center bottom",
    interests: ["Sharing Saba's people, history, and stories"],
  },
  {
    slug: "julijana",
    name: "Julijana",
    title: "Dive Instructor",
    bio: "Growing up in Cuba, Julijana developed a love for the ocean and adventure that eventually led her to technical diving. When she's not underwater, you'll likely find her practicing yoga or lost in a good book. Her calm energy and passion for exploration make every dive feel a little more special.",
    image: "/images/optimized/julijana.webp",
    languages: ["English", "Serbian", "Spanish"],
    interests: ["Technical diving", "Yoga", "Reading"],
  },
  {
    slug: "jake-mulford",
    name: "Jake Mulford",
    title: "Scuba Instructor",
    image: "/images/optimized/jake-mulford.webp",
    bio: "Born in South Florida and raised in North Carolina, Jake has always felt at home around the water. After earning his scuba certification in 2021, he traded a career in software engineering in 2026 for life as a dive professional with Sea Saba.",
    biography: [
      "Born in South Florida and raised in North Carolina, Jake has always felt at home around the water, from the sunny beaches of Florida to the cool mountain rivers of North Carolina.",
      "After earning his scuba certification in 2021, diving took him to places he had never imagined visiting and opened up an entirely new passion for the underwater world. In 2026, Jake decided to trade his career in software engineering for life as a dive professional, joining the Sea Saba team as a scuba instructor.",
      "When he's not underwater, you'll find Jake hiking, working out, playing video games, or playing the French horn.",
    ],
    qualifications: ["Open Water Scuba Instructor"],
    experience: [
      "Earned his scuba certification in 2021",
      "Joined the Sea Saba team as a scuba instructor in 2026",
      "Previously worked in software engineering",
    ],
    interests: ["Hiking", "Working out", "Video games", "French horn"],
    funFact: "Jake hasn't left his software engineering skills entirely behind. He wrote his own Python script to organize and edit his underwater photos and videos.",
  },
  {
    slug: "lilian-caro",
    name: "Lilian Caro",
    title: "Scuba Instructor",
    image: "/images/optimized/lilian-caro.webp",
    bio: "Born in Colombia, Lilian spent over 10 years as a university professor before becoming a Divemaster in Thailand and a scuba instructor in Greece. She brings her enthusiasm, curiosity, and more than a decade of teaching experience to Sea Saba.",
    biography: [
      "Born in Colombia, Lilian spent over 10 years as a university professor, teaching law and sharing her passion for knowledge, justice, and making a difference. Throughout her life, she has also had a deep love for animals and the natural world.",
      "One ordinary day at the office, something extraordinary happened: her gills started growing. She left her desk, packed her bags, and headed to Thailand, where she became a Divemaster, before continuing to Greece to become a scuba instructor.",
      "Lilian still remembers her very first descent underwater. Within just a few metres, somewhere between the silence of the ocean and tears of pure happiness, she knew she had found where she belonged. She left her legal career behind to dedicate herself to sharing her passion for the ocean and marine life.",
      "Although she grew up surrounded by mountains and will always love them, Lilian is a beach girl at heart. Give her salty hair, blue water, marine life, and a good dive, and you'll probably find her smiling.",
      "Today, Lilian brings her enthusiasm, curiosity, and more than a decade of teaching experience to Sea Saba. For her, diving is about much more than learning skills and earning certifications. It's about discovering a new world, respecting it, and becoming part of something bigger than ourselves.",
      "If she can help someone fall in love with the ocean the way she did, she knows she's exactly where she's supposed to be.",
    ],
    qualifications: ["Open Water Scuba Instructor"],
    experience: [
      "University professor teaching law for over 10 years",
      "Became a Divemaster in Thailand",
      "Became a scuba instructor in Greece",
    ],
    languages: ["Spanish", "English", "A little Portuñol"],
    interests: ["Animals and the natural world", "Salty hair, blue water, marine life, and a good dive"],
  },
  {
    name: "Gunner",
    title: "Dive Dog, American Vizsla",
    bio: "Gunner is Sea Saba's four-legged ambassador and chief food inspector. He loves meeting guests and making sure everyone feels welcome. From greeting divers at the dock to investigating unattended sandwiches, Gunner takes his responsibilities very seriously.",
    image: "/images/optimized/gunner-dive-dog.webp",
    languages: ["Woof"],
    isPerson: false, // the dive dog is not a Person
    funFact: "Do NOT leave food unattended in his presence.",
  },
];

/** Crew members shown in the carousel; owners remain in Meet the Owners. */
export const TEAM_MEMBERS: TeamMember[] = STAFF_MEMBERS.filter(
  (member) => !member.isOwner
);

export type ProfiledTeamMember = TeamMember & { slug: string };

/** Identifiable people with a stable profile slug. */
export const PROFILE_MEMBERS: ProfiledTeamMember[] = STAFF_MEMBERS.filter(
  (member): member is ProfiledTeamMember =>
    member.isPerson !== false && typeof member.slug === "string" && member.slug.length > 0
);

// Null-prototype lookup: unknown slugs such as "constructor" can never
// resolve through Object.prototype and every miss is a plain undefined.
export const TEAM_MEMBER_BY_SLUG: Readonly<
  Record<string, ProfiledTeamMember | undefined>
> = Object.assign(
  Object.create(null),
  Object.fromEntries(PROFILE_MEMBERS.map((member) => [member.slug, member]))
);

export function teamMemberProfilePath(member: ProfiledTeamMember | string): string {
  const slug = typeof member === "string" ? member : member.slug;
  return `/about/${slug}`;
}

export function teamMemberProfileUrl(member: ProfiledTeamMember): string {
  return `${SITE_URL}${teamMemberProfilePath(member)}`;
}

/** Stable schema.org entity identifier reused across pages. */
export function teamMemberEntityId(member: ProfiledTeamMember): string {
  return `${teamMemberProfileUrl(member)}#person`;
}

export function teamMemberDisplayName(member: TeamMember): string {
  return member.fullName ?? member.name;
}

export function teamMemberBiography(member: TeamMember): string[] {
  return member.biography ?? [member.bio];
}
