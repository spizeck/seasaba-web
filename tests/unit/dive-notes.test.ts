import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DIVE_FIELDS_USED,
  draftSlug,
  renderDraftTsx,
  renderPreviewText,
  resolvePeriod,
  siteHref,
  summarizeDives,
  type DiveLogSnapshot,
  type DiveNotesPeriod,
} from "@/lib/journal/dive-notes";
import {
  getArticle,
  journalFeedXml,
  listArticles,
  validateRegistry,
} from "@/lib/journal";
import type {
  FirestoreBoat,
  FirestoreDive,
  FirestoreSite,
  FirestoreSpecies,
} from "@/lib/firestore/dive-log";

// Synthetic snapshot — fabricated records only; the createdBy/diveGuide values
// exist precisely to prove they never reach generated output.
const snapshot = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/dive-notes-snapshot.json"), "utf8")
) as {
  dives: FirestoreDive[];
  sites: FirestoreSite[];
  species: FirestoreSpecies[];
  boats: FirestoreBoat[];
};

const byId = <T extends { id: string }>(list: T[]) =>
  new Map(list.map((r) => [r.id, r]));

const fixture: DiveLogSnapshot = {
  dives: snapshot.dives,
  sites: byId(snapshot.sites),
  species: byId(snapshot.species),
  boats: byId(snapshot.boats),
};

const WEEK: DiveNotesPeriod = { kind: "week", from: "2026-09-07", to: "2026-09-13" };
const MONTH: DiveNotesPeriod = { kind: "month", from: "2026-09-01", to: "2026-09-30" };
const EMPTY: DiveNotesPeriod = { kind: "month", from: "2026-06-01", to: "2026-06-30" };
const GENERATED_AT = "2026-10-10T00:00:00.000Z";

describe("resolvePeriod", () => {
  it("expands --week to the containing Monday–Sunday", () => {
    expect(resolvePeriod({ week: "2026-09-07" })).toEqual(WEEK);
    expect(resolvePeriod({ week: "2026-09-10" })).toEqual(WEEK);
    expect(resolvePeriod({ week: "2026-09-13" })).toEqual(WEEK); // Sunday
  });

  it("expands --month to the full month", () => {
    expect(resolvePeriod({ month: "2026-09" })).toEqual(MONTH);
    expect(resolvePeriod({ month: "2026-02" })).toEqual({
      kind: "month",
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("accepts explicit inclusive bounds and rejects ambiguity", () => {
    expect(resolvePeriod({ from: "2026-09-07", to: "2026-09-13" }).kind).toBe(
      "range"
    );
    expect(() => resolvePeriod({ week: "2026-09-07", month: "2026-09" })).toThrow(
      /exactly one/
    );
    expect(() => resolvePeriod({ from: "2026-09-07" })).toThrow(/exactly one/);
    expect(() =>
      resolvePeriod({ from: "2026-09-13", to: "2026-09-07" })
    ).toThrow(/not be after/);
    expect(() => resolvePeriod({ month: "Sept 2026" })).toThrow(/YYYY-MM/);
  });
});

describe("siteHref — canonical dive-site linking", () => {
  it("maps catalogued site names to their area anchor", () => {
    expect(siteHref("Third Encounter")).toBe("/dive-sites#pinnacles");
    expect(siteHref("Tent Reef")).toBe("/dive-sites#tent-reef");
    expect(siteHref("Man O'War Shoals")).toBe("/dive-sites#wells-bay");
  });

  it("falls back to the Firestore region, then the plain page", () => {
    expect(siteHref("Obscure Fixture", "Ladder Bay")).toBe(
      "/dive-sites#ladder-bay"
    );
    expect(siteHref("Obscure Fixture")).toBe("/dive-sites");
  });
});

describe("summarizeDives — weekly aggregation", () => {
  const summary = summarizeDives(fixture, WEEK);

  it("groups raw records into displayed dives like the public log", () => {
    // fx-001 + fx-002 are the same dive (date+slot+boat+site); fx-006 is
    // malformed; fx-007 is out of range.
    expect(summary.diveCount).toBe(4);
    expect(summary.sourceRecordCount).toBe(5);
    expect(summary.daysDived).toBe(3);
    expect(summary.warnings.join("\n")).toMatch(/malformed/);
  });

  it("aggregates multiple sites with canonical links, most-dived first", () => {
    expect(summary.sites).toEqual([
      { name: "Tent Reef", dives: 2, href: "/dive-sites#tent-reef" },
      { name: "Fixture Shoal", dives: 1, href: "/dive-sites" },
      { name: "Third Encounter", dives: 1, href: "/dive-sites#pinnacles" },
    ]);
  });

  it("deduplicates species and counts dives, not individuals", () => {
    const turtle = summary.sightings.find((s) => s.speciesName === "Green Turtle")!;
    expect(turtle.dives).toBe(2); // fx-001/002 group + fx-004
    expect(turtle.maxCount).toBe(2); // per-dive max, not a sum (2 vs 1, not 3)
    const shark = summary.sightings.find(
      (s) => s.speciesName === "Caribbean Reef Shark"
    )!;
    expect(shark.dives).toBe(2);
    expect(shark.maxCount).toBe(3);
  });

  it("reports conditions only from recorded fields", () => {
    expect(summary.temperatureC).toEqual({ min: 27, max: 28 });
    expect(summary.maxDepthM).toBe(30);
    expect(summary.driftDives).toBe(1); // diveSlot containing "drift"
  });

  it("keeps provenance record ids, sorted", () => {
    expect(summary.recordIds).toEqual([
      "fx-001",
      "fx-002",
      "fx-003",
      "fx-004",
      "fx-005",
    ]);
  });

  it("accepts Firestore-exported Timestamp {seconds} dates", () => {
    // fx-005's date is {seconds: 1789200000} = 2026-09-12 and made it in.
    expect(summary.recordIds).toContain("fx-005");
    expect(summary.daysDived).toBe(3); // Sep 7, 9, 12
  });
});

describe("summarizeDives — monthly and edge cases", () => {
  it("month range picks up the full month's records", () => {
    const summary = summarizeDives(fixture, MONTH);
    expect(summary.diveCount).toBe(5); // week dives + fx-007 (Sep 20)
    expect(summary.temperatureC).toEqual({ min: 26, max: 28 });
  });

  it("a zero-dive period yields an honest empty summary, not prose", () => {
    const summary = summarizeDives(fixture, EMPTY);
    expect(summary.diveCount).toBe(0);
    expect(summary.sites).toEqual([]);
    expect(summary.sightings).toEqual([]);
    expect(summary.temperatureC).toBeNull();
    const source = renderDraftTsx(summary, EMPTY, GENERATED_AT);
    expect(source).toContain("No dives appear in the dive log");
    expect(source).toContain("[Editor note:");
    expect(source).not.toContain("Where we dove");
    expect(source).not.toMatch(/thrilled|incredible|bustling/i);
  });

  it("missing conditions produce explicit prompts, not invented weather", () => {
    const noTemps: DiveLogSnapshot = {
      ...fixture,
      dives: fixture.dives.map((d) => ({
        ...d,
        waterTemperature: undefined,
        maxDepth: undefined,
      })),
    };
    const summary = summarizeDives(noTemps, WEEK);
    expect(summary.temperatureC).toBeNull();
    expect(summary.warnings.join("\n")).toMatch(/No water temperatures/);
    const source = renderDraftTsx(summary, WEEK, GENERATED_AT);
    expect(source).toContain("[Guide note: add observed conditions");
    expect(source).not.toMatch(/\d+ °C/);
  });

  it("a period with no sightings says so plainly", () => {
    const none: DiveLogSnapshot = {
      ...fixture,
      dives: fixture.dives.map((d) => ({ ...d, sightings: [] })),
    };
    const summary = summarizeDives(none, WEEK);
    expect(summary.sightings).toEqual([]);
    expect(summary.warnings.join("\n")).toMatch(/No sightings/);
    expect(renderDraftTsx(summary, WEEK, GENERATED_AT)).toContain(
      "No sightings were logged"
    );
  });
});

describe("privacy boundary", () => {
  const source = renderDraftTsx(
    summarizeDives(fixture, WEEK),
    WEEK,
    GENERATED_AT
  );

  it("never emits guide names, creator ids, or internal timestamps", () => {
    // Field *names* may appear in the provenance comment (that is the audit
    // trail); field *values* must never reach the draft.
    for (const forbidden of [
      "Test Guide One",
      "Test Guide Two",
      "staff@example.invalid",
      "1789000000",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("declares exactly which fields were used and excluded", () => {
    expect(source).toContain('"fieldsUsed"');
    expect(source).toContain('"excludedFields"');
    for (const field of DIVE_FIELDS_USED) {
      expect(source).toContain(`"${field}"`);
    }
  });

  it("the summary object itself carries no guide/createdBy data", () => {
    const summary = summarizeDives(fixture, WEEK);
    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain("Test Guide");
    expect(serialized).not.toContain("example.invalid");
  });
});

describe("draft output", () => {
  const summary = summarizeDives(fixture, WEEK);
  const source = renderDraftTsx(summary, WEEK, GENERATED_AT);

  it("is deterministic — same inputs produce identical source", () => {
    expect(renderDraftTsx(summary, WEEK, GENERATED_AT)).toBe(source);
    expect(renderDraftTsx(summarizeDives(fixture, WEEK), WEEK, GENERATED_AT)).toBe(
      source
    );
  });

  it("emits a draft article module with provenance and placeholders", () => {
    expect(source).toContain('draft: true');
    expect(source).toContain('slug: "dive-notes-2026-09-07-to-2026-09-13"');
    expect(source).toContain('"sourceRecordIds"');
    expect(source).toContain('"generatedAt": "2026-10-10T00:00:00.000Z"');
    expect(source).toContain("dive-notes-hero-placeholder.webp");
    expect(source).toContain("[Guide note:");
    expect(source).toContain("[Editor note:");
  });

  it("invents nothing beyond the numbers", () => {
    expect(source).not.toMatch(/thrilled|incredible|bustling|delighted/i);
    expect(source).not.toContain("visibility was");
  });

  it("escapes JSX text (boat names with & render safely)", () => {
    expect(source).toContain("Fin &amp; Tonic");
    expect(source).not.toContain("Fin & Tonic");
  });

  it("slug is kebab-case and date-scoped", () => {
    expect(draftSlug(WEEK)).toBe("dive-notes-2026-09-07-to-2026-09-13");
    expect(draftSlug(WEEK)).toMatch(/^[a-z0-9-]+$/);
  });

  it("preview text summarizes aggregates for the operator", () => {
    const preview = renderPreviewText(summary);
    expect(preview).toContain("4 logged dives");
    expect(preview).toContain("Tent Reef ×2");
    expect(preview).not.toContain("Test Guide");
  });
});

describe("drafts can never publish", () => {
  // The committed example draft is a real generated module — importing it
  // exercises the exact artifact a user would receive.
  it("generated drafts carry draft: true and a valid shape", async () => {
    const { article } = await import(
      "../../data/journal/drafts/dive-notes-2026-09-07-to-2026-09-13"
    );
    expect(article.draft).toBe(true);
    expect(validateRegistry([article])).toEqual([article]); // validates cleanly
  });

  it("a registered draft still cannot reach the public surface", async () => {
    const { article } = await import(
      "../../data/journal/drafts/dive-notes-2026-09-07-to-2026-09-13"
    );
    // Registry-valid (above) but the public accessors exclude drafts even
    // when one is registered — inject it to prove the filter, not absence.
    const withDraft = [...listArticles(), article];
    expect(withDraft.some((a) => a.slug === article.slug)).toBe(true);
    expect(
      listArticles(withDraft).some((a) => a.slug === article.slug)
    ).toBe(false);
    expect(getArticle(article.slug, withDraft)).toBeUndefined();
    expect(journalFeedXml(listArticles(withDraft))).not.toContain(article.slug);
    // And of course nothing in the real registry is a draft today.
    expect(listArticles().every((a) => !a.draft)).toBe(true);
  });
});
