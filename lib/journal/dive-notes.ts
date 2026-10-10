import type {
  FirestoreBoat,
  FirestoreDive,
  FirestoreSite,
  FirestoreSpecies,
} from "@/lib/firestore/dive-log";
import { DIVE_AREAS } from "../../data/dive-areas.ts";

/**
 * Dive Notes draft generation (#245) — pure, deterministic, dependency-free.
 *
 * This module turns a dive-log snapshot into the source text of a Journal
 * article module written under data/journal/drafts/. It is loaded both by
 * Vitest and by scripts/generate-dive-notes.mts under Node's native type
 * stripping — so it may only use `import type` against `@/` modules (type
 * imports are erased and never resolved) and explicit `.ts` relative
 * imports against dependency-free files.
 *
 * Privacy boundary: aggregation reads a fixed field whitelist only —
 * date, diveSlot, boatId, diveSiteId, maxDepth, waterTemperature, and
 * sightings (speciesId/count). The model's remaining fields — diveGuide(s),
 * createdBy, createdAt, and anything else present on a record — are never
 * read and can never reach a draft.
 */

/** The only dive-record fields this generator is allowed to read. */
export const DIVE_FIELDS_USED = [
  "date",
  "diveSlot",
  "boatId",
  "diveSiteId",
  "maxDepth",
  "waterTemperature",
  "sightings.speciesId",
  "sightings.count",
] as const;

export interface DiveLogSnapshot {
  dives: readonly FirestoreDive[];
  sites: ReadonlyMap<string, FirestoreSite>;
  species: ReadonlyMap<string, FirestoreSpecies>;
  boats: ReadonlyMap<string, FirestoreBoat>;
}

export interface DiveNotesPeriod {
  /** Inclusive ISO date bounds, "YYYY-MM-DD". */
  from: string;
  to: string;
  /** "week" | "month" | "range" — drives title phrasing. */
  kind: "week" | "month" | "range";
}

export interface SiteAggregate {
  name: string;
  dives: number;
  /** Canonical link — an area anchor when the site is catalogued. */
  href: string;
}

export interface SightingAggregate {
  speciesName: string;
  /** Number of distinct logged dives the species was recorded on. */
  dives: number;
  /** Largest single-dive count recorded, when counts exist. */
  maxCount?: number;
}

export interface DiveNotesSummary {
  period: { from: string; to: string };
  /** Displayed dives — date/slot/boat/site groups, matching /dive-log. */
  diveCount: number;
  sourceRecordCount: number;
  daysDived: number;
  sites: SiteAggregate[];
  sightings: SightingAggregate[];
  boats: string[];
  temperatureC: { min: number; max: number } | null;
  maxDepthM: number | null;
  driftDives: number;
  /** Sorted dive-record ids — safe provenance references, not rendered. */
  recordIds: string[];
  /** Data-quality notes for the editor (malformed records, gaps). */
  warnings: string[];
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDate(value: unknown): string | null {
  if (typeof value === "string" && ISO_DATE.test(value.slice(0, 10))) {
    return value.slice(0, 10);
  }
  // Firestore Timestamp (SDK object or JSON-exported {seconds}).
  const seconds =
    value != null && typeof value === "object"
      ? (value as { seconds?: number }).seconds
      : undefined;
  if (typeof seconds === "number") {
    return new Date(seconds * 1000).toISOString().slice(0, 10);
  }
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date })
      .toDate()
      .toISOString()
      .slice(0, 10);
  }
  return null;
}

function isoAddDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Resolve a date-range option set into an inclusive period.
 *  - `week`:  any ISO date — expanded to its Mon–Sun week
 *  - `month`: "YYYY-MM" — first through last day of the month
 *  - `from`/`to`: explicit inclusive bounds
 */
export function resolvePeriod(options: {
  week?: string;
  month?: string;
  from?: string;
  to?: string;
}): DiveNotesPeriod {
  const { week, month, from, to } = options;
  const chosen = [week, month, from].filter(Boolean).length;
  if (chosen !== 1 || (from && !to)) {
    throw new Error(
      "Choose exactly one of --week <date>, --month <YYYY-MM>, or --from/--to."
    );
  }

  if (week) {
    if (!ISO_DATE.test(week)) {
      throw new Error(`--week expects a date (YYYY-MM-DD), got "${week}"`);
    }
    // Monday = 1 … Sunday = 0→7 in getUTCDay terms.
    const day = new Date(`${week}T00:00:00Z`).getUTCDay() || 7;
    return {
      kind: "week",
      from: isoAddDays(week, 1 - day),
      to: isoAddDays(week, 7 - day),
    };
  }

  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error(`--month expects YYYY-MM, got "${month}"`);
    }
    const [y, m] = month.split("-").map(Number);
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return {
      kind: "month",
      from: `${month}-01`,
      to: `${month}-${String(lastDay).padStart(2, "0")}`,
    };
  }

  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    throw new Error("--from and --to must both be ISO dates (YYYY-MM-DD).");
  }
  if (from > to) throw new Error("--from must not be after --to.");
  return { kind: "range", from, to };
}

/** Canonical /dive-sites link for a logged site name. */
export function siteHref(siteName: string, region?: string): string {
  const wanted = siteName.trim().toLowerCase();
  for (const area of DIVE_AREAS) {
    if (
      area.sites.some((s) => s.toLowerCase() === wanted) ||
      (region && area.title.toLowerCase() === region.trim().toLowerCase())
    ) {
      return `/dive-sites#${area.id}`;
    }
  }
  return "/dive-sites";
}

/**
 * Whitelist aggregation — builds a DiveNotesSummary from raw log records.
 * Only fields in DIVE_FIELDS_USED are read; everything else on the record
 * (guides, createdBy, createdAt, unknown fields) is ignored by construction.
 */
export function summarizeDives(
  input: DiveLogSnapshot,
  period: DiveNotesPeriod
): DiveNotesSummary {
  const warnings: string[] = [];
  let skipped = 0;

  // Eligible records in range, reduced to the whitelisted view.
  const eligible = input.dives
    .map((dive) => ({ dive, date: toIsoDate(dive.date) }))
    .filter(({ dive, date }) => {
      if (!date || !dive.diveSiteId || !dive.diveSlot) {
        if (date && date >= period.from && date <= period.to) skipped++;
        return false;
      }
      return date >= period.from && date <= period.to;
    });

  if (skipped > 0) {
    warnings.push(
      `${skipped} record(s) in range were malformed (missing date, slot, or site) and skipped.`
    );
  }

  // Group to displayed dives — same key the public log groups on.
  const groups = new Map<string, FirestoreDive[]>();
  for (const { dive } of eligible) {
    const key = [
      toIsoDate(dive.date),
      String(dive.diveSlot).toLowerCase(),
      dive.boatId,
      dive.diveSiteId,
    ].join("|");
    const bucket = groups.get(key) ?? [];
    bucket.push(dive);
    groups.set(key, bucket);
  }

  const siteDives = new Map<string, number>();
  const sightingDives = new Map<string, { dives: number; maxCount?: number }>();
  const boats = new Set<string>();
  const days = new Set<string>();
  const temps: number[] = [];
  const depths: number[] = [];
  let driftDives = 0;

  for (const group of groups.values()) {
    const [first] = group;
    const siteName =
      input.sites.get(first.diveSiteId)?.name ?? first.diveSiteId;
    siteDives.set(siteName, (siteDives.get(siteName) ?? 0) + 1);
    boats.add(input.boats.get(first.boatId)?.name ?? first.boatId);
    days.add(toIsoDate(first.date)!);
    if (
      String(first.diveSlot).toLowerCase().includes("drift") ||
      siteName.toLowerCase().includes("drift")
    ) {
      driftDives++;
    }

    for (const d of group) {
      if (typeof d.waterTemperature === "number") temps.push(d.waterTemperature);
      if (typeof d.maxDepth === "number") depths.push(d.maxDepth);
    }

    // Merge sightings within the dive (per-species max count), then tally
    // per species across the period — "seen on N dives", never a raw sum.
    const perDive = new Map<string, number | undefined>();
    for (const d of group) {
      if (!Array.isArray(d.sightings)) continue;
      for (const s of d.sightings) {
        const prev = perDive.get(s.speciesId);
        if (prev === undefined || (s.count ?? 0) > (prev ?? 0)) {
          perDive.set(s.speciesId, s.count);
        }
      }
    }
    for (const [speciesId, count] of perDive) {
      const name = input.species.get(speciesId)?.name ?? speciesId;
      const agg = sightingDives.get(name) ?? { dives: 0 };
      agg.dives++;
      if (count !== undefined) {
        agg.maxCount = Math.max(agg.maxCount ?? 0, count);
      }
      sightingDives.set(name, agg);
    }
  }

  if (groups.size > 0 && temps.length === 0) {
    warnings.push(
      "No water temperatures were recorded in this period — conditions section will carry a guide-note prompt."
    );
  }
  const sightingless = [...siteDives.keys()].length > 0 && sightingDives.size === 0;
  if (sightingless) {
    warnings.push(
      "No sightings were recorded in this period — the sightings section will say so plainly."
    );
  }

  return {
    period: { from: period.from, to: period.to },
    diveCount: groups.size,
    sourceRecordCount: eligible.length,
    daysDived: days.size,
    sites: [...siteDives.entries()]
      .map(([name, dives]) => ({
        name,
        dives,
        href: siteHref(name, findRegion(input.sites, name)),
      }))
      .sort((a, b) => b.dives - a.dives || a.name.localeCompare(b.name)),
    sightings: [...sightingDives.entries()]
      .map(([speciesName, { dives, maxCount }]) => ({
        speciesName,
        dives,
        maxCount,
      }))
      .sort(
        (a, b) =>
          b.dives - a.dives || a.speciesName.localeCompare(b.speciesName)
      ),
    boats: [...boats].sort(),
    temperatureC: temps.length
      ? { min: Math.min(...temps), max: Math.max(...temps) }
      : null,
    maxDepthM: depths.length ? Math.max(...depths) : null,
    driftDives,
    recordIds: eligible.map(({ dive }) => dive.id).sort(),
    warnings,
  };
}

function findRegion(
  sites: ReadonlyMap<string, FirestoreSite>,
  siteName: string
): string | undefined {
  for (const site of sites.values()) {
    if (site.name === siteName) return site.region;
  }
  return undefined;
}

/* ── Date/title formatting ─────────────────────────────────────────── */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function periodTitle(period: DiveNotesPeriod): string {
  const [fy, fm, fd] = period.from.split("-").map(Number);
  const [ty, tm, td] = period.to.split("-").map(Number);
  if (period.kind === "month") return `Dive Notes: ${MONTHS[fm - 1]} ${fy}`;
  if (fy === ty && fm === tm) {
    return `Dive Notes: ${MONTHS[fm - 1]} ${fd}–${td}, ${fy}`;
  }
  if (fy === ty) {
    return `Dive Notes: ${MONTHS[fm - 1]} ${fd} – ${MONTHS[tm - 1]} ${td}, ${fy}`;
  }
  return `Dive Notes: ${longDate(period.from)} – ${longDate(period.to)}`;
}

/* ── TSX emission ──────────────────────────────────────────────────── */

/** Escape arbitrary text for JSX element content. */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");
}

const plural = (n: number, noun: string, pluralNoun?: string) =>
  `${n} ${n === 1 ? noun : (pluralNoun ?? `${noun}s`)}`;

export function draftSlug(period: DiveNotesPeriod): string {
  return `dive-notes-${period.from}-to-${period.to}`;
}

/**
 * Non-public provenance embedded as a comment in the generated file —
 * enough to audit where every fact came from without rendering it.
 */
export function provenanceBlock(
  summary: DiveNotesSummary,
  generatedAt: string
): string {
  const provenance = {
    generator: "scripts/generate-dive-notes.mts (#245)",
    generatedAt,
    period: summary.period,
    recordCount: summary.sourceRecordCount,
    sourceRecordIds: summary.recordIds,
    fieldsUsed: [...DIVE_FIELDS_USED],
    excludedFields: [
      "diveGuide/diveGuides (staff names — add by name only if approved)",
      "createdBy (internal user reference)",
      "createdAt (internal write timestamp)",
      "any guest/customer fields (none exist on dive records)",
    ],
  };
  return `/*
 * GENERATED DRAFT — DO NOT PUBLISH WITHOUT HUMAN REVIEW.
 * Provenance (for editors; delete before publishing if preferred):
 * ${JSON.stringify(provenance, null, 2).replace(/\*\//g, "*\\/")}
 */`;
}

/**
 * Render the complete .tsx source for an unpublished draft article.
 * Deterministic for a given summary + generatedAt.
 */
export function renderDraftTsx(
  summary: DiveNotesSummary,
  period: DiveNotesPeriod,
  generatedAt: string
): string {
  const title = periodTitle(period);
  const slug = draftSlug(period);
  const range = `${longDate(period.from)} – ${longDate(period.to)}`;

  const body: string[] = [];

  if (summary.diveCount === 0) {
    body.push(
      `      <p>`,
      `        No dives appear in the dive log between ${longDate(period.from)}`,
      `        and ${longDate(period.to)}.`,
      `      </p>`,
      `      <p>`,
      `        [Editor note: confirm whether this gap reflects the actual`,
      `        operation — a weather closure, travel days, or missing log`,
      `        records — before this becomes a story.]`,
      `      </p>`
    );
  } else {
    const boatPhrase =
      summary.boats.length > 0
        ? ` aboard ${esc(joinNames(summary.boats))}`
        : "";
    body.push(
      `      <p>`,
      `        Between ${longDate(period.from)} and ${longDate(period.to)},`,
      `        Sea Saba boats logged ${plural(summary.diveCount, "dive")}`,
      `        across ${plural(summary.sites.length, "site")}${boatPhrase}.`,
      `      </p>`,
      `      <p>`,
      `        [Guide note: add context about this period — weather, sea state,`,
      `        or anything that shaped the diving.]`,
      `      </p>`,
      ``,
      `      <h2>Where we dove</h2>`,
      `      <ul>`,
      ...summary.sites.map(
        (s) =>
          `        <li>\n          <Link href="${s.href}">${esc(s.name)}</Link> — ${plural(s.dives, "dive")}\n        </li>`
      ),
      `      </ul>`,
      ``
    );

    if (summary.sightings.length > 0) {
      body.push(
        `      <h2>Recorded sightings</h2>`,
        `      <p>`,
        `        Species the crew logged, with how many dives each was seen`,
        `        on — a count of encounters, not of individual animals.`,
        `      </p>`,
        `      <ul>`,
        ...summary.sightings.map((s) => {
          const count =
            s.maxCount !== undefined && s.maxCount > 1
              ? ` (up to ${s.maxCount} at once)`
              : "";
          return `        <li>${esc(s.speciesName)} — seen on ${plural(s.dives, "dive")}${count}</li>`;
        }),
        `      </ul>`,
        ``
      );
    } else {
      body.push(
        `      <h2>Recorded sightings</h2>`,
        `      <p>`,
        `        No sightings were logged this period.`,
        `      </p>`,
        `      <p>`,
        `        [Guide note: were conditions quiet, or do records simply lack`,
        `        sightings? Add the memorable encounters from memory if the log`,
        `        is thin.]`,
        `      </p>`,
        ``
      );
    }

    body.push(`      <h2>Conditions</h2>`);
    const conditionBits: string[] = [];
    if (summary.temperatureC) {
      const { min, max } = summary.temperatureC;
      const f = (c: number) => Math.round(c * 1.8 + 32);
      conditionBits.push(
        min === max
          ? `Recorded water temperature sat at ${min} °C (${f(min)} °F)`
          : `Recorded water temperatures ran ${min}–${max} °C (${f(min)}–${f(max)} °F)`
      );
    }
    if (summary.maxDepthM !== null) {
      const ft = Math.round(summary.maxDepthM * 3.28084);
      conditionBits.push(
        `the deepest logged dive reached ${summary.maxDepthM} m (${ft} ft)`
      );
    }
    if (summary.driftDives > 0) {
      conditionBits.push(
        `${plural(summary.driftDives, "drift dive")} ${summary.driftDives === 1 ? "was" : "were"} logged`
      );
    }
    if (conditionBits.length > 0) {
      body.push(
        `      <p>`,
        `        ${conditionBits.join("; ")}.`,
        `      </p>`
      );
    } else {
      body.push(
        `      <p>`,
        `        No water temperature or depth figures were logged this period.`,
        `      </p>`
      );
    }
    if (summary.temperatureC === null && summary.diveCount > 0) {
      body.push(
        `      <p>`,
        `        [Guide note: no water temperatures were logged — add observed`,
        `        conditions from memory if you can stand behind them.]`,
        `      </p>`
      );
    }
    body.push(
      `      <p>`,
      `        [Guide note: add observed conditions — temperature,`,
      `        visibility, current.]`,
      `      </p>`
    );
  }

  body.push(
    ``,
    `      <h2>Before publishing</h2>`,
    `      <ul>`,
    `        <li>`,
    `          [Editor note: choose a real hero photo — ideally from this`,
    `          period — and write its alt text.]`,
    `        </li>`,
    `        <li>`,
    `          [Editor note: pick up to three related articles and set the`,
    `          related field.]`,
    `        </li>`,
    `        <li>`,
    `          [Editor note: once reviewed, remove draft: true and register`,
    `          this module in data/journal/index.ts — that commit is the`,
    `          publish step.]`,
    `        </li>`,
    `      </ul>`
  );

  const description =
    summary.diveCount === 0
      ? `Dive-log summary for ${range} — no dives were recorded. Draft pending editorial review.`
      : `Dive-log notes for ${range}: ${plural(summary.diveCount, "dive")} across ${plural(summary.sites.length, "site")}${summary.sightings.length ? `, with ${plural(summary.sightings.length, "species", "species")} logged` : ""}. Draft pending editorial review.`;

  return `import Link from "next/link";
import type { JournalArticle } from "../types";

${provenanceBlock(summary, generatedAt)}

/**
 * Dive Notes draft generated ${generatedAt} from dive-log data — unpublished
 * by construction (draft: true, unregistered). Review, edit, and delete this
 * header before publishing. See data/journal/README.md for the workflow.
 */
export const article: JournalArticle = {
  slug: "${slug}",
  title: ${JSON.stringify(title)},
  description:
    ${JSON.stringify(description)},
  publishedAt: "${period.to}",
  category: "From the Boats",
  author: { name: "Sea Saba", type: "Organization", role: "Dive crew" },
  hero: {
    // Placeholder — replace with a real /images/optimized/ photo before review.
    src: "/images/optimized/dive-notes-hero-placeholder.webp",
    alt: "[Editor: choose a real photo from this period and describe it]",
  },
  draft: true,
  cta: { label: "Browse the full dive log", href: "/dive-log" },
  body: (
    <>
${body.join("\n")}
    </>
  ),
};
`;
}

function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/* ── CLI preview ───────────────────────────────────────────────────── */

/** Plain-text aggregate preview for the operator before anything is written. */
export function renderPreviewText(summary: DiveNotesSummary): string {
  const lines: string[] = [
    `Dive Notes preview — ${summary.period.from} → ${summary.period.to}`,
    `  ${summary.diveCount} logged dives (${summary.sourceRecordCount} records, ${summary.daysDived} days, ${summary.sites.length} sites, ${summary.boats.length} boats)`,
  ];
  if (summary.sites.length) {
    lines.push(
      `  Sites:     ${summary.sites
        .map((s) => `${s.name} ×${s.dives} (${s.href})`)
        .join(", ")}`
    );
  }
  if (summary.sightings.length) {
    lines.push(
      `  Sightings: ${summary.sightings
        .map(
          (s) =>
            `${s.speciesName} on ${s.dives} dive(s)` +
            (s.maxCount ? `, max ${s.maxCount}` : "")
        )
        .join("; ")}`
    );
  } else if (summary.diveCount > 0) {
    lines.push(`  Sightings: none recorded`);
  }
  if (summary.temperatureC) {
    const { min, max } = summary.temperatureC;
    lines.push(
      `  Water temp: ${min}–${max} °C (${Math.round(min * 1.8 + 32)}–${Math.round(max * 1.8 + 32)} °F)`
    );
  }
  if (summary.maxDepthM !== null) {
    lines.push(`  Max depth: ${summary.maxDepthM} m`);
  }
  if (summary.driftDives) lines.push(`  Drift dives: ${summary.driftDives}`);
  for (const warning of summary.warnings) lines.push(`  ! ${warning}`);
  if (summary.diveCount === 0) {
    lines.push(
      `  No dives in range — the draft will be a stub outline, not an article.`
    );
  }
  return lines.join("\n");
}
