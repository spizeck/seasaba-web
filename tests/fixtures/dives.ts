import type { FirestoreDive, PublicDive } from "@/lib/firestore/dive-log";

export function rawDive(overrides: Partial<FirestoreDive> = {}): FirestoreDive {
  return { id: "dive-1", date: "2026-09-07", diveSlot: "10:30 am", boatId: "boat-1", diveSiteId: "site-1", diveGuides: ["Alex"], maxDepth: 21, waterTemperature: 28, sightings: [{ speciesId: "turtle", count: 2 }], ...overrides };
}
export function publicDive(overrides: Partial<PublicDive> = {}): PublicDive {
  return { id: "dive-1", date: "2026-09-07", diveSlot: "10:30 am", boat: "Test Boat", diveSite: "Tent Reef", diveGuide: "Alex", diveGuides: ["Alex"], maxDepth: 21, waterTemperature: 28, sightings: [{ speciesId: "turtle", speciesName: "Green Turtle", count: 2 }], ...overrides };
}
export function diveData(dives = [rawDive()]) {
  return {
    dives,
    sites: new Map([["site-1", { id: "site-1", name: "Tent Reef" }], ["site-2", { id: "site-2", name: "Diamond Rock" }]]),
    boats: new Map([["boat-1", { id: "boat-1", name: "Test Boat" }]]),
    species: new Map([["turtle", { id: "turtle", name: "Green Turtle" }]]),
  };
}
