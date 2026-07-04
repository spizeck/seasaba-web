import { collection, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type UnitSystem = "metric" | "imperial";

export interface FirestoreSighting {
  speciesId: string;
  count?: number;
}

export interface FirestoreDive {
  id: string;
  date: string | Timestamp;
  diveSlot: string;
  boatId: string;
  diveGuide: string;
  diveSiteId: string;
  maxDepth?: number;
  waterTemperature?: number;
  createdBy?: string;
  sightings: FirestoreSighting[];
  createdAt?: Timestamp;
}

export interface FirestoreSite {
  id: string;
  name: string;
  depthRange?: string;
  region?: string;
  habitatType?: string;
  active?: boolean;
  protectedArea?: boolean;
}

export interface FirestoreSpecies {
  id: string;
  name: string;
  category?: string;
  active?: boolean;
  step?: number;
  iucnStatus?: string;
  scientificName?: string;
}

export interface FirestoreBoat {
  id: string;
  name: string;
  active?: boolean;
  maxDiveSlots?: number;
  capacity?: number;
  defaultDiveTimes?: Record<string, string>;
}

export interface PublicDive {
  id: string;
  date: string;
  diveSlot: string;
  boat: string;
  diveGuide: string;
  diveSite: string;
  maxDepth?: number;
  waterTemperature?: number;
  driftDive?: boolean;
  sightings: { speciesName: string; count?: number }[];
}

function toDateString(value: string | Timestamp): string {
  if (typeof value === "string") return value;
  if (value instanceof Timestamp) {
    const d = value.toDate();
    return d.toISOString().split("T")[0];
  }
  return "";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function convertDepth(meters: number | undefined, unit: UnitSystem): number | undefined {
  if (meters === undefined) return undefined;
  return unit === "imperial" ? Math.round(meters * 3.28084) : Math.round(meters);
}

export function convertTemperature(celsius: number | undefined, unit: UnitSystem): number | undefined {
  if (celsius === undefined) return undefined;
  return unit === "imperial" ? Math.round(celsius * 1.8 + 32) : Math.round(celsius);
}

export function depthUnit(unit: UnitSystem): string {
  return unit === "imperial" ? "ft" : "m";
}

export function temperatureUnit(unit: UnitSystem): string {
  return unit === "imperial" ? "°F" : "°C";
}

export async function fetchDiveLogData() {
  const [divesSnap, sitesSnap, speciesSnap, boatsSnap] = await Promise.all([
    getDocs(collection(db, "dives")),
    getDocs(collection(db, "sites")),
    getDocs(collection(db, "species")),
    getDocs(collection(db, "boats")),
  ]);

  const sites = new Map<string, FirestoreSite>();
  sitesSnap.docs.forEach((doc) => {
    const data = doc.data() as Omit<FirestoreSite, "id">;
    sites.set(doc.id, { id: doc.id, ...data });
  });

  const species = new Map<string, FirestoreSpecies>();
  speciesSnap.docs.forEach((doc) => {
    const data = doc.data() as Omit<FirestoreSpecies, "id">;
    species.set(doc.id, { id: doc.id, ...data });
  });

  const boats = new Map<string, FirestoreBoat>();
  boatsSnap.docs.forEach((doc) => {
    const data = doc.data() as Omit<FirestoreBoat, "id">;
    boats.set(doc.id, { id: doc.id, ...data });
  });

  const dives = divesSnap.docs.map((doc) => {
    const data = doc.data() as Omit<FirestoreDive, "id">;
    return { id: doc.id, ...data };
  });

  return { dives, sites, species, boats };
}

export function normalizeDive(
  dive: FirestoreDive,
  sites: Map<string, FirestoreSite>,
  species: Map<string, FirestoreSpecies>,
  boats: Map<string, FirestoreBoat>
): PublicDive {
  return {
    id: dive.id,
    date: toDateString(dive.date),
    diveSlot: dive.diveSlot,
    boat: boats.get(dive.boatId)?.name ?? dive.boatId,
    diveGuide: dive.diveGuide,
    diveSite: sites.get(dive.diveSiteId)?.name ?? dive.diveSiteId,
    maxDepth: dive.maxDepth,
    waterTemperature: dive.waterTemperature,
    driftDive: dive.diveSlot?.toLowerCase().includes("drift") || false,
    sightings: dive.sightings.map((s) => ({
      speciesName: species.get(s.speciesId)?.name ?? s.speciesId,
      count: s.count,
    })),
  };
}
