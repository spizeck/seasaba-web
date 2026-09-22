import { describe, expect, it } from "vitest";
import {
  isLocale,
  isRoutePublished,
  localizedPath,
  LOCALES,
  LOCALE_NAMES,
  parsePathname,
  PREFIXED_LOCALES,
  PUBLISHED_ROUTES,
} from "@/lib/locale";
import { createMetadata } from "@/lib/metadata";

describe("locale config (#150)", () => {
  it("supports exactly en and nl, with en unprefixed", () => {
    expect(LOCALES).toEqual(["en", "nl"]);
    expect(PREFIXED_LOCALES).toEqual(["nl"]);
  });

  it("hard-allowlists locales", () => {
    expect(isLocale("nl")).toBe(true);
    expect(isLocale("en")).toBe(true);
    for (const bogus of ["xx", "de", "fr", "es", "diving", "en-US"]) {
      expect(isLocale(bogus)).toBe(false);
    }
  });

  it("keeps English URLs unprefixed and prefixes nl", () => {
    expect(localizedPath("en", "/diving")).toBe("/diving");
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("nl", "/diving")).toBe("/nl/diving");
    expect(localizedPath("nl", "/")).toBe("/nl");
    expect(localizedPath("nl", "/plan-your-trip/")).toBe("/nl/plan-your-trip");
  });

  it("parses a locale prefix and rejects unknown prefixes", () => {
    expect(parsePathname("/nl/diving")).toEqual({ locale: "nl", path: "/diving" });
    expect(parsePathname("/nl")).toEqual({ locale: "nl", path: "/" });
    expect(parsePathname("/diving")).toEqual({ locale: "en", path: "/diving" });
    // Unknown prefixes are not locales — the whole path stays intact.
    expect(parsePathname("/xx/diving")).toEqual({ locale: "en", path: "/xx/diving" });
    expect(parsePathname("/en/diving")).toEqual({ locale: "en", path: "/en/diving" });
  });

  it("labels languages in their own language", () => {
    expect(LOCALE_NAMES.nl).toBe("Nederlands");
    expect(LOCALE_NAMES.en).toBe("English");
  });
});

describe("publication gate (#150)", () => {
  it("publishes all English routes and no Dutch routes yet", () => {
    expect(isRoutePublished("en", "/diving")).toBe(true);
    expect(PUBLISHED_ROUTES.nl).toEqual([]);
    expect(isRoutePublished("nl", "/diving")).toBe(false);
    expect(isRoutePublished("nl", "/")).toBe(false);
  });
});

describe("locale-aware metadata plumbing (#153 consumes this)", () => {
  it("keeps English canonical/hreflang unprefixed with x-default", () => {
    const m = createMetadata({ title: "Diving", path: "/diving" });
    expect(m.alternates?.canonical).toBe("https://www.seasaba.com/diving");
    expect(m.alternates?.languages).toEqual({
      en: "https://www.seasaba.com/diving",
      "x-default": "https://www.seasaba.com/diving",
    });
    expect(m.openGraph).toMatchObject({ locale: "en_US" });
  });

  it("never advertises an unpublished Dutch alternate", () => {
    const m = createMetadata({ title: "Diving", path: "/diving" });
    const langs = Object.values(m.alternates?.languages ?? {}).map(String);
    expect(langs.every((u) => !u.includes("/nl"))).toBe(true);
  });

  it("produces prefixed canonical and nl og:locale for localized pages", () => {
    const m = createMetadata({ title: "Duiken", path: "/diving", locale: "nl" });
    expect(m.alternates?.canonical).toBe("https://www.seasaba.com/nl/diving");
    expect(m.openGraph).toMatchObject({ locale: "nl_NL" });
  });
});
