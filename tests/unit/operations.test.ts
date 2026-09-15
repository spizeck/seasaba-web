import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  CHECKFRONT_EXTRA_ITEMS,
  DIVE_PRODUCTS,
  INQUIRY_TYPES,
  OPERATIONS,
  bookingHref,
  inquiryFor,
  type DiveProduct,
} from "@/data/operations";
import { CONTACT } from "@/lib/constants";

// These tests guard invariants of the canonical data, not the values
// themselves — the values are the source of truth and should not be
// duplicated here.

function collectInterestSlugs(): Set<string> {
  const slugs = new Set<string>();
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(entry)) {
        for (const m of readFileSync(p, "utf8").matchAll(/interest=([a-z0-9-]+)/g)) {
          slugs.add(m[1]);
        }
      }
    }
  };
  for (const root of ["app", "components"]) walk(root);
  return slugs;
}

const products: DiveProduct[] = Object.values(DIVE_PRODUCTS);

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
    for (const p of products) {
      expect(bookingHref(p.slug as keyof typeof DIVE_PRODUCTS)).toBe(`/book?item=${p.slug}`);
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
});

describe("shared business facts", () => {
  it("exposes the facts pages share", () => {
    expect(typeof OPERATIONS.establishedYear).toBe("number");
    expect(typeof OPERATIONS.maxDiversPerGuide).toBe("number");
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
