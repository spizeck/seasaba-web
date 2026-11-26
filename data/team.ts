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
    title: "Owner",
    bio: "Chad moved to Saba with Katy and their children, Caleb and Skylar, in 2021 to continue the Sea Saba tradition.",
    biography: [
      "Chad moved to Saba with Katy and their children, Caleb and Skylar, in 2021 to continue the Sea Saba tradition.",
      "Together, Chad and Katy oversee daily operations and are committed to preserving the relaxed, professional atmosphere that has made Sea Saba special since 1985.",
      "Sea Saba is a family business, and their goal is simple: help guests experience the best of Saba above and below the water.",
    ],
    isOwner: true,
  },
  {
    slug: "katy-nuttall",
    name: "Katy",
    fullName: "Katy Nuttall",
    title: "Owner",
    bio: "Katy moved to Saba with Chad and their children, Caleb and Skylar, in 2021 to continue the Sea Saba tradition.",
    biography: [
      "Katy moved to Saba with Chad and their children, Caleb and Skylar, in 2021 to continue the Sea Saba tradition.",
      "Together, Chad and Katy oversee daily operations and are committed to preserving the relaxed, professional atmosphere that has made Sea Saba special since 1985.",
      "Sea Saba is a family business, and their goal is simple: help guests experience the best of Saba above and below the water.",
    ],
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

/** Identifiable people with a stable profile slug. */
export const PROFILE_MEMBERS: TeamMember[] = STAFF_MEMBERS.filter(
  (member) => member.isPerson !== false && Boolean(member.slug)
);

export const TEAM_MEMBER_BY_SLUG: Record<string, TeamMember> =
  Object.fromEntries(
    PROFILE_MEMBERS.map((member) => [member.slug as string, member])
  );

export function teamMemberProfilePath(member: TeamMember | string): string {
  const slug = typeof member === "string" ? member : member.slug;
  return `/about/${slug}`;
}

export function teamMemberProfileUrl(member: TeamMember): string {
  return `${SITE_URL}${teamMemberProfilePath(member)}`;
}

/** Stable schema.org entity identifier reused across pages. */
export function teamMemberEntityId(member: TeamMember): string {
  return `${teamMemberProfileUrl(member)}#person`;
}

export function teamMemberDisplayName(member: TeamMember): string {
  return member.fullName ?? member.name;
}

export function teamMemberBiography(member: TeamMember): string[] {
  return member.biography ?? [member.bio];
}
