export interface SpeciesInfo {
  name: string;
  commonName?: string;
  scientificName?: string;
  conservationStatus?: string;
  description: string;
  habitat: string;
  funFact?: string;
  image?: string;
}

export const SPECIES_CATALOG: SpeciesInfo[] = [
  {
    name: "Atlantic Nurse Shark",
    commonName: "Nurse Shark",
    scientificName: "Ginglymostoma cirratum",
    conservationStatus: "Vulnerable",
    description:
      "A bottom-dwelling shark with barbels near its mouth. Nurse sharks are generally calm around divers and are often seen resting under ledges or cruising slowly along the reef.",
    habitat: "Sandy bottoms, reef ledges, caves, and sheltered reef areas around Saba.",
    funFact:
      "Nurse sharks can pump water over their gills, allowing them to rest motionless on the seafloor.",
  },
  {
    name: "Blacktip Reef Shark",
    commonName: "Blacktip Reef Shark",
    scientificName: "Carcharhinus melanopterus",
    conservationStatus: "Vulnerable",
    description:
      "A small to medium-sized reef shark recognized by dark markings on its fins. This species is included because it appears on the marine park species of concern list used by the dive log.",
    habitat: "Reef edges, shallow reef flats, and coastal reef systems.",
    funFact:
      "Blacktip reef sharks are active predators that often patrol the same reef areas repeatedly.",
  },
  {
    name: "Caribbean Reef Shark",
    commonName: "Caribbean Reef Shark",
    scientificName: "Carcharhinus perezi",
    conservationStatus: "Endangered",
    description:
      "A sleek reef predator often seen patrolling deeper reef edges, walls, and offshore pinnacles. It is one of the signature shark species of Caribbean reef systems.",
    habitat: "Deep reefs, walls, pinnacles, and offshore reef slopes.",
    funFact:
      "Caribbean reef sharks help keep reef ecosystems balanced by removing weak or injured prey.",
  },
  {
    name: "Common Octopus",
    commonName: "Octopus",
    scientificName: "Octopus spp.",
    description:
      "A highly intelligent, soft-bodied animal famous for camouflage, problem solving, and quick color changes. Octopuses are often seen tucked into reef holes or moving across rubble at dusk or night.",
    habitat: "Reefs, rocky areas, rubble, and crevices.",
    funFact: "Octopuses have three hearts and blue blood.",
  },
  {
    name: "Fingerprint Cyphoma",
    commonName: "Fingerprint Cyphoma Snail",
    scientificName: "Cyphoma signatum",
    conservationStatus: "Not Evaluated",
    description:
      "A small, colorful marine snail often found on gorgonians. Its patterned mantle gives it the fingerprint-like appearance that inspired its name.",
    habitat: "Sea fans, sea rods, and other gorgonian corals.",
    funFact:
      "The visible pattern is on the living mantle tissue, not the shell itself.",
  },
  {
    name: "Flamingo Tongue",
    commonName: "Flamingo Tongue Snail",
    scientificName: "Cyphoma gibbosum",
    conservationStatus: "Not Evaluated",
    description:
      "A small, brightly patterned marine snail commonly seen on sea fans and soft corals. It is one of the most recognizable macro subjects in the Caribbean.",
    habitat: "Gorgonians, sea fans, and sea rods.",
    funFact:
      "Like other cyphomas, the colorful pattern comes from its mantle covering the shell.",
  },
  {
    name: "Flying Gurnard",
    commonName: "Flying Gurnard",
    scientificName: "Dactylopterus volitans",
    conservationStatus: "Least Concern",
    description:
      "An unusual bottom-dwelling fish with large, wing-like pectoral fins. When startled, it spreads its fins dramatically as it moves across the sand.",
    habitat: "Sandy bottoms, rubble patches, and reef edges.",
    funFact:
      "Despite the name, flying gurnards do not fly. Their broad fins are used for display and movement along the bottom.",
  },
  {
    name: "Green Turtle",
    commonName: "Green Sea Turtle",
    scientificName: "Chelonia mydas",
    conservationStatus: "Endangered",
    description:
      "A large sea turtle that feeds mainly on seagrass and algae as an adult. Green turtles are calm, graceful swimmers and are often a highlight for visiting divers.",
    habitat: "Seagrass beds, reefs, and shallow coastal areas.",
    funFact:
      "Green turtles are named for the greenish color of their body fat, not their shell.",
  },
  {
    name: "Hawksbill Turtle",
    commonName: "Hawksbill Sea Turtle",
    scientificName: "Eretmochelys imbricata",
    conservationStatus: "Critically Endangered",
    description:
      "A critically endangered sea turtle with a narrow, beak-like mouth used to feed on sponges and other reef organisms.",
    habitat: "Coral reefs, rocky outcrops, ledges, and sponge-rich reef areas.",
    funFact:
      "Hawksbills help reef health by feeding on sponges that can otherwise compete with corals.",
  },
  {
    name: "Leech Headshield Slug",
    commonName: "Leech Headshield Slug",
    scientificName: "Chelidonura hirundinina",
    conservationStatus: "Not Evaluated",
    description:
      "A small sea slug with a distinctive head shield and dark, patterned body. It is a favorite find for patient macro observers.",
    habitat: "Reef rubble, algae-covered areas, and shallow reef zones.",
    funFact:
      "Headshield slugs use their broad head area to search through sediment and surfaces for food.",
  },
  {
    name: "Lettuce Sea Slug",
    commonName: "Lettuce Sea Slug",
    scientificName: "Elysia crispata",
    conservationStatus: "Vulnerable",
    description:
      "A frilly green sea slug with ruffled edges that resemble lettuce leaves. It is often seen on shallow reef surfaces and algae-covered areas.",
    habitat: "Shallow reefs, algae-covered rocks, and rubble areas.",
    funFact:
      "Lettuce sea slugs can retain chloroplasts from algae they eat, allowing them to gain energy from sunlight.",
  },
  {
    name: "Lionfish (Alive)",
    commonName: "Lionfish",
    scientificName: "Pterois volitans",
    conservationStatus: "Least Concern",
    description:
      "An invasive Indo-Pacific predator now established in the Caribbean. Lionfish have venomous spines and can consume large numbers of juvenile reef fish.",
    habitat: "Reefs, ledges, walls, rubble, and artificial structures.",
    funFact:
      "Lionfish are invasive in the Caribbean, which is why sightings are important for monitoring and management.",
  },
  {
    name: "Lionfish (Dead)",
    commonName: "Lionfish",
    scientificName: "Pterois volitans",
    conservationStatus: "Least Concern",
    description:
      "A logged dead lionfish sighting helps track removal and control efforts for this invasive species in the marine park.",
    habitat: "Reefs, ledges, walls, rubble, and artificial structures.",
    funFact:
      "Recording removed lionfish can help show where control efforts are happening over time.",
  },
  {
    name: "Long-Snout Seahorse",
    commonName: "Longsnout Seahorse",
    scientificName: "Hippocampus reidi",
    conservationStatus: "Least Concern",
    description:
      "A delicate seahorse species with a long snout and prehensile tail. It is usually found clinging to soft corals, algae, or other small structures.",
    habitat: "Sea fans, algae, shallow reefs, seagrass, and sheltered reef areas.",
    funFact:
      "Male seahorses carry the developing young in a brood pouch.",
  },
  {
    name: "Longlure Frogfish",
    commonName: "Longlure Frogfish",
    scientificName: "Antennarius multiocellatus",
    conservationStatus: "Least Concern",
    description:
      "A camouflaged anglerfish that uses a lure to attract prey. It often blends perfectly with sponges, algae, or reef structure.",
    habitat: "Sponges, rubble, reef ledges, and artificial structures.",
    funFact:
      "Frogfish can strike extremely quickly and swallow prey nearly as large as themselves.",
  },
  {
    name: "Longspine Sea Urchin",
    commonName: "Longspine Urchin",
    scientificName: "Diadema antillarum",
    conservationStatus: "Not Evaluated",
    description:
      "A black sea urchin with very long, thin spines. It plays an important role in grazing algae and helping maintain reef balance.",
    habitat: "Reefs, rocky bottoms, crevices, and shallow reef flats.",
    funFact:
      "Longspine urchins are important algae grazers on Caribbean reefs.",
  },
  {
    name: "Magnificent Sea Urchin",
    commonName: "Magnificent Urchin",
    scientificName: "Astropyga magnifica",
    conservationStatus: "Not Evaluated",
    description:
      "A large and striking sea urchin with bold colors and long spines. It is usually seen on sand or rubble near reef structures.",
    habitat: "Sandy bottoms, rubble patches, and reef slopes.",
    funFact:
      "Its bright colors make it one of the most visually striking urchins in the region.",
  },
  {
    name: "Nassau Grouper",
    commonName: "Nassau Grouper",
    scientificName: "Epinephelus striatus",
    conservationStatus: "Critically Endangered",
    description:
      "A large reef fish with bold bars and a heavy body. Nassau groupers are important reef predators and are highly vulnerable due to historical overfishing.",
    habitat: "Coral reefs, walls, ledges, and deeper reef slopes.",
    funFact:
      "Nassau groupers gather at spawning sites, which makes protecting known aggregation areas especially important.",
  },
  {
    name: "Pencil Sea Urchin",
    commonName: "Pencil Urchin",
    scientificName: "Heterocentrotus mamillatus",
    conservationStatus: "Not Evaluated",
    description:
      "A sturdy sea urchin with thick, blunt spines that look like pencils. It is usually found tucked into crevices or among rocks.",
    habitat: "Rocky reefs, rubble areas, and reef crevices.",
    funFact:
      "Its thick spines help it wedge securely into reef structure.",
  },
  {
    name: "Red-Tipped Sea Goddess",
    commonName: "Red-Tipped Sea Goddess",
    scientificName: "Chromolaichma sedna",
    conservationStatus: "Not Evaluated",
    description:
      "A colorful nudibranch sought after by macro photographers. Its bright markings make it a memorable find on close inspection of the reef.",
    habitat: "Reefs, rubble, sponges, and algae-covered reef surfaces.",
    funFact:
      "Nudibranchs are shell-less sea slugs, many of which use chemical defenses from their food.",
  },
  {
    name: "Reef Urchin",
    commonName: "Reef Urchin",
    scientificName: "Echinometra viridis",
    conservationStatus: "Not Evaluated",
    description:
      "A small reef-dwelling urchin often found in crevices and rocky reef areas. It contributes to reef grazing and bioerosion.",
    habitat: "Rocky reefs, crevices, shallow reef flats, and rubble areas.",
    funFact:
      "Some reef urchins slowly wear away rock and reef surfaces as they graze.",
  },
  {
    name: "Roughtail Stingray",
    commonName: "Roughtail Stingray",
    scientificName: "Bathytoshia centroura",
    conservationStatus: "Vulnerable",
    description:
      "A large stingray with a powerful body and rough-textured tail. It is usually seen resting on or moving over sandy bottoms.",
    habitat: "Sandy bottoms, reef edges, and deeper coastal areas.",
    funFact:
      "Roughtail stingrays can grow much larger than the southern stingrays commonly seen by divers.",
  },
  {
    name: "Sea Egg",
    commonName: "Sea Egg Urchin",
    scientificName: "Tripneustes ventricosus",
    conservationStatus: "Not Evaluated",
    description:
      "A round sea urchin often covered with bits of shell, algae, or debris for camouflage. It is an important grazer in shallow marine habitats.",
    habitat: "Seagrass beds, sandy areas, rubble, and shallow reefs.",
    funFact:
      "Sea eggs often use tube feet to hold debris on top of themselves as camouflage.",
  },
  {
    name: "Shortfin Pipefish",
    commonName: "Shortfin Pipefish",
    scientificName: "Cosmocampus elucens",
    description:
      "A slender relative of seahorses that moves quietly through reef structure. Its narrow body and subtle colors make it easy to overlook.",
    habitat: "Reef crevices, rubble, algae, and sheltered reef areas.",
    funFact:
      "Pipefish are close relatives of seahorses, and males carry the eggs.",
  },
  {
    name: "Shortnose Batfish",
    commonName: "Shortnose Batfish",
    scientificName: "Ogcocephalus nasutus",
    conservationStatus: "Least Concern",
    description:
      "An odd-shaped bottom-dwelling fish that appears to walk across the seafloor using modified fins. It is one of the Caribbean's most unusual reef creatures.",
    habitat: "Sandy bottoms, rubble slopes, and reef edges.",
    funFact:
      "Batfish are poor swimmers and usually move by walking along the bottom.",
  },
  {
    name: "Southern Stingray",
    commonName: "Southern Stingray",
    scientificName: "Hypanus americanus",
    conservationStatus: "Not Threatened",
    description:
      "A diamond-shaped ray often seen resting in the sand or gliding along the bottom. It uses electroreceptors to locate hidden prey.",
    habitat: "Sandy bottoms, seagrass beds, and reef sand channels.",
    funFact:
      "Southern stingrays can bury themselves in sand with only their eyes and spiracles visible.",
  },
  {
    name: "Spotted Eagle Ray",
    commonName: "Spotted Eagle Ray",
    scientificName: "Aetobatus narinari",
    conservationStatus: "Endangered",
    description:
      "A graceful ray with pointed wings, a long tail, and a spotted back. It often glides over reefs and sand channels searching for mollusks and crustaceans.",
    habitat: "Reefs, sandy channels, reef slopes, and open water near reef edges.",
    funFact:
      "Spotted eagle rays are strong swimmers and can sometimes leap completely out of the water.",
  },
  {
    name: "Tiger Grouper",
    commonName: "Tiger Grouper",
    scientificName: "Mycteroperca tigris",
    conservationStatus: "Data Deficient",
    description:
      "A large reef grouper with bold patterning and a powerful build. It is an important predator on healthy Caribbean reefs.",
    habitat: "Coral reefs, ledges, walls, and deeper reef slopes.",
    funFact:
      "Tiger groupers are ambush predators that rely on structure and camouflage.",
  },
  {
    name: "Variegated Urchin",
    commonName: "Variegated Urchin",
    scientificName: "Lytechinus variegatus",
    conservationStatus: "Not Evaluated",
    description:
      "A rounded sea urchin that varies in color and is often associated with seagrass, sand, and shallow reef areas.",
    habitat: "Seagrass beds, sandy bottoms, rubble, and shallow reefs.",
    funFact:
      "Variegated urchins often cover themselves with shells, algae, or debris.",
  },
  {
    name: "White-Nose Pipefish",
    commonName: "White-Nose Pipefish",
    scientificName: "Cosmocampus albirostris",
    conservationStatus: "Least Concern",
    description:
      "A slender, cryptic pipefish that hides among reef structure and algae. It is a rewarding find for careful macro observers.",
    habitat: "Reefs, rubble, crevices, algae, and sheltered reef areas.",
    funFact:
      "Pipefish are related to seahorses and share the unusual trait of male parental care.",
  },
  {
    name: "Yellowfin Grouper",
    commonName: "Yellowfin Grouper",
    scientificName: "Mycteroperca venenosa",
    conservationStatus: "Not Threatened",
    description:
      "A large reef grouper with yellowish fins and a strong body. It is an important reef predator and a notable species for monitoring.",
    habitat: "Coral reefs, ledges, walls, and deeper reef areas.",
    funFact:
      "Groupers often use reef structure as ambush cover while hunting smaller fish.",
  },
];

export const SPECIES_MAP = Object.fromEntries(
  SPECIES_CATALOG.map((s) => [s.name, s])
) as Record<string, SpeciesInfo | undefined>;

/** Try to find a species profile by a common sighting name. */
export function findSpeciesInfo(name: string): SpeciesInfo | undefined {
  const direct = SPECIES_MAP[name];
  if (direct) return direct;

  const lower = name.toLowerCase();

  return SPECIES_CATALOG.find(
    (s) =>
      s.commonName?.toLowerCase().includes(lower) ||
      s.scientificName?.toLowerCase().includes(lower) ||
      s.name.toLowerCase().includes(lower)
  );
}