import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NL_CONTENT, canServeNlRoute } from "@/content/nl";
import {
  DRAFTED_ROUTES,
  isRoutePublished,
  PUBLISHED_ROUTES,
} from "@/lib/locale";
import { ui as enUi } from "@/content/en/ui";
import { ui as nlUi } from "@/content/nl/ui";
import { createMetadata } from "@/lib/metadata";
import sitemap from "@/app/sitemap";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const NL_DIR = path.join(REPO_ROOT, "content", "nl");
const APP_NL_DIR = path.join(REPO_ROOT, "app", "nl");

const sha1 = (file: string) =>
  createHash("sha1").update(readFileSync(file)).digest("hex");

function nlModuleSource(file: string): string {
  return readFileSync(path.join(NL_DIR, file), "utf8");
}

describe("Dutch draft modules (#151)", () => {
  it("has a content module for every drafted route, and only those", () => {
    expect(Object.keys(NL_CONTENT).sort()).toEqual(
      [...DRAFTED_ROUTES.nl].sort(),
    );
    // The six Phase 1 routes, nothing more.
    expect(DRAFTED_ROUTES.nl).toEqual([
      "/",
      "/diving",
      "/plan-your-trip",
      "/courses",
      "/contact",
      "/book",
    ]);
  });

  it("marks every module as an unapproved draft", () => {
    for (const [route, mod] of Object.entries(NL_CONTENT)) {
      expect(mod.review.status, route).toBe("draft");
      expect(mod.review.reviewedBy, route).toBeNull();
      expect(mod.review.reviewedAt, route).toBeNull();
      expect(mod.review.source, route).toMatch(/^app\//);
    }
  });

  it("pins each module to a real hash of its English source", () => {
    for (const [route, mod] of Object.entries(NL_CONTENT)) {
      const sourceFile = path.join(REPO_ROOT, mod.review.source);
      expect(existsSync(sourceFile), `${route}: ${mod.review.source}`).toBe(
        true,
      );
      expect(mod.review.sourceHash, route).toBe(sha1(sourceFile));
    }
  });
});

describe("release gate (#151/#152)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("publishes no Dutch route", () => {
    expect(PUBLISHED_ROUTES.nl).toEqual([]);
    for (const route of DRAFTED_ROUTES.nl) {
      expect(isRoutePublished("nl", route)).toBe(false);
    }
  });

  it("serves draft routes only when draft preview is enabled", () => {
    // Vitest runs NODE_ENV=test → preview on.
    for (const route of DRAFTED_ROUTES.nl) {
      expect(canServeNlRoute(route)).toBe(true);
    }
    expect(canServeNlRoute("/terms")).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    for (const route of DRAFTED_ROUTES.nl) {
      expect(canServeNlRoute(route)).toBe(false);
    }
  });

  it("keeps draft routes out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.every((u) => !u.includes("/nl"))).toBe(true);
  });

  it("emits no Dutch hreflang alternate for drafted routes", () => {
    for (const route of DRAFTED_ROUTES.nl) {
      const m = createMetadata({ title: "t", path: route });
      const langs = m.alternates?.languages ?? {};
      expect(langs).not.toHaveProperty("nl");
      expect(
        Object.values(langs).every((u) => !String(u).includes("/nl")),
      ).toBe(true);
    }
  });
});

describe("shared UI dictionary (#151)", () => {
  const flatten = (obj: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([key, value]) =>
      value && typeof value === "object"
        ? flatten(value as Record<string, unknown>, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    );

  it("has exactly the same key set in Dutch as in English", () => {
    expect(flatten(nlUi).sort()).toEqual(flatten(enUi).sort());
  });

  it("leaves no key untranslated except intentional proper nouns/brand terms", () => {
    // Values that are intentionally identical in both locales: proper nouns,
    // brand/certification/product names, and words spelled the same in Dutch.
    const allowIdentical = new Set([
      "footer.headings.contact",
      "footer.exploreLinks.contact",
      "footer.resourceLinks.faq",
      "hero.trust.reviews",
      "contactForm.whatsappCta",
      "contactForm.fields.partySize.placeholder",
      "contactForm.handoffMessage.labels.whatsapp",
      "contactForm.inquiries.try-scuba.label",
      "contactForm.inquiries.sdi-open-water.label",
      "contactForm.inquiries.sdi-advanced-specialty.label",
      "contactForm.inquiries.sdi-nitrox.label",
      "contactForm.inquiries.sdi-rescue.label",
      "contactForm.inquiries.sdi-divemaster.label",
      "contactForm.inquiries.tdi-technical.label",
      "contactForm.inquiries.saba-lace.label",
      "findSeaSaba.tooltipName",
      "findSeaSaba.tooltipPlace",
      "experienceSelector.pills.classic",
      "experienceSelector.pills.advanced",
      "experienceSelector.pills.afternoon",
      "experienceSelector.pills.snorkel",
      "experienceSelector.pills.tryscuba",
      "notFound.heading",
      "contactPage.visitName",
      "contactPage.whatsappLabel",
    ]);

    const compare = (en: unknown, nl: unknown, key: string) => {
      if (en && typeof en === "object") {
        for (const [k, v] of Object.entries(en as Record<string, unknown>)) {
          compare(v, (nl as Record<string, unknown>)[k], `${key}${k}.`);
        }
        return;
      }
      if (en === nl) {
        expect(
          allowIdentical.has(key.slice(0, -1)),
          `untranslated key: ${key.slice(0, -1)}`,
        ).toBe(true);
      }
    };
    compare(enUi, nlUi, "");
  });
});

describe("anchor preservation (#151)", () => {
  // Anchors referenced by the English source must appear in the Dutch module,
  // so deep links like /nl/diving#nitrox keep working.
  const ANCHOR_REQUIREMENTS: Record<string, string[]> = {
    "diving.tsx": [
      "divingAnchors.options",
      "divingAnchors.sabaDiving",
      "divingAnchors.diveDay",
      "divingAnchors.certification",
      "divingAnchors.mixedExperience",
      "divingAnchors.juniorDivers",
      "divingAnchors.equipment",
      "divingAnchors.nitrox",
      "divingAnchors.marinePark",
      "divingAnchors.altitudeFlying",
      "divingAnchors.technicalDiving",
      "divingAnchors.faq",
    ],
    "plan-your-trip.tsx": [
      "planYourTripAnchors.gettingHere",
      "planYourTripAnchors.whenToVisit",
      "planYourTripAnchors.whereToStay",
      "planYourTripAnchors.goodToKnow",
      "planYourTripAnchors.whatToBring",
      "planYourTripAnchors.restaurants",
      "planYourTripAnchors.recommendedPartners",
      "planYourTripAnchors.experiences",
      "planYourTripAnchors.snorkeling",
      "planYourTripAnchors.hiking",
      "planYourTripAnchors.history",
      "planYourTripAnchors.faq",
    ],
  };

  for (const [file, refs] of Object.entries(ANCHOR_REQUIREMENTS)) {
    it(`${file} preserves every English section anchor`, () => {
      const source = nlModuleSource(file);
      for (const ref of refs) {
        expect(source, `${file} missing ${ref}`).toContain(ref);
      }
    });
  }
});

describe("English-only surfaces stay English (#151)", () => {
  it("creates no Dutch legal pages", () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? walk(path.join(dir, entry.name))
          : [path.join(dir, entry.name)],
      );
    const files = walk(APP_NL_DIR).map((f) => f.replaceAll("\\", "/"));
    for (const legal of ["terms", "privacy", "cookie-policy"]) {
      expect(files.some((f) => f.includes(legal)), `found nl ${legal}`).toBe(
        false,
      );
    }
  });

  it("links legal and other English-only pages without a locale prefix", () => {
    const source = [
      "diving.tsx",
      "plan-your-trip.tsx",
      "courses.tsx",
      "home.tsx",
      "contact.tsx",
      "book.tsx",
    ]
      .map(nlModuleSource)
      .join("\n");
    // English-only destinations must be literal paths, never localeHref'd.
    expect(source).not.toMatch(/localeHref\("nl",\s*"\/(terms|privacy|cookie-policy|dive-sites|visiting-yachts|partners|dive-log|about)/);
  });

  it("routes internal links through localeHref or literal English-only paths", () => {
    const localized = ["/diving", "/plan-your-trip", "/courses", "/contact", "/book"];
    for (const file of [
      "diving.tsx",
      "plan-your-trip.tsx",
      "courses.tsx",
      "home.tsx",
      "contact.tsx",
      "book.tsx",
    ]) {
      const source = nlModuleSource(file);
      for (const route of localized) {
        // No literal unprefixed link to a route that has a Dutch version.
        expect(
          source,
          `${file} has literal ${route} link`,
        ).not.toMatch(new RegExp(`href=[{"'\`]${route.replace("/", "\\/")}`));
      }
    }
  });
});

describe("glossary consistency (#151)", () => {
  const diving = nlModuleSource("diving.tsx");
  const all = [
    "diving.tsx",
    "plan-your-trip.tsx",
    "courses.tsx",
    "home.tsx",
    "contact.tsx",
    "book.tsx",
  ]
    .map(nlModuleSource)
    .join("\n");

  it("uses the established Dutch scuba terms from GLOSSARY.md", () => {
    // Present where the concept appears.
    expect(diving).toContain("trimvest");
    expect(diving).toContain("duikcomputer");
    expect(diving).toContain("driftduik");
    expect(diving).toContain("mooring");
    expect(diving).toContain("decompressiekamer");
    expect(diving).toContain("privégids");
    expect(all).toContain("brevet");
  });

  it("keeps proper nouns and agency names untranslated", () => {
    expect(all).toContain("Sea Saba");
    expect(all).toContain("Marine Park");
    expect(all).toContain("Nitrox");
    expect(all).toContain("SDI");
    expect(all).toContain("Try Scuba");
    expect(all).toContain("Checkfront");
  });

  it("never fabricates a translated agency or brand name", () => {
    for (const invented of [
      "Open Water Duiker",
      "Duikmeester",
      "Geavanceerde Open Water",
      "Proefduik",
      "Saba Mariene Park",
    ]) {
      expect(all, `invented term ${invented}`).not.toContain(invented);
    }
  });
});

describe("contact workflow (#151)", () => {
  it("keeps English inquiry slugs as the canonical values", () => {
    const source = nlModuleSource("contact.tsx") + nlModuleSource("diving.tsx");
    // Query-param targets must keep the English slug, e.g. interest=tdi-technical.
    expect(source).toContain("interest=tdi-technical");
    expect(source).toContain("interest=book-diving");
  });
});
