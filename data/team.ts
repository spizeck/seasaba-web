/**
 * Sea Saba crew roster — single source of truth for the about-page team
 * carousel and Person structured data. Facts here appear in schema; keep
 * every field accurate to the person it describes.
 */

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image?: string;
  objectPosition?: string;
  funFact?: string;
  languages?: string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Mel",
    title: "Guest Services Manager",
    bio: "A Saba resident for over 20 years, Mel is your go-to source for island tips, hidden gems, and neighboring island adventures. After spending 12 years with Sea Saba, she recently returned to the team and will likely be your first point of contact. When she's not helping guests plan their perfect trip, you'll probably find her hiking one of Saba's trails or dreaming up new ideas for the shop.",
    image: "/images/optimized/mel.webp",
    languages: ["English", "Dutch", "German"],
    objectPosition: "center 30%",
  },
  {
    name: "Jeanine & Marc",
    title: "Dive Operations Manager & Dive Instructors",
    bio: "Originally from the Netherlands, Jeanine and Marc arrived on Saba after years working in the Maldives. Jeanine is the organizational force behind Sea Saba, keeping everything running smoothly, while Marc is always chasing his next adventure. Whether underwater with a camera or on a snowboard, he rarely sits still. Together, they bring experience, laughter, and the welcoming atmosphere that keeps guests coming back.",
    image: "/images/optimized/marc-and-jeanine.webp",
    languages: ["English", "Dutch", "German"],
  },
  {
    name: "Otto",
    title: "Head Boat Captain & Dive Instructor",
    bio: "Born and raised on Saba, Otto has been diving and running boats for decades. He doesn't have much of a filter, loves to laugh, and believes diving should always be an adventure. A passionate technical diver and fisherman, Otto is happiest when he's on the water, below it, or telling stories about both.",
    image: "/images/optimized/otto.webp",
    languages: ["English", "Spanish"],
    funFact: "Sea Saba's first Divemaster in 1985",
  },
  {
    name: "Aaron",
    title: "Senior Boat Captain & Dive Instructor",
    bio: "Originally from the United States, Aaron has spent more than 14 years with Sea Saba. A USCG 100-ton Master Captain and instructor, he's known for his calm professionalism and easygoing personality. Off the boat, you'll usually find him watching Texas football or spoiling his cats. His experience and sense of humor have made him a favorite with guests and crew alike.",
    languages: ["English"],
    image: "/images/optimized/aaron.webp",
  },
  {
    name: "Lenny",
    title: "Boat Captain & Divemaster",
    bio: "Originally from St. Vincent, Lenny earned every certification along the way, progressing from Open Water Diver to Divemaster with Sea Saba. A guest favorite and sunset cruise entertainer, he's known for his big smile, great sense of humor, and ability to make everyone feel like part of the family.",
    image: "/images/optimized/lenny.webp",
    languages: ["English"],
    objectPosition: "center 100%",
    funFact: "Lenny is known as Captain Giggles.",
  },
  {
    name: "Robins",
    title: "Boat Captain & Divemaster",
    bio: "Originally from Haiti, Robins combines excellent boat handling with a passion for diving and a personality that keeps everyone smiling. Known for his humor, easygoing attitude, and love of dancing, he's happiest when he's on the water, underwater, or finding a reason to celebrate. Guests quickly discover that a day with Robins is never boring.",
    image: "/images/optimized/robins.webp",
    objectPosition: "center 100%",
    languages: ["English", "French", "Spanish", "Haitian Creole"],
  },
  {
    name: "Lionel",
    title: "Dive Instructor",
    bio: "A Saban native, freelance instructor, and harbor master, Lionel simply can't stay away from the ocean. Whether he's leading REEF surveys, hunting lionfish, or sharing his love of Saba's reefs with guests, he's happiest in the water. If there's a chance to dive, chances are Lionel is already geared up.",
    languages: ["English"],
    image: "/images/optimized/lionel.webp",
    funFact: "Lionel is a professional smiler.",
  },
  {
    name: "Anthony",
    title: "Guest Transportation",
    bio: "Originally from Sint Maarten, Anthony is often the first friendly face guests meet on Saba. Loaded with island knowledge and always happy to share it, he loves introducing visitors to the people, history, and stories that make Saba special. A ride with Anthony is usually equal parts transportation and island tour.",
    image: "/images/optimized/anthony.webp",
    languages: ["English", "Spanish", "Dutch"],
    objectPosition: "center bottom",
  },
  {
    name: "Julijana",
    title: "Dive Instructor",
    bio: "Growing up in Cuba, Julijana developed a love for the ocean and adventure that eventually led her to technical diving. When she's not underwater, you'll likely find her practicing yoga or lost in a good book. Her calm energy and passion for exploration make every dive feel a little more special.",
    image: "/images/optimized/julijana.webp",
    languages: ["English", "Serbian", "Spanish"],
  },
  {
    name: "Gunner",
    title: "Dive Dog, American Vizsla",
    bio: "Gunner is Sea Saba's four-legged ambassador and chief food inspector. He loves meeting guests and making sure everyone feels welcome. From greeting divers at the dock to investigating unattended sandwiches, Gunner takes his responsibilities very seriously.",
    image: "/images/optimized/gunner-dive-dog.webp",
    languages: ["Woof"],
    funFact: "Do NOT leave food unattended in his presence.",
  },
];
