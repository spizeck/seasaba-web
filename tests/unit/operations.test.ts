import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  BOOKABLE_PRODUCTS,
  CHECKFRONT_ALL_ITEM_IDS,
  CHECKFRONT_EXTRA_ITEMS,
  CRUISE_PRODUCTS,
  DIVE_PRODUCTS,
  INQUIRY_TYPES,
  OPERATIONS,
  bookingHref,
  inquiryFor,
  resolveBookingItem,
  type BookableProduct,
} from "@/data/operations";
import { CONTACT } from "@/lib/constants";

// These tests guard invariants of the canonical data, not the values
// themselves — the values are the source of truth and should not be
// duplicated here.

function collectInterestSlugs(): Set<string> {
  return collectQueryValues(/interest=([a-z0-9-]+)/g);
}

function collectBookItemSlugs(): Set<string> {
  return collectQueryValues(/item=([a-z0-9-]+)/g);
}

function collectQueryValues(pattern: RegExp): Set<string> {
  const values = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(entry)) {
        for (const m of readFileSync(p, "utf8").matchAll(pattern)) {
          values.add(m[1]);
        }
      }
    }
  };
  for (const root of ["app", "components"]) walk(root);
  return values;
}

const products: BookableProduct[] = Object.values(DIVE_PRODUCTS);

describe("canonical dive products", () => {
  it("keeps slugs and Checkfront item ids unique", () => {
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.checkfrontItemId)).size).toBe(products.length);
  });

  it("keys each product record by its own slug", () => {
    for (const [key, product] of Object.entries(DIVE_PRODUCTS)) {
      expect(product.slug).toBe(key);
    }
  });

  it("gives every scheduled product well-formed pickup, departure, and return times", () => {
    const time = /^\d{1,2}:\d{2} (AM|PM)$/;
    const scheduled = products.filter((p) => p.schedule);
    expect(scheduled.length).toBeGreaterThan(0);
    for (const p of scheduled) {
      expect(p.schedule!.taxiPickup).toMatch(time);
      expect(p.schedule!.departure).toMatch(time);
      expect(p.schedule!.returns).toMatch(time);
    }
  });

  it("derives booking deep links from product slugs", () => {
    for (const p of Object.values(BOOKABLE_PRODUCTS)) {
      expect(bookingHref(p.slug as keyof typeof BOOKABLE_PRODUCTS)).toBe(`/book?item=${p.slug}`);
    }
  });

  it("does not collide extra Checkfront items with marketed products", () => {
    const marketed = new Set<string>(products.map((p) => p.checkfrontItemId));
    for (const id of Object.keys(CHECKFRONT_EXTRA_ITEMS)) {
      expect(marketed.has(id)).toBe(false);
    }
  });

  it("flags a nitrox policy for products where nitrox applies", () => {
    expect(DIVE_PRODUCTS.classic.nitrox).toBe("included");
    expect(DIVE_PRODUCTS.advanced.nitrox).toBe("required-first-dive");
  });

  it("encodes the shared dive-day slots so products overlap as documented", () => {
    expect(DIVE_PRODUCTS.advanced.diveSlots).toEqual([1, 2]);
    expect(DIVE_PRODUCTS.classic.diveSlots).toEqual([2, 3]);
    expect(DIVE_PRODUCTS.afternoon.diveSlots).toEqual([3]);
    // The /diving mixed-experience copy depends on Advanced↔Classic sharing
    // Dive 2 and Classic↔Afternoon sharing Dive 3.
    expect(DIVE_PRODUCTS.advanced.diveSlots).toContain(2);
    expect(DIVE_PRODUCTS.classic.diveSlots).toEqual(
      expect.arrayContaining([2, 3])
    );
  });
});

describe("canonical cruise products", () => {
  it("maps the owner-confirmed sunset cruise items", () => {
    expect(CRUISE_PRODUCTS["sunset-cruise"].checkfrontItemId).toBe("247");
    expect(CRUISE_PRODUCTS["sunset-cruise"].name).toBe("Shared Sunset Cruise");
    expect(CRUISE_PRODUCTS["private-sunset-cruise"].checkfrontItemId).toBe("328");
    expect(CRUISE_PRODUCTS["private-sunset-cruise"].name).toBe("Private Sunset Cruise");
  });

  it("does not collide with dive products on slug or item id", () => {
    const diveSlugs = new Set<string>(Object.values(DIVE_PRODUCTS).map((p) => p.slug));
    const diveIds = new Set<string>(Object.values(DIVE_PRODUCTS).map((p) => p.checkfrontItemId));
    for (const p of Object.values(CRUISE_PRODUCTS)) {
      expect(diveSlugs.has(p.slug)).toBe(false);
      expect(diveIds.has(p.checkfrontItemId)).toBe(false);
    }
  });

  it("lists every cruise item in the Checkfront inventory allowlist", () => {
    for (const p of Object.values(CRUISE_PRODUCTS)) {
      expect(CHECKFRONT_ALL_ITEM_IDS.split(",")).toContain(p.checkfrontItemId);
    }
  });
});

describe("booking item resolution", () => {
  it("resolves every marketed slug to its Checkfront item id", () => {
    for (const p of Object.values(BOOKABLE_PRODUCTS)) {
      const resolved = resolveBookingItem(p.slug);
      expect(resolved.unknown).toBe(false);
      expect(resolved.itemId).toBe(p.checkfrontItemId);
    }
  });

  it("resolves the sunset cruise slugs to their owner-confirmed items", () => {
    expect(resolveBookingItem("sunset-cruise")).toEqual({ itemId: "247", unknown: false });
    expect(resolveBookingItem("private-sunset-cruise")).toEqual({ itemId: "328", unknown: false });
  });

  it("accepts numeric ids that exist in the Checkfront inventory", () => {
    for (const id of CHECKFRONT_ALL_ITEM_IDS.split(",")) {
      expect(resolveBookingItem(id)).toEqual({ itemId: id, unknown: false });
    }
  });

  it("rejects unknown values without inventing an item id", () => {
    for (const bad of ["bogus", "classic2", "999", "CLASSIC"]) {
      expect(resolveBookingItem(bad)).toEqual({ itemId: null, unknown: true });
    }
  });

  it("treats a missing param as no preselection, not an error", () => {
    expect(resolveBookingItem(undefined)).toEqual({ itemId: null, unknown: false });
    expect(resolveBookingItem("")).toEqual({ itemId: null, unknown: false });
  });

  it("resolves every literal /book?item= link used on the site", () => {
    for (const slug of collectBookItemSlugs()) {
      expect(resolveBookingItem(slug).unknown, `/book?item=${slug} has no matching product or item id`).toBe(false);
    }
  });
});

describe("contact inquiry registry", () => {
  it("has unique slugs with labels and subjects", () => {
    const values = INQUIRY_TYPES.map((i) => i.value);
    expect(new Set(values).size).toBe(values.length);
    for (const i of INQUIRY_TYPES) {
      expect(i.label).toBeTruthy();
      expect(i.subject).toBeTruthy();
    }
  });

  it("resolves every /contact?interest= link used on the site", () => {
    const used = collectInterestSlugs();
    expect(used.size).toBeGreaterThan(0);
    for (const slug of used) {
      expect(inquiryFor(slug), `?interest=${slug} has no inquiry type`).toBeDefined();
    }
  });

  it("declares a valid progressive-disclosure field model", () => {
    const VALID = ["whatsapp", "dates", "partySize", "certification", "loggedDives"];
    for (const i of INQUIRY_TYPES) {
      expect(new Set(i.fields).size, `${i.value} has duplicate fields`).toBe(i.fields.length);
      for (const f of i.fields) expect(VALID, `${i.value}.${f}`).toContain(f);
      if (i.fields.includes("partySize")) {
        expect(i.partyLabel, `${i.value} needs partyLabel`).toBeTruthy();
      }
    }
  });

  it("never asks entry-level or non-diving inquiries for scuba credentials", () => {
    for (const slug of [
      "try-scuba",
      "sdi-open-water",
      "general",
      "other",
      "sunset-cruise",
      "private-charter",
      "group-travel",
      "saba-lace",
      "jewelry-making",
      "glass-art",
      "transportation",
    ]) {
      const i = inquiryFor(slug)!;
      expect(i.fields, slug).not.toContain("certification");
      expect(i.fields, slug).not.toContain("loggedDives");
    }
  });
});

describe("shared business facts", () => {
  it("exposes the facts pages share", () => {
    expect(typeof OPERATIONS.establishedYear).toBe("number");
    expect(typeof OPERATIONS.maxRecreationalDiversPerGuide).toBe("number");
    expect(OPERATIONS.nitroxBlend).toMatch(/%$/);
    expect(OPERATIONS.harbor).toBeTruthy();
  });
});

describe("contact consistency", () => {
  it("keeps derived contact hrefs consistent with their raw values", () => {
    expect(CONTACT.whatsappHref).toBe(`https://wa.me/${CONTACT.whatsappNumber}`);
    expect(CONTACT.phoneHref).toBe(`tel:${CONTACT.phoneRaw}`);
    expect(CONTACT.address.displayLines[0]).toBe(CONTACT.address.streetAddress);
  });
});
