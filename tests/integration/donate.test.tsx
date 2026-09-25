import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { track } from "@vercel/analytics";
import DonatePage, { metadata } from "@/app/(en)/(content)/donate/page";
import { DonationsSection } from "@/components/donations/donations-section";
import { SupportRequestForm } from "@/components/donations/support-request-form";
import { DONATION_RECIPIENTS, type DonationRecipient } from "@/data/donations";
import {
  SUPPORT_REQUEST_CATEGORIES,
  SUPPORT_TYPES,
  SUPPORT_STANDARDS,
  SUPPORT_REQUEST_STEPS,
  WHO_CAN_REQUEST,
  SUPPORT_REQUEST_NO_GUARANTEE,
} from "@/data/community-support";
import { divingAnchors } from "@/lib/anchors";

// /donate (issue #171) serves two audiences: visitors looking for vetted Saba
// organizations to support directly (Sea Saba never processes donations — the
// shipped registry stays empty until the owner approves recipients), and Saba
// organizations/projects requesting support FROM Sea Saba (the community-giving
// program). Request submissions use the same visitor-handoff mechanism as the
// contact form — the requester's own email app or WhatsApp sends it, so no
// server endpoint, no shared-sender Respond.io collapse (#104).

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

  it("represents both audiences: giving visitors and island requesters", () => {
    render(<DonatePage />);
    expect(
      screen.getByRole("heading", { level: 2, name: /ways to give back/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 2, name: /request support from sea saba/i })
    ).toBeTruthy();
    // The intro signposts island requesters to the request section.
    const signpost = screen.getByRole("link", {
      name: /request support from sea saba/i,
    });
    expect(signpost.getAttribute("href")).toBe("/donate#request-support");
    expect(document.getElementById("request-support")).toBeTruthy();
  });

  it("states the existing marine-park contribution and deep-links to it", () => {
    render(<DonatePage />);
    const link = screen.getByRole("link", {
      name: /how the saba marine park works/i,
    });
    expect(link.getAttribute("href")).toBe(`/diving#${divingAnchors.marinePark}`);
  });

  it("renders the draft standards, eligibility, support types, and process from data", () => {
    render(<DonatePage />);
    for (const item of WHO_CAN_REQUEST) expect(screen.getByText(item)).toBeTruthy();
    for (const type of SUPPORT_TYPES) {
      expect(screen.getAllByText(type.label).length).toBeGreaterThan(0);
    }
    for (const standard of SUPPORT_STANDARDS) {
      expect(screen.getByText(standard.title)).toBeTruthy();
      expect(screen.getByText(standard.description)).toBeTruthy();
    }
    for (const step of SUPPORT_REQUEST_STEPS) {
      expect(screen.getByText(step)).toBeTruthy();
    }
    expect(screen.getByText(SUPPORT_REQUEST_NO_GUARANTEE)).toBeTruthy();
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
    // No fabricated recipients: the only h3 card headings are the request
    // section's subsections, not organization cards.
    expect(screen.queryByText("Example Reef Fund")).toBeNull();
  });

  it("keeps claims honest — no checkout, funding promises, or tax language", () => {
    const { container } = render(<DonatePage />);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/checkout|add to cart|processing fee/i);
    // No tax-deductibility claim without owner-supplied documentation.
    expect(text).not.toMatch(/tax[- ]deductible|501\(c\)/i);
    // No invented funding promises or approval timelines. (Real dollar
    // figures do appear — the owner-confirmed marine-park conservation fees.)
    expect(text).not.toMatch(/guaranteed (funding|support|approval)/i);
    expect(text).not.toMatch(/within \d+ (business )?(days|hours|weeks)/i);
  });

  it("uses no em or en dashes in customer-facing copy", () => {
    // Owner style rule: no em dashes in website copy. Rendering the whole
    // page covers page prose, community-support policy data, form labels and
    // helper text, and the recipients empty state in one check.
    const { container } = render(<DonatePage />);
    expect(container.textContent ?? "").not.toMatch(/[—–]/);
    expect(String(metadata.description ?? "")).not.toMatch(/[—–]/);
  });

  it("has canonical metadata naming the program for both audiences", () => {
    expect(metadata.title).toBe("Support Saba");
    expect(metadata.alternates?.canonical).toBe("https://www.seasaba.com/donate");
    const description = String(metadata.description ?? "");
    expect(description).toMatch(/support saba/i);
    expect(description).toMatch(/request/i);
  });
});

describe("community-support policy data (DRAFT)", () => {
  it("ships the promised categories as a typed list", () => {
    const labels = SUPPORT_REQUEST_CATEGORIES.map((c) => c.label);
    for (const label of [
      "Community",
      "Youth",
      "Education",
      "Conservation",
      "Animal welfare",
      "Sports",
      "Culture",
      "Events",
      "Other",
    ]) {
      expect(labels).toContain(label);
    }
  });

  it("supports non-monetary help, not just money", () => {
    const values = SUPPORT_TYPES.map((t) => t.value);
    for (const v of ["financial", "sponsorship", "goods", "services", "in-kind"]) {
      expect(values).toContain(v);
    }
    for (const t of SUPPORT_TYPES) {
      expect(t.label.trim()).not.toBe("");
      expect(t.description.trim()).not.toBe("");
    }
  });

  it("never contains invented guarantees, amounts, deadlines, or tax claims", () => {
    const copy = [
      ...SUPPORT_STANDARDS.flatMap((s) => [s.title, s.description]),
      ...SUPPORT_TYPES.flatMap((t) => [t.label, t.description]),
      ...SUPPORT_REQUEST_STEPS,
      ...WHO_CAN_REQUEST,
      SUPPORT_REQUEST_NO_GUARANTEE,
    ].join(" ");
    expect(copy).not.toMatch(/\$\s?\d|USD\s?\d/i);
    expect(copy).not.toMatch(/guaranteed (funding|support|approval)/i);
    expect(copy).not.toMatch(/tax[- ]deductible|nonprofit|501\(c\)/i);
    expect(copy).not.toMatch(/within \d+ (business )?(days|hours|weeks)/i);
    // The no-guarantee note itself must be honest, not a hidden promise.
    expect(SUPPORT_REQUEST_NO_GUARANTEE).toMatch(/doesn.t guarantee/i);
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

// ---------------------------------------------------------------------------
// Request Support form — same visitor-handoff contract as the contact form.
// Uses the real analytics plumbing (@vercel/analytics track is mocked in
// setup.ts; GTM pushes go to window.dataLayer) so the PII assertions exercise
// the actual sanitization path, not a mock of it.
// ---------------------------------------------------------------------------

async function fillValidRequest() {
  await userEvent.type(screen.getByRole("textbox", { name: /your name/i }), "Sentinel Person");
  await userEvent.type(
    screen.getByRole("textbox", { name: /organization, group, or project/i }),
    "Sentinel Youth Club"
  );
  await userEvent.type(screen.getByRole("textbox", { name: /^email/i }), "sentinel@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox", { name: /category/i }), "youth");
  await userEvent.click(screen.getByRole("checkbox", { name: /financial contribution/i }));
  await userEvent.click(screen.getByRole("checkbox", { name: /goods or supplies/i }));
  await userEvent.type(
    screen.getByRole("textbox", { name: /estimated amount or value/i }),
    "USD 9001"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: /what are you asking sea saba for/i }),
    "Sentinel request detail"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: /about the project or event/i }),
    "Sentinel project description"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: /who benefits/i }),
    "Sentinel beneficiaries"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: /when is it happening/i }),
    "Sentinel timing"
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: /contribution be used/i }),
    "Sentinel use"
  );
  await userEvent.click(
    screen.getByRole("checkbox", { name: /information above is accurate/i })
  );
}

describe("support request form", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockReturnValue(null);
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  });

  it("blocks an empty submission with accessible errors, including the acknowledgement", async () => {
    render(<SupportRequestForm />);
    await userEvent.click(screen.getByRole("button", { name: "Continue to email" }));
    for (const message of [
      "Please enter your name.",
      "Please enter your email address.",
      "Please choose a category.",
      "Please choose at least one type of support.",
      "Please tell us what you're asking Sea Saba for.",
      "Please describe the project, event, or cause.",
      "Please tell us who benefits.",
      "Please tell us when it happens or your timeline.",
      "Please tell us how our contribution would be used.",
      "Please confirm the information is accurate before sending.",
    ]) {
      expect(screen.getByText(message)).toBeVisible();
    }
    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(window.open).not.toHaveBeenCalled();
  });

  it("requires an estimated amount only when a financial contribution is selected", async () => {
    render(<SupportRequestForm />);
    await userEvent.click(screen.getByRole("checkbox", { name: /financial contribution/i }));
    await userEvent.click(screen.getByRole("button", { name: "Continue to email" }));
    expect(
      screen.getByText(/please give an estimated amount/i)
    ).toBeVisible();
  });

  it("opens the requester's own email app with the structured request", async () => {
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Continue to email" }));

    const href = String(vi.mocked(window.open).mock.calls.at(-1)?.[0]);
    const url = new URL(href);
    expect(`${url.protocol}${url.pathname}`).toBe("mailto:info@seasaba.com");
    expect(url.searchParams.get("subject")).toContain("Sentinel Youth Club");
    const body = url.searchParams.get("body") ?? "";
    expect(body).toContain("sentinel@example.test");
    expect(body).toContain("Financial contribution, Goods or supplies");
    expect(body).toContain("paying a supplier directly or purchasing goods: No");
    // The handoff notice offers a retry path.
    expect(screen.getByRole("status").textContent).toMatch(/email app should open/i);
  });

  it("records the direct-payment preference when checked", async () => {
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /pay a supplier directly/i })
    );
    await userEvent.click(screen.getByRole("button", { name: "Continue to email" }));
    const href = String(vi.mocked(window.open).mock.calls.at(-1)?.[0]);
    expect(new URL(href).searchParams.get("body")).toContain(
      "paying a supplier directly or purchasing goods: Yes"
    );
  });

  it("offers a WhatsApp handoff carrying the same request", async () => {
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(
      screen.getByRole("button", { name: "Send request by WhatsApp" })
    );
    const href = String(vi.mocked(window.open).mock.calls.at(-1)?.[0]);
    expect(href).toContain("https://wa.me/");
    expect(decodeURIComponent(href)).toContain("Sentinel request detail");
  });

  it("fires donation_request_started exactly once, before submission", async () => {
    render(<SupportRequestForm />);
    const name = screen.getByRole("textbox", { name: /your name/i });
    await userEvent.click(name);
    await userEvent.tab();
    await userEvent.click(name);
    const started = vi
      .mocked(track)
      .mock.calls.filter(([event]) => event === "donation_request_started");
    expect(started).toHaveLength(1);
  });

  it("never sends request details or PII to analytics", async () => {
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Continue to email" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Send request by WhatsApp" })
    );

    const trackCalls = vi.mocked(track).mock.calls;
    expect(
      trackCalls.filter(([event]) => event === "donation_request_submitted")
    ).toHaveLength(2);

    // Every analytics payload — Vercel track() calls and GTM dataLayer pushes —
    // serialized and scanned for anything a requester typed.
    const dataLayer = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
    const payloads = [
      ...trackCalls.map((c) => JSON.stringify(c)),
      ...dataLayer.map((e) => JSON.stringify(e)),
    ];
    for (const pii of [
      "Sentinel Person",
      "sentinel@example.test",
      "Sentinel Youth Club",
      "Sentinel request detail",
      "Sentinel project description",
      "9001",
    ]) {
      for (const payload of payloads) {
        expect(payload, `analytics leaked ${pii}`).not.toContain(pii);
      }
    }
  });
});
