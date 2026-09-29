import { expect, it } from "vitest";
import { PARTNERS } from "@/data/partners";

// Registry sanity + the issue #184 maintenance contract: renamed/closed
// businesses must not linger, current additions must be present, and
// linkType stays consistent with the destination.
const local = PARTNERS.filter((p) => p.category === "local");
const restaurants = local.filter((p) => p.subcategory === "Restaurants");
const transportation = local.filter((p) => p.subcategory === "Transportation");
const names = restaurants.map((p) => p.name.toLowerCase());

it("lists the current restaurant/cafe businesses", () => {
  const byName = new Map(restaurants.map((p) => [p.name, p]));

  // Replaced: Liam's Cuisine is gone; Lav's View takes its place.
  expect(names.join()).not.toContain("liam");
  expect(byName.get("Lav's View")?.website).toBe(
    "https://www.facebook.com/lavsview.saba"
  );

  // Added: airport cafe and the Windwardside cafe/bistro.
  const gateZero = byName.get("Gate Zero Cafe & Bites");
  expect(gateZero?.village).toContain("Airport");
  expect(gateZero?.website).toContain("facebook.com");
  const paradise = byName.get("Island Paradise Cafe & Bistro");
  expect(paradise?.village).toBe("Windwardside");
  expect(paradise?.website).toContain("facebook.com");

  // Renamed businesses keep the current name only.
  expect(names.join()).not.toMatch(/angelina|long haul|touchdown|bottom bean/);
  expect(byName.has("Maribel's Restaurant")).toBe(true);
  expect(byName.get("Amonhana")?.website).toBe(
    "https://www.facebook.com/amonhana.saba.2025/"
  );

  // Both Bizzy B locations must remain listed.
  expect(
    restaurants.filter((p) => p.name.startsWith("Bizzy B")).map((p) => p.village)
  ).toEqual(["The Bottom", "Windwardside"]);
});

it("adds Windward Express to transportation", () => {
  const we = transportation.find((p) => p.name === "Windward Express");
  expect(we?.transportationType).toBe("airplane");
  // windwardexpress.com serves HTTP only — the verified HTTPS destination
  // is the tourism board's getting-here page (dedicated WE section).
  expect(we?.website).toBe("https://www.sabatourism.com/getting-here/");
});

it("keeps partner entries structurally consistent", () => {
  for (const p of PARTNERS) {
    // Every partner links somewhere sane.
    expect(p.website, p.name).toMatch(/^(https?:\/\/|\/)/);
    // Social destinations are labeled so cards render the right CTA.
    if (p.website.includes("facebook.com")) expect(p.linkType, p.name).toBe("facebook");
    if (p.website.includes("instagram.com")) expect(p.linkType, p.name).toBe("instagram");
    if (p.website.includes("tripadvisor.com")) expect(p.linkType, p.name).toBe("tripadvisor");
  }
  // No duplicate partner names.
  const all = PARTNERS.map((p) => p.name);
  expect(new Set(all).size).toBe(all.length);
  // Transportation entries declare their mode so cards pick an icon.
  for (const p of transportation) {
    expect(p.transportationType, p.name).toBeTruthy();
  }
});
