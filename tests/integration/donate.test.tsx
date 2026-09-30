import { existsSync } from "node:fs";
import { join } from "node:path";
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
// registry currently holds Sea & Learn Foundation and Saba Conservation
// Foundation from organization-supplied material, with final card wording
// pending each organization's review), and Saba organizations/projects
// requesting support FROM Sea Saba (the community-giving program). Request
// submissions persist through the Sea Saba-owned /api/support-requests
// boundary into the Community Support backend (issue #189, paired with
// contract-builder#148); the visitor's own email app / WhatsApp remain only
// as an explicit fallback when the system can't be reached. Recipient
// content is code-owned — the page renders DONATION_RECIPIENTS and makes
// no call to contract-builder.

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

// Compile-time contract (PR #172 review): `image` is assignable only
// alongside a required `imageAlt`, so alt text stays an explicit registry
// decision — never missing, never invented by the renderer. `npm run
// typecheck` is the guard: if the union ever loosens, the @ts-expect-error
// below fails as an unused directive.
const IMAGE_CONTRACT_FIXTURES: DonationRecipient[] = [
  {
    name: "Example No-Logo Project",
    description: "Recipient without a card image.",
    website: "https://nologo.example.org",
  },
  {
    name: "Example Logo Project",
    description: "Recipient whose card image carries deliberate alt text.",
    website: "https://logo.example.org",
    image: "/images/example-logo.webp",
    imageAlt: "Example Logo Project mark",
  },
];

// @ts-expect-error — `image` requires `imageAlt`.
const IMAGE_WITHOUT_ALT: DonationRecipient = {
  name: "Example Missing-Alt Project",
  description: "Registry entry that must not compile.",
  website: "https://missing-alt.example.org",
  image: "/images/example-logo.webp",
};

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

  it("renders the organization-confirmed recipients and no pending ones", () => {
    render(<DonatePage />);
    expect(
      screen.getByRole("heading", { name: "Sea & Learn Foundation" })
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Saba Conservation Foundation" })
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Child Focus Foundation" })
    ).toBeTruthy();
    // Recipients still in outreach must not appear: Saba Reach Foundation,
    // Body Mind & Spirit, SFPCA (deferred), and the unapproved Project
    // Bureau Saba / Sea Fan Society Foundation concept.
    for (const pending of [
      /saba reach/i,
      /body,?\s*mind/i,
      /sfpca|prevention of cruelty/i,
      /sea fan/i,
      /project bureau/i,
    ]) {
      expect(screen.queryByText(pending)).toBeNull();
    }
  });

  it("renders recipients entirely from local data — contract-builder is not needed", () => {
    // The page is a sync component reading DONATION_RECIPIENTS; no fetch,
    // no server boundary, no env config participates in rendering.
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    try {
      render(<DonatePage />);
      expect(
        screen.getByRole("heading", { name: "Sea & Learn Foundation" })
      ).toBeTruthy();
      expect(
        screen.getByRole("heading", { name: "Saba Conservation Foundation" })
      ).toBeTruthy();
      expect(
        screen.getByRole("heading", { name: "Child Focus Foundation" })
      ).toBeTruthy();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.stubGlobal("fetch", originalFetch);
    }
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

  // Issue #186: the interactive-card treatment (border/shadow emphasis +
  // focus-within) belongs only on cards that contain real actions — the
  // request form's wrapper — never on the passive info lists beside it.
  it("marks action-oriented cards interactive and leaves informational cards passive", () => {
    const { container } = render(<DonatePage />);
    const formCard = container.querySelector("form")?.parentElement;
    expect(formCard?.className).toContain("focus-within:border-primary/30");
    expect(formCard?.className).toContain("hover:border-primary/30");

    // Support-type and ground-rule items are pure information — highlighting
    // them on hover would falsely advertise them as clickable. (Labels also
    // appear in the form, so pick the copies living in card list items.)
    for (const label of [SUPPORT_TYPES[0].label, SUPPORT_STANDARDS[0].title]) {
      const cards = screen
        .getAllByText(label)
        .map((el) => el.closest("li"))
        .filter((li): li is HTMLLIElement => li !== null);
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        expect(card.className).not.toMatch(/hover:|focus-within:/);
      }
    }
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
    for (const v of ["financial", "goods", "services", "in-kind"]) {
      expect(values).toContain(v);
    }
    for (const t of SUPPORT_TYPES) {
      expect(t.label.trim()).not.toBe("");
      expect(t.description.trim()).not.toBe("");
    }
  });

  it("ships six standards and six support types — the desktop grids are full", () => {
    // Both card grids render sm:grid-cols-2; six entries fill three rows with
    // no orphan card. Guard the count so a later addition doesn't reintroduce
    // the dangling seventh card.
    expect(SUPPORT_STANDARDS).toHaveLength(6);
    expect(SUPPORT_TYPES).toHaveLength(6);
    // The merged money option keeps the "financial" slug: the amount field's
    // required-when-financial gate and existing drafts depend on it.
    expect(SUPPORT_TYPES.find((t) => t.value === "financial")?.label).toBe(
      "Financial support or sponsorship"
    );
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

  it("renders the supplied image alt text verbatim — never a generated fallback", () => {
    render(<DonationsSection recipients={IMAGE_CONTRACT_FIXTURES} />);
    expect(screen.getByAltText("Example Logo Project mark")).toBeTruthy();
    const noLogoCard = screen
      .getByRole("heading", { name: "Example No-Logo Project" })
      .closest("article")!;
    expect(within(noLogoCard as HTMLElement).queryByRole("img")).toBeNull();
    // Keeps the negative fixture live; the real check is `npm run typecheck`.
    expect(IMAGE_WITHOUT_ALT.image).toBe("/images/example-logo.webp");
  });

  it("still renders the graceful in-progress state when the registry is empty", () => {
    render(<DonationsSection recipients={[]} />);
    expect(
      screen.getByText(/assembling a short list of saba organizations/i)
    ).toBeTruthy();
    // The empty state still offers a real next step.
    expect(screen.getByRole("link", { name: /^ask us$/i }).getAttribute("href")).toBe(
      "/contact"
    );
  });

  // Issue #186: button-shaped links inside prose must not inherit the
  // text-link underline; ordinary text links keep it.
  it("renders Donate directly through the shared button slot and keeps Visit website a text link", () => {
    render(<DonationsSection recipients={FIXTURE} />);
    const donate = screen.getByRole("link", {
      name: /donate directly to example reef fund/i,
    });
    expect(donate).toHaveAttribute("data-slot", "button");
    expect(donate.className).toContain("no-underline");

    const visit = screen.getByRole("link", {
      name: /visit example reef fund's website/i,
    });
    expect(visit).not.toHaveAttribute("data-slot");
    expect(visit.className).not.toContain("no-underline");
  });

  it("gives action cards the shared hover/focus-within treatment without motion", () => {
    render(<DonationsSection recipients={FIXTURE} />);
    const card = screen
      .getByRole("heading", { name: "Example Reef Fund" })
      .closest("article")!;
    expect(card.className).toContain("hover:border-primary/30");
    expect(card.className).toContain("hover:shadow-sm");
    // Keyboard users tabbing into the card's actions get the same cue.
    expect(card.className).toContain("focus-within:border-primary/30");
    expect(card.className).toContain("focus-within:shadow-sm");
    // The treatment is visual only — no translate/scale/layout shift.
    expect(card.className).not.toMatch(/translate|scale/);
  });
});

describe("donation recipient registry (#171)", () => {
  // Sea & Learn and SCF come from the organizations' own September 2026
  // outreach replies (final card wording pending their review); Child Focus
  // Foundation was added per owner request with owner-supplied copy and
  // bank details (#195).
  it("holds exactly the three organization-confirmed recipients", () => {
    expect(DONATION_RECIPIENTS).toHaveLength(3);
    expect(DONATION_RECIPIENTS.map((r) => r.name)).toEqual([
      "Sea & Learn Foundation",
      "Saba Conservation Foundation",
      "Child Focus Foundation",
    ]);
  });

  it("gives Sea & Learn its canonical donation URL, free of tracking params", () => {
    const recipient = DONATION_RECIPIENTS.find(
      (r) => r.name === "Sea & Learn Foundation"
    );
    expect(recipient?.donationUrl).toBe("https://www.seaandlearn.org/donate");
    expect(recipient?.donationUrl).not.toMatch(/[?#]/);
    // Year-round framing: the card must not read as the October event.
    expect(recipient?.description).toMatch(/year-round/i);
    expect(`${recipient?.description} ${recipient?.funds ?? ""}`).not.toMatch(
      /october|annual event/i
    );
  });

  it("gives SCF its preferred donation page — never the raw PayPal URL", () => {
    const recipient = DONATION_RECIPIENTS.find(
      (r) => r.name === "Saba Conservation Foundation"
    );
    expect(recipient?.donationUrl).toBe(
      "https://sabapark.org/saba-conservation-foundation/donate-support/"
    );
    // SCF supplied a direct PayPal link but asked us not to use it; PayPal
    // must not appear anywhere in the registry.
    expect(JSON.stringify(DONATION_RECIPIENTS)).not.toMatch(/paypal/i);
    // Their requested emphasis: the marine park and coral restoration.
    expect(`${recipient?.description} ${recipient?.funds ?? ""}`).toMatch(
      /national marine park/i
    );
    expect(`${recipient?.description} ${recipient?.funds ?? ""}`).toMatch(
      /coral restoration/i
    );
  });

  it("describes SCF's mission on land and at sea — both national parks", () => {
    const recipient = DONATION_RECIPIENTS.find(
      (r) => r.name === "Saba Conservation Foundation"
    );
    // SCF's review request: the description carries the full mission
    // (Saba National Marine Park AND Mt. Scenery National Park), while
    // the funding line keeps the visitor-donation marine emphasis.
    expect(recipient?.description).toMatch(/on land and at sea/i);
    expect(recipient?.description).toMatch(/saba national marine park/i);
    expect(recipient?.description).toMatch(/mt\.? scenery national park/i);
    expect(recipient?.funds).toMatch(/national marine park/i);
    expect(recipient?.funds).toMatch(/coral restoration/i);
    expect(recipient?.category).toBe("marine-conservation");
  });

  it("sends every donation CTA straight to the recipient's own site", () => {
    render(<DonationsSection recipients={DONATION_RECIPIENTS} />);
    for (const r of DONATION_RECIPIENTS) {
      // Recipients without a donationUrl (Child Focus Foundation) take direct
      // bank transfers instead — their card carries bank details, not a link.
      if (!r.donationUrl) continue;
      const cta = screen.getByRole("link", {
        name: new RegExp(`donate directly to ${r.name}`, "i"),
      });
      expect(cta.getAttribute("href")).toBe(r.donationUrl);
      expect(cta.getAttribute("target")).toBe("_blank");
      // First-party recipient domain only — Sea Saba never touches the gift.
      expect(new URL(r.donationUrl).hostname).not.toContain("seasaba.com");
    }
  });

  it("keeps every entry inside the content contract", () => {
    expect(Array.isArray(DONATION_RECIPIENTS)).toBe(true);
    for (const r of DONATION_RECIPIENTS) {
      expect(r.name.trim()).not.toBe("");
      expect(r.description.trim()).not.toBe("");
      // A website is optional — a recipient may take direct bank transfers
      // instead. Either way the card must offer a real donation path.
      if (r.website) expect(r.website).toMatch(/^https:\/\//);
      if (r.donationUrl) expect(r.donationUrl).toMatch(/^https:\/\//);
      expect(
        r.website || r.donationUrl || r.bankDetails,
        `${r.name} has no donation path`,
      ).toBeTruthy();
      if (r.image) {
        // Logos are organization-supplied local assets under public/images —
        // never a hotlinked third-party URL, and the file must actually ship.
        expect(r.imageAlt?.trim()).toBeTruthy();
        expect(r.image).toMatch(/^\/images\//);
        expect(
          existsSync(join(process.cwd(), "public", r.image)),
          `${r.name} image ${r.image}`
        ).toBe(true);
      }
      // No invented charitable claims in organization-facing copy.
      expect(`${r.description} ${r.funds ?? ""}`).not.toMatch(
        /tax[- ]deductible|nonprofit|501\(c\)/i
      );
    }
  });
});

describe("Child Focus Foundation card (#195)", () => {
  const card = () =>
    screen.getByRole("heading", { name: "Child Focus Foundation" })
      .closest("article") as HTMLElement;

  it("renders the supplied copy, logo, and youth category", () => {
    render(<DonationsSection recipients={DONATION_RECIPIENTS} />);
    const scoped = within(card());
    expect(scoped.getByAltText("Child Focus Foundation logo")).toBeTruthy();
    expect(scoped.getByText("Youth")).toBeTruthy();
    expect(scoped.getByText(/after-school program/i)).toBeTruthy();
    // Owner copy uses a hyphen for the age range — never an en/em dash.
    expect(scoped.getByText(/ages 4-12/)).toBeTruthy();
  });

  it("shows the exact supplied bank details, marked as the foundation's own account", () => {
    render(<DonationsSection recipients={DONATION_RECIPIENTS} />);
    const scoped = within(card());
    expect(scoped.getByText(/direct bank transfer/i)).toBeTruthy();
    expect(
      scoped.getByText(/not a Sea Saba account/i)
    ).toBeTruthy();
    for (const value of [
      "Child Focus Foundation",
      "8600002172025517",
      "RBC",
      "RBTTBQSAXXX",
    ]) {
      expect(scoped.getAllByText(value).length).toBeGreaterThan(0);
    }
  });

  it("offers copy buttons for the account number and SWIFT code", async () => {
    render(<DonationsSection recipients={DONATION_RECIPIENTS} />);
    const scoped = within(card());
    for (const label of [/copy account number/i, /copy swift code/i]) {
      expect(scoped.getByRole("button", { name: label })).toBeTruthy();
    }
  });

  it("has no outbound donation link — CFF takes bank transfers only", () => {
    render(<DonationsSection recipients={DONATION_RECIPIENTS} />);
    const scoped = within(card());
    expect(scoped.queryByRole("link")).toBeNull();
    const recipient = DONATION_RECIPIENTS.find(
      (r) => r.name === "Child Focus Foundation"
    );
    expect(recipient?.website).toBeUndefined();
    expect(recipient?.donationUrl).toBeUndefined();
    // The bank details belong to CFF — the account number is theirs, not
    // Sea Saba's, and no value may drift from the owner-supplied strings.
    expect(recipient?.bankDetails).toEqual({
      accountName: "Child Focus Foundation",
      accountNumber: "8600002172025517",
      bankName: "RBC",
      swift: "RBTTBQSAXXX",
    });
  });
});

// ---------------------------------------------------------------------------
// Request Support form — persistence-first contract (issue #189). The form
// posts to the first-party /api/support-requests boundary; these tests stub
// global fetch and simulate the boundary's wire responses, so no backend is
// needed. Uses the real analytics plumbing (@vercel/analytics track is
// mocked in setup.ts; GTM pushes go to window.dataLayer) so the PII
// assertions exercise the actual sanitization path, not a mock of it.
// ---------------------------------------------------------------------------

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function boundarySuccess(reference = "CSR-2026-0042") {
  return jsonResponse(200, { ok: true, reference });
}

function readPostedRequest(callIndex = 0) {
  const call = vi.mocked(fetch).mock.calls[callIndex];
  expect(call, "expected a fetch to the submission boundary").toBeTruthy();
  expect(String(call?.[0])).toBe("/api/support-requests");
  const init = call?.[1] as RequestInit;
  expect(init.method).toBe("POST");
  return JSON.parse(String(init.body)) as {
    request: Record<string, unknown>;
    idempotencyKey?: string;
    submittedAt?: string;
    website?: string;
  };
}

async function fillValidRequest() {
  await userEvent.type(screen.getByRole("textbox", { name: /your name/i }), "Sentinel Person");
  await userEvent.type(
    screen.getByRole("textbox", { name: /organization, group, or project/i }),
    "Sentinel Youth Club"
  );
  await userEvent.type(screen.getByRole("textbox", { name: /^email/i }), "sentinel@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox", { name: /category/i }), "youth");
  await userEvent.click(screen.getByRole("checkbox", { name: /financial support or sponsorship/i }));
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
    vi.stubGlobal("fetch", vi.fn());
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
  });

  it("blocks an empty submission with accessible errors, including the acknowledgement", async () => {
    render(<SupportRequestForm />);
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));
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
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requires an estimated amount only when financial support is selected", async () => {
    render(<SupportRequestForm />);
    await userEvent.click(screen.getByRole("checkbox", { name: /financial support or sponsorship/i }));
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));
    expect(
      screen.getByText(/please give an estimated amount/i)
    ).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });

  // fillValidRequest() types through ~10 real fields via userEvent — easily
  // 3-4s on a fast machine and past the 5s default under full-suite load.
  // A timed-out test can strand queued input events that corrupt the next
  // test's render, so the submission tests get explicit headroom.
  it("persists through the first-party boundary and shows the returned reference", { timeout: 20000 }, async () => {
    vi.mocked(fetch).mockResolvedValue(boundarySuccess());
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(
      screen.getByRole("checkbox", { name: /pay a supplier directly/i })
    );
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    const posted = readPostedRequest();
    expect(posted.request.name).toBe("Sentinel Person");
    expect(posted.request.email).toBe("sentinel@example.test");
    expect(posted.request.organization).toBe("Sentinel Youth Club");
    expect(posted.request.category).toBe("youth");
    expect(posted.request.supportTypes).toEqual(["financial", "goods"]);
    expect(posted.request.amount).toBe("USD 9001");
    expect(posted.request.request).toBe("Sentinel request detail");
    expect(posted.request.vendorPayment).toBe(true);
    expect(posted.request.acknowledged).toBe(true);
    expect(posted.idempotencyKey).toMatch(/^[\w:.-]{8,128}$/);
    expect(posted.submittedAt).toBeTruthy();
    // The honeypot is untouched by real interaction.
    expect(posted.website).toBe("");

    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("CSR-2026-0042");
    // The form is gone — nothing left to double-submit.
    expect(screen.queryByRole("button", { name: "Send request" })).toBeNull();
  });

  it("never shows success when the boundary fails, and keeps every entry", { timeout: 20000 }, async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(503, { ok: false, kind: "unavailable" })
    );
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/couldn't confirm whether our system saved/i);
    expect(alert.textContent).toMatch(/try sending it again/i);
    // A fallback channel could duplicate a silently-persisted request.
    expect(alert.textContent).toMatch(/may create a duplicate/i);
    // No false success anywhere.
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText(/CSR-\d{4}-\d{4}/)).toBeNull();
    // Entered data survives the recoverable failure.
    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveValue(
      "Sentinel Person"
    );
    expect(screen.getByRole("textbox", { name: /^email/i })).toHaveValue(
      "sentinel@example.test"
    );
    // The handoff fallback carries the same request to the canonical inbox.
    const emailFallback = screen.getByRole("link", { name: /send it by email/i });
    expect(emailFallback.getAttribute("href")).toMatch(/^mailto:info@seasaba\.com/);
    const whatsAppFallback = screen.getByRole("link", { name: /send it by whatsapp/i });
    expect(whatsAppFallback.getAttribute("href")).toMatch(/^https:\/\/wa\.me\//);
  });

  it("surfaces backend validation failures on the matching fields", { timeout: 20000 }, async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, {
        ok: false,
        kind: "validation",
        fields: { email: "Email is not a valid address." },
      })
    );
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    await screen.findByRole("alert");
    expect(
      await screen.findByText("Email is not a valid address.")
    ).toBeVisible();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows a wait-and-retry message when the boundary is rate limited", { timeout: 20000 }, async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { ok: false, kind: "rate_limited" })
    );
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/wait a moment/i);
    expect(screen.getByRole("textbox", { name: /your name/i })).toHaveValue(
      "Sentinel Person"
    );
  });

  it("reuses the same idempotency key when an unchanged draft is retried", { timeout: 20000 }, async () => {
    vi.mocked(fetch)
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(boundarySuccess("CSR-2026-0007"));
    render(<SupportRequestForm />);
    await fillValidRequest();

    await userEvent.click(screen.getByRole("button", { name: "Send request" }));
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));

    await screen.findByRole("status");
    const first = readPostedRequest(0).idempotencyKey;
    const second = readPostedRequest(1).idempotencyKey;
    expect(first).toBeTruthy();
    expect(second).toBe(first);
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

  it("never sends request details or PII to analytics", { timeout: 20000 }, async () => {
    vi.mocked(fetch).mockResolvedValue(boundarySuccess());
    render(<SupportRequestForm />);
    await fillValidRequest();
    await userEvent.click(screen.getByRole("button", { name: "Send request" }));
    await screen.findByRole("status");

    const trackCalls = vi.mocked(track).mock.calls;
    for (const event of [
      "donation_request_started",
      "donation_request_submitted",
      "donation_request_succeeded",
    ]) {
      expect(
        trackCalls.filter(([name]) => name === event),
        `expected exactly one ${event}`
      ).toHaveLength(1);
    }
    // No failure event on the happy path.
    expect(
      trackCalls.filter(([name]) => name === "donation_request_failed")
    ).toHaveLength(0);

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
      // The returned reference stays out of analytics too.
      "CSR-2026-0042",
    ]) {
      for (const payload of payloads) {
        expect(payload, `analytics leaked ${pii}`).not.toContain(pii);
      }
    }
  });
});
