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
    fullName: "Melanie Marks",
    title: "Guest Services Manager",
    bio: "Melanie landed on Saba in 2007 and never left. After 12 years with Sea Saba under the previous ownership and a six-year surface interval, she returned in April 2026 to coordinate group bookings, dive trips, and the shop's merchandise.",
    image: "/images/optimized/mel.webp",
    objectPosition: "center 30%",
    languages: ["English", "Dutch", "German"],
    biography: [
      "Melanie landed on the little rock of Saba in 2007 and never left! After spending 12 years with Sea Saba under the previous ownership, she decided it was time for a change of scenery. Well, professionally speaking, because she wasn't going anywhere!",
      "After a six-year surface interval from Sea Saba, she made her grand comeback in April 2026. Apparently, 12 years just weren't enough, so she's now working on year 13!",
      "These days, you'll find her behind the scenes, juggling group bookings, coordinating dive trips, and making sure all the little pieces fall into place. It's a bit like solving a giant puzzle, except the pieces occasionally change their travel dates, flight schedules, or group sizes!",
      "She's also the one helping keep the Sea Saba shop stocked with T-shirts, hats, and other goodies. With an eye for design and a weakness for anything creative, choosing merchandise might just be one of her favorite parts of the job. After all, someone has to make sure you leave Saba looking stylish!",
      "Outside the office, Melanie's creative streak continues. From making mosaics and trying her hand at macramé to restoring old furniture, there's usually another project waiting somewhere. Why buy something new when you can spend three weekends fixing up something old?",
      "Her other great loves? Her dog, being out on the ocean, and SWEETS! And when it comes to anything sweet, her philosophy is simple: More is always better than less! Portion control? Never heard of her.",
      "Her perfect day involves sunshine, salty air, her four-legged best friend, and something ridiculously sweet to finish it off.",
      "Now back with the Sea Saba crew, she's once again juggling the occasional chaos, adding her creative touch wherever possible, and helping make memorable dive vacations happen.",
      "One thing is certain: You can take Melanie out of Sea Saba, but apparently you can't take Sea Saba out of Melanie!",
    ],
    qualifications: [
      "Adult and Child First Aid",
      "Open Water Scuba Diver",
      "Advanced Open Water",
      "Nitrox",
    ],
    experience: [
      "Landed on Saba in 2007",
      "Spent 12 years with Sea Saba under the previous ownership",
      "Returned to Sea Saba in April 2026",
    ],
    interests: ["Mosaics", "Macramé", "Restoring furniture", "Being on the ocean", "Sweets", "Her dog"],
    funFact: "When it comes to anything sweet, Melanie's philosophy is simple: more is always better than less.",
  },
  {
    slug: "otto-de-vries",
    name: "Otto",
    fullName: "Otto de Vries",
    title: "Dive Instructor, Captain & Saba Diving Pioneer",
    bio: "Born on Antigua with deep Saban roots, Otto moved to Saba as a child and has spent nearly half a century on and beneath the Caribbean Sea. He became Sea Saba's first employee in 1985 and Saba's first local dive instructor in 1988.",
    image: "/images/optimized/otto.webp",
    languages: ["English", "Spanish"],
    biography: [
      "Born on the island of Antigua with deep Saban roots, Otto moved to Saba as a child and has called the island home ever since. With a lifetime spent on and beneath the Caribbean Sea, few people know Saba's waters quite like Otto.",
      "His diving journey began in 1978, long before Saba became the world-renowned diving destination it is today. In 1985, Otto became Sea Saba's very first employee, helping lay the foundation for what the operation would become. Just three years later, in 1988, he made history as Saba's first local dive instructor, a distinction he proudly holds to this day.",
      "Over the decades, Otto has worn just about every hat imaginable in the diving industry, working as an instructor, dive guide, and boat captain. His knowledge of Saba's dive sites, underwater topography, and marine environment comes from nearly half a century of firsthand experience. He's watched the island's diving industry grow and evolve, and he's been part of that story from the very beginning.",
      "For Otto, diving isn't simply a profession. It's a lifelong connection to the ocean and the island he calls home. Whether sharing stories of Saba's diving history or introducing visitors to the underwater world he's explored for decades, Otto brings an extraordinary depth of local knowledge and experience to Sea Saba.",
      "Airport Drift holds a special place in Otto's heart. Weather conditions mean it isn't a site divers get to visit very often, which makes every opportunity that much more memorable. Its remarkable underwater topography and healthy marine environment are a reminder of what makes diving around Saba so extraordinary.",
      "When Otto isn't underwater, there's a good chance he's still somewhere out on the ocean! An avid offshore fisherman, he has a particular passion for trolling for wahoo and even enjoys designing his own fishing tackle. And when the boats are back in harbor, he's always up for a good game of chess. Whether it's chasing wahoo offshore or planning his next move on the chessboard, Otto appreciates a good challenge.",
    ],
    experience: [
      "Began diving in 1978",
      "Became Sea Saba's first employee in 1985",
      "Became Saba's first local dive instructor in 1988",
    ],
    interests: ["Offshore fishing", "Designing fishing tackle", "Chess"],
    funFact: "When Otto isn't underwater, there's a good chance he's still somewhere out on the ocean trolling for wahoo, or planning his next move over a chessboard.",
  },
  {
    slug: "aaron-smith",
    name: "Aaron",
    fullName: "Aaron Smith",
    title: "Scuba Instructor & Captain",
    bio: "Born and raised near Dallas, Texas, Aaron became a certified scuba instructor in 2009 and joined Sea Saba in 2011. A USCG 100-ton offshore captain and Lionfish Hunting Instructor, he brings years of local experience and Texas-sized personality to every trip.",
    languages: ["English"],
    image: "/images/optimized/aaron.webp",
    biography: [
      "Born and raised near Dallas, Texas, Aaron grew up spending his days on the lakes of Texas, wakeboarding and enjoying just about anything that involved being on the water. What started as a love for watersports eventually turned into a lifelong career beneath the surface.",
      "Aaron became a certified scuba instructor in 2009 and hasn't looked back since. He joined the Sea Saba crew in 2011, bringing his Texas-sized personality, passion for diving, and love of the ocean to the tiny island of Saba.",
      "With well over a decade of experience exploring Saba's underwater world, Aaron knows these waters like few others. He's also a licensed 100-ton offshore captain with the U.S. Coast Guard and a certified Lionfish Hunting Instructor. Whether he's behind the helm, guiding divers through Saba's spectacular underwater landscapes, or sharing his knowledge of marine conservation, Aaron brings years of hands-on experience and a healthy dose of Texas charm to every adventure.",
      "Aaron loves Third Encounter for its extraordinary underwater topography. In his words, \"There's nothing else quite like it in this part of the world.\"",
      "Aaron proudly claims the title of Saba's biggest Texas football fan. He's also a serious enthusiast of Mexican food and hot sauce, two things that can be surprisingly hard to find on a tiny Caribbean island. And if you ask him how many languages he speaks, he'll tell you two: English and American. Don't bother asking which one he's more fluent in!",
    ],
    qualifications: [
      "U.S. Coast Guard 100-Ton Offshore Captain's License",
      "Open Water Scuba Instructor",
      "Lionfish Hunting Instructor",
    ],
    experience: [
      "Became a certified scuba instructor in 2009",
      "Joined the Sea Saba crew in 2011",
    ],
    interests: ["Texas football", "Mexican food", "Hot sauce"],
    favoriteDiveSites: ["Third Encounter"],
    funFact: "Aaron proudly claims the title of Saba's biggest Texas football fan, and says he speaks two languages, English and American.",
  },
  {
    slug: "lenny",
    name: "Lenny",
    fullName: "Lenroy Sutherland",
    title: "Divemaster & Boat Captain",
    bio: "Born and raised in Sandy Bay, St. Vincent and the Grenadines, Lenroy came to Saba during the COVID-19 pandemic and turned a vacation into a new life. He progressed from Open Water Diver to Divemaster with Sea Saba and is also a boat captain and certified Level 2 electrician.",
    image: "/images/optimized/lenny.webp",
    languages: ["English"],
    objectPosition: "center 100%",
    biography: [
      "Born and raised in the beautiful community of Trench Town, Sandy Bay, in St. Vincent and the Grenadines, Lenroy grew up with the ocean practically in his backyard. His childhood was filled with fishing, driving boats, farming, and exploring the outdoors, building a lifelong connection to the sea and a love for adventure.",
      "But Lenroy wasn't just at home on the water. He was also one of the top-performing students at Sandy Bay Secondary School before continuing his education in Agricultural Science and Entrepreneurship at St. Vincent and the Grenadines Community College.",
      "His journey to Saba began with what was supposed to be a simple vacation during the COVID-19 pandemic. As sometimes happens on this little island, Saba had other plans! After making great friends and discovering Sea Saba, Lenroy found himself falling in love with scuba diving. What started with his Open Water certification quickly grew into a passion, eventually taking him all the way to becoming a Divemaster.",
      "Today, Lenroy brings an impressive mix of skills to the Sea Saba crew. As a Divemaster, Boat Captain, and certified Level 2 Electrician, he's equally comfortable exploring beneath the waves, navigating above them, or figuring out how to fix something that's stopped working.",
      "With his lifelong connection to the Caribbean Sea and his easygoing island spirit, Lenroy loves sharing the beauty of Saba's underwater world with visitors from around the globe.",
      "When he's not diving or captaining a boat, you'll probably still find Lenroy somewhere near the water, whether he's spearfishing or heading offshore for a day of fishing. He's also a cricket enthusiast and enjoys creating social media content, so don't be surprised if you find yourself making an appearance in one of his videos!",
    ],
    qualifications: [
      "Divemaster",
      "Boat Captain",
      "Certified Level 2 Electrician",
    ],
    experience: [
      "Progressed from Open Water Diver to Divemaster with Sea Saba",
      "Studied Agricultural Science and Entrepreneurship at St. Vincent and the Grenadines Community College",
    ],
    interests: ["Spearfishing", "Fishing", "Cricket", "Creating social media content"],
    funFact: "Lenny is known as Captain Giggles, and if you appear in one of his social media videos, don't be surprised.",
  },
  {
    slug: "robins",
    name: "Robins",
    fullName: "Pierre \"Robins\" Antoine",
    title: "Divemaster & Boat Captain",
    bio: "Originally from Montrouis, Haiti, Robins worked as a dive guide and boat captain before moving to Saba in 2022. Known for his calm patience, exceptional boat handling, and infectious smile, he has a special talent for helping new divers feel comfortable.",
    image: "/images/optimized/robins.webp",
    objectPosition: "center 100%",
    languages: ["English", "French", "Spanish", "Haitian Creole"],
    biography: [
      "Originally from Haiti, Robins grew up in the coastal town of Montrouis, where life revolved around the outdoors. Whether playing sports, kayaking, or spending time in the water, he developed a natural connection to the ocean from an early age.",
      "That love for the water eventually became a career. Robins worked as a dive guide and boat captain at Club Med, Moulin Sur Mer, and Marina Blue in Haiti, developing exceptional boat-handling skills and a passion for sharing the underwater world with others.",
      "In 2022, Robins moved to Saba with his two children to join the Sea Saba crew, bringing his experience, easygoing personality, and infectious smile along with him.",
      "Known for his remarkably calm demeanor and seemingly endless patience, Robins has a special talent for making people feel comfortable in the water. He's particularly wonderful with beginner divers, helping turn nervous first-timers into confident underwater explorers. Whether he's behind the wheel of a dive boat or guiding guests beneath the surface, Robins has a way of making everyone feel like they're in good hands.",
      "And while his boat-handling skills are impressive, it's his warmth, humor, and positive attitude that make him such a memorable part of the Sea Saba experience. It's hard to spend a day with Robins and not leave with a smile!",
      "Robins is widely regarded as the best dancer at Sea Saba, and he's not afraid to prove it! He also possesses what the rest of the crew considers a nearly supernatural ability to conserve air underwater. There's a running joke that Robins can head out on a dive and return with more air than he started with. We're still trying to figure out how he does it!",
    ],
    qualifications: [
      "Divemaster",
      "Rescue Diver",
      "Advanced Open Water Diver",
      "Open Water Diver",
      "Adult and Child First Aid",
      "Oxygen Provider",
      "VHF Operator",
      "Equipment Operator",
    ],
    experience: [
      "Worked as a dive guide and boat captain at Club Med, Moulin Sur Mer, and Marina Blue in Haiti",
      "Joined the Sea Saba crew in 2022",
    ],
    interests: ["Diving", "Dancing", "Being on the water"],
    funFact: "Robins is widely regarded as the best dancer at Sea Saba, and the crew jokes that he can return from a dive with more air than he started with.",
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
    fullName: "Julijana Masic",
    title: "Dive Professional",
    bio: "Born in Serbia and raised in Cuba, Julijana first discovered scuba diving through a school underwater cleanup at age 10. An adventurous diver with a passion for cave and sidemount diving, she loves Saba's marine life, especially the smaller and stranger creatures.",
    image: "/images/optimized/julijana.webp",
    languages: ["English", "Serbian", "Spanish"],
    biography: [
      "Born in Serbia and raised in Cuba from the age of four, Julijana's love for the underwater world began in an unexpected way: picking up trash! At just 10 years old, she was introduced to scuba diving during a school-organized underwater cleanup, and it didn't take long for her to fall in love with the ocean.",
      "Although life eventually took her in other directions, Julijana rediscovered diving during the COVID pandemic, and this time there was no turning back. When she realized that people could actually get paid to take others diving, she knew she'd found her calling. After all, getting paid to share something you love hardly feels like work!",
      "An adventurous diver with a particular passion for cave diving and sidemount diving, Julijana loves exploring the underwater world and discovering all its hidden surprises. From dramatic pinnacles to the tiniest sea creatures, her enthusiasm for marine life is infectious. And while Saba has already given her plenty of incredible underwater experiences, there's still one encounter at the top of her wish list: seeing a whale while diving!",
      "Asking Julijana to pick just one favorite dive site is apparently impossible. She blames it on being a Gemini!",
      "She loves Core Gut for its magical \"Smurf Village\" of mushroom-shaped corals, Third Encounter for its spectacular pinnacle, Man O'War Shoals, and just about everything in the Tent Reef area, especially the mantis shrimp and sea slugs. The smaller and stranger the marine life, the better!",
      "Despite her adventurous spirit, Julijana has perfected the art of doing absolutely nothing. Her days off often involve staying in her pajamas with a good book, an activity so well established that the crew now calls them \"Juli Days.\"",
      "When she's feeling more energetic, she loves yoga and dreams of one day helping bring rock climbing to Saba. Because apparently, exploring underwater caves isn't quite adventurous enough!",
    ],
    experience: [
      "Introduced to scuba diving at age 10 during a school-organized underwater cleanup",
      "Rediscovered diving during the COVID pandemic",
    ],
    interests: ["Cave diving", "Sidemount diving", "Yoga", "Reading", "Rock climbing", "Marine life"],
    favoriteDiveSites: ["Core Gut", "Third Encounter", "Man O'War Shoals", "Tent Reef"],
    funFact: "Julijana has perfected the art of doing absolutely nothing; the crew calls her pajama-and-book days \"Juli Days.\"",
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
