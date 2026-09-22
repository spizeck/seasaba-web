import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LocalBusinessJsonLd, BUSINESS_ID } from "@/components/structured-data";
import CoursesPage from "@/app/(en)/(content)/courses/page";
import PlanYourTripPage from "@/app/(en)/(content)/plan-your-trip/page";

// Breadcrumbs is a client component reading the current route.
let mockPathname = "/diving";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// jsdom lacks matchMedia; the About page's team carousel checks
// prefers-reduced-motion on mount.
vi.stubGlobal(
  "matchMedia",
  (query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  })
);

// Issue #108: structured-data invariants. These tests verify the emitted
// JSON-LD is parseable, consistent, and derived from the same data the
// visitor sees — not duplicated copy that can drift.

function jsonLdBlocks(container: HTMLElement): Record<string, unknown>[] {
  return Array.from(
    container.querySelectorAll('script[type="application/ld+json"]')
  ).map((s) => JSON.parse(s.textContent ?? "null"));
}

describe("business entity", () => {
  it("declares exactly one consistent Sea Saba entity", () => {
    const { container } = render(<LocalBusinessJsonLd />);
    const blocks = jsonLdBlocks(container);
    expect(blocks).toHaveLength(1);
    const biz = blocks[0];
    expect(biz["@id"]).toBe(BUSINESS_ID);
    expect(biz["@type"]).toEqual(["LocalBusiness", "SportsActivityLocation"]);
    expect(biz.url).toBe("https://www.seasaba.com");
    expect(biz.telephone).toBe("+5994162246");
    expect((biz.address as Record<string, string>).addressCountry).toBe("BQ");
  });
});

describe("BreadcrumbList", () => {
  it("mirrors the visible breadcrumb trail on a content page", () => {
    mockPathname = "/visiting-yachts";
    const { container } = render(<Breadcrumbs />);
    const [crumb] = jsonLdBlocks(container);
    expect(crumb["@type"]).toBe("BreadcrumbList");
    const items = crumb.itemListElement as { position: number; name: string; item: string }[];
    expect(items.map((i) => i.name)).toEqual(["Home", "Visiting Yachts"]);
    expect(items[1].item).toBe("https://www.seasaba.com/visiting-yachts");
    // The visible <nav> must exist alongside the schema.
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
  });
});

describe("Course ItemList", () => {
  it("marks up the same course names rendered on the page", () => {
    const { container } = render(<CoursesPage />);
    const list = jsonLdBlocks(container).find((b) => b["@type"] === "ItemList");
    expect(list).toBeTruthy();
    const items = (list?.itemListElement ?? []) as { item: { "@type": string; name: string; description: string } }[];
    const names = items.map((i) => i.item.name);
    expect(names).toContain("SDI Open Water Diver");
    expect(names).toContain("TDI Technical Courses");
    for (const item of items) {
      expect(item.item["@type"]).toBe("Course");
      expect(item.item.description).toBeTruthy();
    }
    // Every marked-up course is also a visible heading.
    for (const name of names) {
      expect(container.textContent).toContain(name);
    }
  });
});

describe("FAQPage", () => {
  it("marks up exactly the visible FAQ questions on plan-your-trip", () => {
    const { container } = render(<PlanYourTripPage />);
    const faq = jsonLdBlocks(container).find((b) => b["@type"] === "FAQPage");
    expect(faq).toBeTruthy();
    const questions = (faq?.mainEntity ?? []) as { name: string; acceptedAnswer: { text: string } }[];
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.acceptedAnswer.text).toBeTruthy();
      expect(container.textContent).toContain(q.name);
    }
  });
});
