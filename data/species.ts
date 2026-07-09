export interface SpeciesInfo {
  name: string;
  commonName?: string;
  scientificName?: string;
  description: string;
  habitat: string;
  funFact?: string;
  image?: string;
}

export const SPECIES_CATALOG: SpeciesInfo[] = [
  {
    name: "Green Sea Turtle",
    commonName: "Green Turtle",
    scientificName: "Chelonia mydas",
    description:
      "A large, gentle herbivore that grazes on seagrass and algae. Adults are easily recognized by their rounded heads and smooth, heart-shaped shells.",
    habitat: "Seagrass beds, reefs, and shallow bays around Saba.",
    funFact: "Green sea turtles can hold their breath for up to five hours while resting.",
  },
  {
    name: "Hawksbill Sea Turtle",
    commonName: "Hawksbill Turtle",
    scientificName: "Eretmochelys imbricata",
    description:
      "A critically endangered sea turtle with a distinctive beak-like mouth and beautifully patterned shell. It feeds mainly on sponges.",
    habitat: "Coral reefs and rocky outcrops.",
    funFact: "Hawksbills play a vital role in reef health by eating sponges that would otherwise overgrow corals.",
  },
  {
    name: "Nurse Shark",
    commonName: "Nurse Shark",
    scientificName: "Ginglymostoma cirratum",
    description:
      "A bottom-dwelling shark with barbels near its mouth. It is generally docile and rests in groups under ledges during the day.",
    habitat: "Sandy bottoms, caves, and ledges, especially in Ladder Bay.",
    funFact: "Nurse sharks can pump water over their gills, allowing them to rest motionless on the seafloor.",
  },
  {
    name: "Caribbean Reef Shark",
    commonName: "Reef Shark",
    scientificName: "Carcharhinus perezii",
    description:
      "A sleek predator often seen patrolling the open water above Saba's pinnacles. It is curious but rarely aggressive toward divers.",
    habitat: "Deep pinnacles, walls, and offshore seamounts.",
    funFact: "Reef sharks can lose and replace thousands of teeth throughout their lifetime.",
  },
  {
    name: "Barracuda",
    commonName: "Great Barracuda",
    scientificName: "Sphyraena barracuda",
    description:
      "A long, silver predator with a fearsome appearance but generally shy behavior. Often seen hovering near divers.",
    habitat: "Reefs, drop-offs, and open water near pinnacles.",
    funFact: "Barracudas can swim in short bursts at speeds up to 35 mph.",
  },
  {
    name: "Spotted Eagle Ray",
    commonName: "Eagle Ray",
    scientificName: "Aetobatus narinari",
    description:
      "A graceful ray with a diamond-shaped body and spotted pattern. It glides over reefs and sand channels searching for mollusks.",
    habitat: "Sandy bottoms and coral reefs around Saba.",
    funFact: "Eagle rays are strong swimmers and have been known to leap completely out of the water.",
  },
  {
    name: "Giant Barrel Sponge",
    commonName: "Barrel Sponge",
    scientificName: "Xestospongia muta",
    description:
      "One of the largest sponge species in the Caribbean, often reaching the size of a small barrel. These sponges can live for decades.",
    habitat: "Deep reefs and pinnacles throughout the Saba Marine Park.",
    funFact: "Barrel sponges filter enormous volumes of water and can live for over 100 years.",
  },
  {
    name: "Black Coral",
    commonName: "Black Coral",
    scientificName: "Antipatharia",
    description:
      "Despite its name, black coral is usually white or red on the inside. Its dark skeleton is prized for jewelry.",
    habitat: "Deep walls and pinnacles where currents are stronger.",
    funFact: "Some black corals live for thousands of years, making them among the oldest animals on Earth.",
  },
  {
    name: "Gorgonian Sea Fan",
    commonName: "Sea Fan",
    scientificName: "Gorgonia",
    description:
      "A branching, fan-shaped soft coral that filters plankton from the water. Its flexible structure sways gracefully in the current.",
    habitat: "Reefs and walls with moderate to strong currents.",
    funFact: "Sea fan colonies are made up of thousands of tiny polyps working together.",
  },
  {
    name: "Caribbean Spiny Lobster",
    commonName: "Spiny Lobster",
    scientificName: "Panulirus argus",
    description:
      "A nocturnal crustacean that hides in crevices during the day. It has long antennae and no claws.",
    habitat: "Reefs, ledges, and rocky crevices.",
    funFact: "Spiny lobsters migrate in long lines across the seafloor during autumn.",
  },
  {
    name: "Octopus",
    commonName: "Octopus",
    scientificName: "Octopus vulgaris",
    description:
      "A highly intelligent master of camouflage. It can change color and texture in seconds to blend into its surroundings.",
    habitat: "Reefs, rubble, and rocky areas, especially at Tent Reef.",
    funFact: "Octopuses have three hearts and blue blood.",
  },
  {
    name: "Peacock Flounder",
    commonName: "Flounder",
    scientificName: "Bothus lunatus",
    description:
      "A flat fish that lies perfectly still on the sand, changing colors to match the bottom. Both eyes are on the same side of its head.",
    habitat: "Sandy bottoms and rubble patches.",
    funFact: "Flounders start life with one eye on each side, then one migrates as they mature.",
  },
  {
    name: "Frogfish",
    commonName: "Frogfish",
    scientificName: "Antennariidae",
    description:
      "A stocky, camouflaged anglerfish with a built-in lure used to attract prey. It walks along the bottom using its pectoral fins.",
    habitat: "Sponges, rubble, and artificial structures.",
    funFact: "Frogfish can swallow prey larger than their own heads.",
  },
  {
    name: "Seahorse",
    commonName: "Seahorse",
    scientificName: "Hippocampus",
    description:
      "A tiny, upright fish that clings to sea fans and grasses with its prehensile tail. It is one of the ocean's slowest swimmers.",
    habitat: "Shallow reefs, sea fans, and seagrass.",
    funFact: "Male seahorses carry and give birth to the young.",
  },
  {
    name: "Tarpon",
    commonName: "Tarpon",
    scientificName: "Megalops atlanticus",
    description:
      "A large, silvery fish famous for its acrobatic leaps. Juveniles often haunt dark caves and wrecks.",
    habitat: "Reefs, caves, and occasionally deep sites around Saba.",
    funFact: "Tarpon can gulp air at the surface, allowing them to survive in low-oxygen water.",
  },
  {
    name: "Atlantic Blue Tang",
    commonName: "Blue Tang",
    scientificName: "Acanthurus coeruleus",
    description:
      "A flat, oval-shaped surgeonfish that grazes algae from the reef. Juveniles are bright yellow.",
    habitat: "Coral reefs and rocky areas.",
    funFact: "Blue tangs have a sharp spine on each side of the tail that can cause painful cuts.",
  },
  {
    name: "French Angelfish",
    commonName: "French Angelfish",
    scientificName: "Pomacanthus paru",
    description:
      "A striking black-and-yellow angelfish often seen in pairs. It nips at sponges and algae.",
    habitat: "Reefs and coral formations.",
    funFact: "French angelfish form long-term monogamous pairs.",
  },
  {
    name: "Queen Angelfish",
    commonName: "Queen Angelfish",
    scientificName: "Holacanthus ciliaris",
    description:
      "A colorful reef fish with a bright blue body, yellow tail, and a distinctive 'crown' marking on its forehead.",
    habitat: "Coral reefs throughout Saba.",
    funFact: "The blue crown on its head gives the queen angelfish its royal name.",
  },
  {
    name: "Parrotfish",
    commonName: "Parrotfish",
    scientificName: "Scaridae",
    description:
      "A rainbow-colored fish with a beak-like mouth used to scrape algae from coral. It plays a key role in creating sandy beaches.",
    habitat: "Coral reefs and rocky areas.",
    funFact: "Parrotfish produce much of the white sand found on tropical beaches.",
  },
  {
    name: "Trumpetfish",
    commonName: "Trumpetfish",
    scientificName: "Aulostomus maculatus",
    description:
      "A long, thin predator that hovers vertically among sea fans to ambush small fish.",
    habitat: "Reefs and sea fan gardens.",
    funFact: "Trumpetfish often shadow larger fish to get closer to their prey undetected.",
  },
  {
    name: "Southern Stingray",
    commonName: "Stingray",
    scientificName: "Hypanus americanus",
    description:
      "A diamond-shaped ray that buries itself in the sand during the day. Its long tail carries a venomous barb.",
    habitat: "Sandy bottoms and seagrass beds.",
    funFact: "Stingrays use their sense of smell and special electroreceptors called ampullae of Lorenzini to find prey.",
  },
  {
    name: "Banded Coral Shrimp",
    commonName: "Coral Banded Shrimp",
    scientificName: "Stenopus hispidus",
    description:
      "A cleaner shrimp with bold red-and-white bands. It sets up cleaning stations to remove parasites from fish.",
    habitat: "Caves, ledges, and crevices on Saba's reefs.",
    funFact: "Coral banded shrimp are monogamous and pairs defend their territory together.",
  },
  {
    name: "Nudibranch",
    commonName: "Nudibranch",
    scientificName: "Nudibranchia",
    description:
      "A soft-bodied, shell-less sea slug known for its bright colors and intricate shapes. A favorite of macro photographers.",
    habitat: "Reefs, walls, and rubble with plenty of food.",
    funFact: "Nudibranchs are hermaphrodites, meaning each individual carries both male and female reproductive parts.",
  },
];

export const SPECIES_MAP = Object.fromEntries(
  SPECIES_CATALOG.map((s) => [s.name, s])
) as Record<string, SpeciesInfo | undefined>;

/** Try to find a species profile by a common sighting name. */
export function findSpeciesInfo(name: string): SpeciesInfo | undefined {
  const direct = SPECIES_MAP[name];
  if (direct) return direct;
  // Fuzzy match on common name or scientific name
  const lower = name.toLowerCase();
  return SPECIES_CATALOG.find(
    (s) =>
      s.commonName?.toLowerCase().includes(lower) ||
      s.scientificName?.toLowerCase().includes(lower) ||
      s.name.toLowerCase().includes(lower)
  );
}
