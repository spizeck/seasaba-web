import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(en)/page";
import AboutPage from "@/app/(en)/(content)/about/page";
import DiveSitesPage from "@/app/(en)/(content)/dive-sites/page";
import CoursesPage from "@/app/(en)/(content)/courses/page";
import PlanYourTripPage from "@/app/(en)/(content)/plan-your-trip/page";
import VisitingYachtsPage from "@/app/(en)/(content)/visiting-yachts/page";
import TermsPage from "@/app/(en)/(content)/terms/page";
import PartnersPage from "@/app/(en)/(content)/partners/page";
import DonatePage from "@/app/(en)/(content)/donate/page";
import { Footer } from "@/components/footer";
import {
  coursesAnchors,
  diveSiteAnchors,
  divingAnchors,
  partnersAnchors,
  planYourTripAnchors,
  termsAnchors,
  visitingYachtsAnchors,
} from "@/lib/anchors";

// jsdom has no router context. The partners page reads search params for its
// accommodation filters; the stub keeps it renderable here.
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
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

// Guards the internal deep-link audit (#114): every canonical anchor constant
// must resolve to a real element id, specific-purpose links must carry the
// canonical fragment, and no page may introduce duplicate ids.

function hrefOf(name: RegExp) {
  return screen.getByRole("link", { name }).getAttribute("href");
}

describe("canonical anchors resolve to real section ids", () => {
  const cases: [string, React.ReactElement, Record<string, string>][] = [
    ["/plan-your-trip", <PlanYourTripPage key="pyt" />, planYourTripAnchors],
    ["/visiting-yachts", <VisitingYachtsPage key="vy" />, visitingYachtsAnchors],
    ["/courses", <CoursesPage key="c" />, coursesAnchors],
    ["/dive-sites", <DiveSitesPage key="ds" />, diveSiteAnchors],
    ["/terms", <TermsPage key="t" />, termsAnchors],
    ["/partners", <PartnersPage key="p" />, partnersAnchors],
  ];

  for (const [path, element, anchors] of cases) {
    it(`${path} exposes every canonical anchor exactly once`, () => {
      const { container } = render(element);
      for (const id of Object.values(anchors)) {
        expect(
          container.querySelectorAll(`#${CSS.escape(id)}`),
          `missing or duplicated #${id} on ${path}`
        ).toHaveLength(1);
      }
    });
  }

  // /diving anchors are already covered by operations-sourcing.test.tsx.
  const idCheckCases: [string, React.ReactElement][] = [
    ["/", <HomePage key="home" />],
    ["/donate", <DonatePage key="d" />],
    ...cases.map(([path, element]) => [path, element] as [string, React.ReactElement]),
  ];

  for (const [path, element] of idCheckCases) {
    if (path === "/diving") continue; // covered elsewhere
    it(`${path} has no duplicate element ids`, () => {
      const { container } = render(element);
      const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes, `duplicate ids on ${path}`).toEqual([]);
    });
  }
});

describe("specific-purpose links carry canonical fragments", () => {
  it("homepage trip-planning cards land on the matching plan-your-trip sections", () => {
    render(<HomePage />);
    expect(hrefOf(/flights and ferries/i)).toBe(`/plan-your-trip#${planYourTripAnchors.gettingHere}`);
    expect(hrefOf(/explore accommodations/i)).toBe(`/plan-your-trip#${planYourTripAnchors.whereToStay}`);
    expect(hrefOf(/when to visit/i)).toBe(`/plan-your-trip#${planYourTripAnchors.whenToVisit}`);
    expect(hrefOf(/discover saba/i)).toBe(`/plan-your-trip#${planYourTripAnchors.history}`);
  });

  it("homepage dive-area teasers link to their dive-sites sections", () => {
    render(<HomePage />);
    const expected: [RegExp, string][] = [
      [/pinnacles dive sites/i, diveSiteAnchors.pinnacles],
      [/tent reef dive sites/i, diveSiteAnchors.tentReef],
      [/ladder bay dive sites/i, diveSiteAnchors.ladderBay],
      [/wells bay dive sites/i, diveSiteAnchors.wellsBay],
      [/windwardside dive sites/i, diveSiteAnchors.windwardside],
    ];
    for (const [name, anchor] of expected) {
      expect(hrefOf(name)).toBe(`/dive-sites#${anchor}`);
    }
  });

  it("generic page-level links stay page-level", () => {
    render(<HomePage />);
    // Broad-purpose CTAs keep landing on page tops.
    for (const link of screen.getAllByRole("link", { name: /^plan your trip$/i })) {
      expect(link.getAttribute("href")).toBe("/plan-your-trip");
    }
    expect(hrefOf(/explore all dive sites/i)).toBe("/dive-sites");
  });

  it.each([
    ["about", <AboutPage key="a" />],
    ["dive-sites", <DiveSitesPage key="ds" />],
  ] as const)("the %s 'View Diving Options' CTA lands on the options section", (label, element) => {
    render(element);
    expect(hrefOf(/view diving options/i), `missing deep link on ${label}`).toBe(
      `/diving#${divingAnchors.options}`
    );
  });

  it("the yacht guide's booking-terms link lands on the schedule-changes terms", () => {
    render(<VisitingYachtsPage />);
    expect(hrefOf(/booking terms/i)).toBe(`/terms#${termsAnchors.scheduleChanges}`);
  });

  it("footer deep links use the canonical plan-your-trip anchors", () => {
    render(<Footer />);
    const nav = screen.getByRole("navigation", { name: /trip planning links/i });
    for (const anchor of [
      planYourTripAnchors.whereToStay,
      planYourTripAnchors.gettingHere,
      planYourTripAnchors.whenToVisit,
      planYourTripAnchors.whatToBring,
      planYourTripAnchors.goodToKnow,
    ]) {
      const link = Array.from(nav.querySelectorAll("a")).find(
        (a) => a.getAttribute("href") === `/plan-your-trip#${anchor}`
      );
      expect(link, `missing footer link for #${anchor}`).toBeTruthy();
    }
  });

  it("donate entry points resolve: footer, partners, and plan-your-trip", () => {
    render(<Footer />);
    expect(
      screen.getByRole("link", { name: "Support Saba" }).getAttribute("href")
    ).toBe("/donate");
  });

  it("partners conservation section and plan-your-trip island section link to /donate", () => {
    const { container: partners } = render(<PartnersPage key="p" />);
    const conservation = partners.querySelector(`#${partnersAnchors.conservationPartners}`);
    expect(
      Array.from(conservation?.querySelectorAll("a") ?? []).some(
        (a) => a.getAttribute("href") === "/donate"
      ),
      "missing /donate link in partners conservation section"
    ).toBe(true);

    const { container: pyt } = render(<PlanYourTripPage key="pyt" />);
    const history = pyt.querySelector(`#${planYourTripAnchors.history}`);
    expect(
      Array.from(history?.querySelectorAll("a") ?? []).some(
        (a) => a.getAttribute("href") === "/donate"
      ),
      "missing /donate link in plan-your-trip island section"
    ).toBe(true);
  });

  it("the donate page's internal links resolve", () => {
    render(<DonatePage />);
    expect(
      hrefOf(/how the saba marine park works/i)
    ).toBe(`/diving#${divingAnchors.marinePark}`);
    expect(hrefOf(/^ask us$/i)).toBe("/contact");
  });

  it("where-to-stay on plan-your-trip offers a contact path", () => {
    const { container } = render(<PlanYourTripPage />);
    const section = container.querySelector(`#${planYourTripAnchors.whereToStay}`);
    const link = Array.from(section?.querySelectorAll("a") ?? []).find((a) =>
      (a.getAttribute("href") ?? "").startsWith("/contact")
    );
    expect(link, "missing contact link in where-to-stay").toBeTruthy();
  });
});
