import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import DonatePage from "@/app/(en)/(content)/donate/page";
import { DonationsSection } from "@/components/donations/donations-section";
import { DONATION_RECIPIENTS, type DonationRecipient } from "@/data/donations";
import { divingAnchors } from "@/lib/anchors";

// /donate (issue #171): the page explains how visitors can support Saba and
// routes donations straight to each organization's own website — Sea Saba
// never processes donations. Until the owner approves recipients, the shipped
// registry stays empty and the page must render a graceful in-progress state
// rather than fabricated organizations.

const FIXTURE: DonationRecipient[] = [
  {
    name: "Example Reef Fund",
    description: "Protects the reefs around the island.",
    funds: "Moorings, patrols, and reef monitoring",
    website: "https://reef.example.org",
    donationUrl: "https://reef.example.org/give",
    category: "conservation",
  },
  {
    name: "Example Community Project",
    description: "Community programs in the villages.",
    website: "https://community.example.org",
  },
];

describe("donate page", () => {
  it("renders a single h1, the intro, and the trust note", () => {
    render(<DonatePage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: /support saba/i })
    ).toBeTruthy();
    expect(
      screen.getByText(/never collects, processes, or retains donated funds/i)
    ).toBeTruthy();
  });

  it("states the existing marine-park contribution and deep-links to it", () => {
    render(<DonatePage />);
    const link = screen.getByRole("link", {
      name: /how the saba marine park works/i,
    });
    expect(link.getAttribute("href")).toBe(`/diving#${divingAnchors.marinePark}`);
  });

  it("renders a graceful in-progress state while the shipped registry is empty", () => {
    render(<DonatePage />);
    expect(
      screen.getByText(/assembling a short list of saba organizations/i)
    ).toBeTruthy();
    // The empty state still offers a real next step.
    expect(screen.getByRole("link", { name: /^ask us$/i }).getAttribute("href")).toBe(
      "/contact"
    );
    // No fabricated recipients: no card headings exist at all.
    expect(
      screen.queryAllByRole("heading", { level: 3 })
    ).toHaveLength(0);
  });

  it("keeps donation claims honest — no Sea Saba checkout language", () => {
    const { container } = render(<DonatePage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/checkout|add to cart|processing fee/i);
    // No tax-deductibility claim without owner-supplied documentation.
    expect(text).not.toMatch(/tax[- ]deductible|501\(c\)/i);
  });
});

describe("donation recipient cards", () => {
  it("renders name, category, description, and funding line per entry", () => {
    render(<DonationsSection recipients={FIXTURE} />);
    expect(
      screen.getByRole("heading", { name: "Example Reef Fund" })
    ).toBeTruthy();
    expect(screen.getByText("Conservation")).toBeTruthy();
    expect(screen.getByText(/protects the reefs/i)).toBeTruthy();
    expect(screen.getByText(/moorings, patrols/i)).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Example Community Project" })
    ).toBeTruthy();
  });

  it("donation CTAs open the recipient's own site in a new tab with descriptive labels", () => {
    render(<DonationsSection recipients={FIXTURE} />);
    const donate = screen.getByRole("link", { name: /donate directly to example reef fund/i });
    expect(donate.getAttribute("href")).toBe("https://reef.example.org/give");
    expect(donate.getAttribute("target")).toBe("_blank");
    expect(donate.getAttribute("rel")).toContain("noopener");
    expect(donate.getAttribute("rel")).toContain("noreferrer");
    expect(donate.getAttribute("aria-label")).toMatch(/opens in a new tab/i);

    const visit = screen.getByRole("link", { name: /visit example reef fund's website/i });
    expect(visit.getAttribute("href")).toBe("https://reef.example.org");
  });

  it("falls back to a website-only CTA when no donationUrl exists", () => {
    render(<DonationsSection recipients={FIXTURE} />);
    const card = screen
      .getByRole("heading", { name: "Example Community Project" })
      .closest("article")!;
    const scoped = within(card as HTMLElement);
    expect(scoped.queryByRole("link", { name: /donate/i })).toBeNull();
    const visit = scoped.getByRole("link", { name: /visit.*website/i });
    expect(visit.getAttribute("href")).toBe("https://community.example.org");
    expect(visit.getAttribute("target")).toBe("_blank");
  });

  it("shipped registry stays empty until owner-approved recipients land", () => {
    // Issue #171 ships the architecture without recipients; if entries are
    // added later they must satisfy the content contract instead.
    expect(Array.isArray(DONATION_RECIPIENTS)).toBe(true);
    for (const r of DONATION_RECIPIENTS) {
      expect(r.name.trim()).not.toBe("");
      expect(r.description.trim()).not.toBe("");
      expect(r.website).toMatch(/^https:\/\//);
      if (r.donationUrl) expect(r.donationUrl).toMatch(/^https:\/\//);
      if (r.image) expect(r.imageAlt?.trim()).toBeTruthy();
    }
  });
});
