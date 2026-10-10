/**
 * generate-dive-notes — turns real dive-log data into an unpublished Journal
 * "Dive Notes" draft for human review (#245).
 *
 * Usage:
 *   node scripts/generate-dive-notes.mts --week 2026-10-05
 *   node scripts/generate-dive-notes.mts --month 2026-10
 *   node scripts/generate-dive-notes.mts --from 2026-10-05 --to 2026-10-11
 *   node scripts/generate-dive-notes.mts --month 2026-10 --input snapshot.json
 *   node scripts/generate-dive-notes.mts --week 2026-10-05 --preview
 *
 * Data source: with --input, a JSON snapshot shaped like
 *   { dives: [...], sites: [{id,name}], species: [{id,name}], boats: [{id,name}] }
 * (Firestore-exported Timestamp {seconds} values are accepted for `date`).
 * Without --input, the script reads the live dive log over the public
 * Firestore collections using the documented FIREBASE_* env vars.
 *
 * Output: data/journal/drafts/dive-notes-<from>-to-<to>.tsx — a draft article
 * module carrying draft: true and a non-public provenance comment. It is
 * NEVER registered or committed automatically; publishing means a human
 * edits the file, removes draft: true, and adds it to the registry.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  draftSlug,
  renderDraftTsx,
  renderPreviewText,
  resolvePeriod,
  summarizeDives,
  type DiveLogSnapshot,
} from "../lib/journal/dive-notes.ts";
import type {
  FirestoreBoat,
  FirestoreDive,
  FirestoreSite,
  FirestoreSpecies,
} from "../lib/firestore/dive-log.ts";

interface Args {
  week?: string;
  month?: string;
  from?: string;
  to?: string;
  input?: string;
  outDir: string;
  preview: boolean;
  force: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    outDir: "data/journal/drafts",
    preview: false,
    force: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) {
        throw new Error(`Flag ${flag} expects a value.`);
      }
      return v;
    };
    switch (flag) {
      case "--week": args.week = value(); break;
      case "--month": args.month = value(); break;
      case "--from": args.from = value(); break;
      case "--to": args.to = value(); break;
      case "--input": args.input = value(); break;
      case "--out": args.outDir = value(); break;
      case "--preview": args.preview = true; break;
      case "--force": args.force = true; break;
      case "--help": case "-h":
        console.log(
          "Usage: node scripts/generate-dive-notes.mts (--week <date> | --month <YYYY-MM> | --from <date> --to <date>) [--input <snapshot.json>] [--out <dir>] [--preview] [--force]"
        );
        process.exit(0);
      default:
        throw new Error(`Unknown flag: ${flag}`);
    }
  }
  return args;
}

/* ── Input loading ─────────────────────────────────────────────────── */

function toMap<T extends { id: string; name: string }>(
  records: unknown,
  label: string
): Map<string, T> {
  const list = Array.isArray(records)
    ? records
    : records && typeof records === "object"
      ? Object.values(records)
      : null;
  if (!list) {
    throw new Error(`Snapshot is missing a "${label}" collection array.`);
  }
  const map = new Map<string, T>();
  for (const record of list as T[]) {
    if (typeof record?.id !== "string" || typeof record?.name !== "string") {
      throw new Error(
        `Snapshot ${label} record needs string "id" and "name" fields.`
      );
    }
    map.set(record.id, record);
  }
  return map;
}

function loadSnapshotFromJson(path: string): DiveLogSnapshot {
  const raw = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(raw.dives)) {
    throw new Error(`Snapshot ${path} is missing a "dives" array.`);
  }
  return {
    dives: raw.dives as FirestoreDive[],
    sites: toMap<FirestoreSite>(raw.sites ?? [], "sites"),
    species: toMap<FirestoreSpecies>(raw.species ?? [], "species"),
    boats: toMap<FirestoreBoat>(raw.boats ?? [], "boats"),
  };
}

async function loadSnapshotFromFirestore(): Promise<DiveLogSnapshot> {
  const { initializeApp } = await import("firebase/app");
  const { getFirestore, collection, getDocs } = await import(
    "firebase/firestore"
  );
  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
  };
  if (!config.apiKey || !config.projectId) {
    throw new Error(
      "Firestore read needs the FIREBASE_* env vars (see .env.example) — " +
        "or pass --input <snapshot.json> to work from an export."
    );
  }
  const db = getFirestore(initializeApp(config));
  const [divesSnap, sitesSnap, speciesSnap, boatsSnap] = await Promise.all(
    ["dives", "sites", "species", "boats"].map((name) =>
      getDocs(collection(db, name))
    )
  );
  const toMapFromSnap = <T extends { id: string }>(snap: {
    docs: { id: string; data: () => unknown }[];
  }) =>
    new Map<string, T>(
      snap.docs.map((doc) => [
        doc.id,
        { id: doc.id, ...(doc.data() as Record<string, unknown>) } as T,
      ])
    );
  return {
    dives: divesSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Record<string, unknown>),
    })) as FirestoreDive[],
    sites: toMapFromSnap<FirestoreSite>(sitesSnap),
    species: toMapFromSnap<FirestoreSpecies>(speciesSnap),
    boats: toMapFromSnap<FirestoreBoat>(boatsSnap),
  };
}

/* ── Main ──────────────────────────────────────────────────────────── */

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const period = resolvePeriod(args);

  const snapshot = args.input
    ? loadSnapshotFromJson(args.input)
    : await loadSnapshotFromFirestore();

  const summary = summarizeDives(snapshot, period);
  console.log(renderPreviewText(summary));
  if (args.preview) return;

  const generatedAt = new Date().toISOString();
  const source = renderDraftTsx(summary, period, generatedAt);

  mkdirSync(args.outDir, { recursive: true });
  const file = join(args.outDir, `${draftSlug(period)}.tsx`);
  if (existsSync(file) && !args.force) {
    throw new Error(
      `${file} already exists — pass --force to regenerate over it.`
    );
  }
  writeFileSync(file, source);
  console.log(`\nDraft written: ${file}`);
  console.log(
    `Unpublished by construction: draft: true + not in the registry.\n` +
      `Next steps: review/edit the draft, then register it in\n` +
      `data/journal/index.ts and remove draft: true to publish.`
  );
}

main().catch((err) => {
  console.error(`generate-dive-notes: ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});

export {};
