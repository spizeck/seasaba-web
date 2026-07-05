import { collection, getDocs, Timestamp, type QuerySnapshot, type DocumentData } from "firebase/firestore";
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
  diveGuide?: string | string[];
  diveGuides?: string[];
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
  diveGuides?: string[];
  diveSite: string;
  maxDepth?: number;
  waterTemperature?: number;
  driftDive?: boolean;
  sightings: { speciesId: string; speciesName: string; count?: number }[];
  sourceDives?: PublicDive[];
  sourceDepths?: number[];
  sourceTemperatures?: number[];
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
  const names = ["dives", "sites", "species", "boats"] as const;
  const results = await Promise.allSettled([
    getDocs(collection(db, "dives")),
    getDocs(collection(db, "sites")),
    getDocs(collection(db, "species")),
    getDocs(collection(db, "boats")),
  ]);

  const failures = results
    .map((result, index) => ({ result, name: names[index] }))
    .filter(({ result }) => result.status === "rejected")
    .map(({ result, name }) => {
      const reason = (result as PromiseRejectedResult).reason;
      const message = reason?.code === "permission-denied"
        ? `Missing or insufficient permissions for collection: ${name}`
        : `Failed to load collection "${name}": ${reason?.message || reason}`;
      return message;
    });

  if (failures.length > 0) {
    throw new Error(failures.join("; "));
  }

  const [divesSnap, sitesSnap, speciesSnap, boatsSnap] = results.map(
    (r) => (r as PromiseFulfilledResult<QuerySnapshot<DocumentData>>).value
  );

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

function extractGuideNames(dive: FirestoreDive): string[] {
  const raw = dive.diveGuides ?? dive.diveGuide;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((g) => g.trim()).filter(Boolean);
  if (typeof raw === "string") return raw.split(",").map((g) => g.trim()).filter(Boolean);
  return [];
}

export function normalizeDive(
  dive: FirestoreDive,
  sites: Map<string, FirestoreSite>,
  species: Map<string, FirestoreSpecies>,
  boats: Map<string, FirestoreBoat>
): PublicDive {
  const guides = extractGuideNames(dive);
  const siteName = sites.get(dive.diveSiteId)?.name ?? dive.diveSiteId;
  const isDrift =
    dive.diveSlot?.toLowerCase().includes("drift") ||
    siteName?.toLowerCase().includes("drift") ||
    false;
  return {
    id: dive.id,
    date: toDateString(dive.date),
    diveSlot: dive.diveSlot,
    boat: boats.get(dive.boatId)?.name ?? dive.boatId,
    diveGuide: guides.join(", ") || "Unknown",
    diveGuides: guides,
    diveSite: siteName,
    maxDepth: dive.maxDepth,
    waterTemperature: dive.waterTemperature,
    driftDive: isDrift,
    sightings: dive.sightings.map((s) => ({
      speciesId: s.speciesId,
      speciesName: species.get(s.speciesId)?.name ?? s.speciesId,
      count: s.count,
    })),
  };
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function groupDivesForDisplay(dives: PublicDive[]): PublicDive[] {
  const groups = new Map<string, PublicDive[]>();

  for (const dive of dives) {
    const key = [dive.date, dive.diveSlot, dive.boat, dive.diveSite].join("|");
    const bucket = groups.get(key) ?? [];
    bucket.push(dive);
    groups.set(key, bucket);
  }

  return Array.from(groups.values()).map((group) => {
    const [first] = group;

    const allGuides = group.flatMap((d) => d.diveGuides ?? []);
    const diveGuides = unique(allGuides).filter(Boolean);

    const sightingsMap = new Map<string, PublicDive["sightings"][number]>();
    for (const dive of group) {
      for (const s of dive.sightings) {
        const matchKey = s.speciesId || s.speciesName;
        const existing = sightingsMap.get(matchKey);
        if (!existing) {
          sightingsMap.set(matchKey, { ...s });
        } else {
          if (existing.count === undefined) {
            existing.count = s.count;
          } else if (s.count !== undefined && s.count > existing.count) {
            existing.count = s.count;
          }
        }
      }
    }
    const sightings = Array.from(sightingsMap.values());

    const sourceDepths = group
      .map((d) => d.maxDepth)
      .filter((d): d is number => d !== undefined);
    const maxDepth = sourceDepths.length > 0 ? Math.max(...sourceDepths) : undefined;

    const sourceTemperatures = group
      .map((d) => d.waterTemperature)
      .filter((t): t is number => t !== undefined);
    const waterTemperature = sourceTemperatures.length > 0 ? Math.max(...sourceTemperatures) : undefined;

    return {
      ...first,
      id: group.map((d) => d.id).sort().join("+"),
      diveGuide: diveGuides.join(", ") || first.diveGuide,
      diveGuides,
      maxDepth,
      waterTemperature,
      sightings,
      sourceDives: group,
      sourceDepths,
      sourceTemperatures,
    };
  });
}
