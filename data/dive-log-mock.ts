export type DiveSlot = "morning-1" | "morning-2" | "afternoon" | "night";

export interface Sighting {
  speciesName: string;
  count?: number;
}

export interface PublicDive {
  id: string;
  date: string;
  diveSlot: DiveSlot;
  boat: string;
  diveGuide: string;
  diveSite: string;
  maxDepth?: number;
  waterTemperature?: number;
  driftDive?: boolean;
  sightings: Sighting[];
}

export const MOCK_DIVES: PublicDive[] = [
  {
    id: "dive-001",
    date: "2026-06-28",
    diveSlot: "morning-1",
    boat: "Fin & Tonic",
    diveGuide: "Lenny",
    diveSite: "Third Encounter",
    maxDepth: 108,
    waterTemperature: 82,
    driftDive: false,
    sightings: [
      { speciesName: "Caribbean reef shark", count: 3 },
      { speciesName: "Green turtle", count: 1 },
      { speciesName: "Queen angelfish", count: 2 },
      { speciesName: "Spotted eagle ray", count: 1 },
    ],
  },
  {
    id: "dive-002",
    date: "2026-06-28",
    diveSlot: "morning-2",
    boat: "Fin & Tonic",
    diveGuide: "Lenny",
    diveSite: "Tent Reef",
    maxDepth: 72,
    waterTemperature: 82,
    driftDive: false,
    sightings: [
      { speciesName: "Green turtle", count: 2 },
      { speciesName: "Nurse shark", count: 1 },
      { speciesName: "Spiny lobster", count: 4 },
      { speciesName: "Flying gurnard", count: 1 },
    ],
  },
  {
    id: "dive-003",
    date: "2026-06-27",
    diveSlot: "morning-1",
    boat: "Shark Bait",
    diveGuide: "Otto",
    diveSite: "Man O' War Shoals",
    maxDepth: 115,
    waterTemperature: 82,
    driftDive: true,
    sightings: [
      { speciesName: "Caribbean reef shark", count: 5 },
      { speciesName: "Southern stingray", count: 2 },
      { speciesName: "Spotted eagle ray", count: 3 },
    ],
  },
  {
    id: "dive-004",
    date: "2026-06-27",
    diveSlot: "morning-2",
    boat: "Shark Bait",
    diveGuide: "Otto",
    diveSite: "Diamond Rock",
    maxDepth: 68,
    waterTemperature: 83,
    driftDive: false,
    sightings: [
      { speciesName: "Green turtle", count: 1 },
      { speciesName: "Queen angelfish", count: 3 },
      { speciesName: "Spiny lobster", count: 2 },
      { speciesName: "Nurse shark", count: 1 },
    ],
  },
  {
    id: "dive-005",
    date: "2026-06-26",
    diveSlot: "morning-1",
    boat: "Northern Sky",
    diveGuide: "Lionel",
    diveSite: "Twilight Zone",
    maxDepth: 122,
    waterTemperature: 81,
    driftDive: false,
    sightings: [
      { speciesName: "Caribbean reef shark", count: 2 },
      { speciesName: "Spotted eagle ray", count: 1 },
      { speciesName: "Queen angelfish", count: 1 },
    ],
  },
  {
    id: "dive-006",
    date: "2026-06-26",
    diveSlot: "morning-2",
    boat: "Northern Sky",
    diveGuide: "Lionel",
    diveSite: "Hot Springs",
    maxDepth: 58,
    waterTemperature: 84,
    driftDive: false,
    sightings: [
      { speciesName: "Green turtle", count: 3 },
      { speciesName: "Flying gurnard", count: 2 },
      { speciesName: "Southern stingray", count: 1 },
      { speciesName: "Spiny lobster", count: 3 },
    ],
  },
  {
    id: "dive-007",
    date: "2026-06-25",
    diveSlot: "afternoon",
    boat: "Fin & Tonic",
    diveGuide: "Lenny",
    diveSite: "Ladder Labyrinth",
    maxDepth: 65,
    waterTemperature: 82,
    driftDive: false,
    sightings: [
      { speciesName: "Nurse shark", count: 2 },
      { speciesName: "Spiny lobster", count: 6 },
      { speciesName: "Queen angelfish", count: 2 },
    ],
  },
  {
    id: "dive-008",
    date: "2026-06-25",
    diveSlot: "morning-1",
    boat: "Shark Bait",
    diveGuide: "Aaron",
    diveSite: "Third Encounter",
    maxDepth: 105,
    waterTemperature: 82,
    driftDive: false,
    sightings: [
      { speciesName: "Caribbean reef shark", count: 4 },
      { speciesName: "Spotted eagle ray", count: 2 },
      { speciesName: "Green turtle", count: 1 },
    ],
  },
  {
    id: "dive-009",
    date: "2026-06-24",
    diveSlot: "night",
    boat: "Fin & Tonic",
    diveGuide: "Lenny",
    diveSite: "Tent Reef",
    maxDepth: 45,
    waterTemperature: 83,
    driftDive: false,
    sightings: [
      { speciesName: "Nurse shark", count: 3 },
      { speciesName: "Southern stingray", count: 1 },
      { speciesName: "Spiny lobster", count: 8 },
    ],
  },
  {
    id: "dive-010",
    date: "2026-06-24",
    diveSlot: "morning-1",
    boat: "Northern Sky",
    diveGuide: "Otto",
    diveSite: "Man O' War Shoals",
    maxDepth: 112,
    waterTemperature: 81,
    driftDive: true,
    sightings: [
      { speciesName: "Caribbean reef shark", count: 6 },
      { speciesName: "Spotted eagle ray", count: 4 },
      { speciesName: "Southern stingray", count: 2 },
    ],
  },
  {
    id: "dive-011",
    date: "2026-06-23",
    diveSlot: "morning-2",
    boat: "Fin & Tonic",
    diveGuide: "Lionel",
    diveSite: "Diamond Rock",
    maxDepth: 70,
    waterTemperature: 82,
    driftDive: false,
    sightings: [
      { speciesName: "Green turtle", count: 2 },
      { speciesName: "Flying gurnard", count: 1 },
      { speciesName: "Queen angelfish", count: 4 },
      { speciesName: "Spiny lobster", count: 3 },
    ],
  },
  {
    id: "dive-012",
    date: "2026-06-23",
    diveSlot: "morning-1",
    boat: "Shark Bait",
    diveGuide: "Aaron",
    diveSite: "Hot Springs",
    maxDepth: 55,
    waterTemperature: 84,
    driftDive: false,
    sightings: [
      { speciesName: "Green turtle", count: 2 },
      { speciesName: "Southern stingray", count: 3 },
      { speciesName: "Flying gurnard", count: 2 },
      { speciesName: "Nurse shark", count: 1 },
    ],
  },
];
