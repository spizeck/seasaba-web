import { describe, expect, it } from "vitest";
import {
  buildSupportRequestMailto,
  buildSupportRequestWhatsAppUrl,
  supportRequestEmailBody,
  supportRequestSubject,
  validateSupportRequest,
  SUPPORT_REQUEST_LIMITS,
  type SupportRequestDraft,
} from "@/lib/support-request";
import { CONTACT } from "@/lib/constants";

// Submission contract for /donate's "Request Support from Sea Saba" form
// (#171). Same visitor-handoff mechanism as lib/contact.ts: the visitor's own
// email app or WhatsApp sends the request, so Respond.io files it under their
// real address — no shared-sender collapse, no server endpoint.

const VALID: SupportRequestDraft = {
  name: "Alice Johnson",
  organization: "Saba Youth Football",
  email: "alice@example.test",
  phone: "+599 416 0000",
  category: "youth",
  supportTypes: ["financial", "goods"],
  amount: "USD 500",
  request: "Sponsorship of team uniforms",
  description: "Our under-14 team needs new uniforms for the season.",
  beneficiaries: "About 30 kids aged 8-14",
  timing: "October 2026",
  useOfSupport: "Uniforms and league fees — quote available",
  vendorPayment: true,
  referenceUrl: "https://example.test/team",
  acknowledged: true,
};

describe("validateSupportRequest", () => {
  it("accepts a complete draft", () => {
    expect(validateSupportRequest(VALID)).toEqual({});
  });

  it("requires name, email, category, and the core explanation fields", () => {
    const errors = validateSupportRequest({
      ...VALID,
      name: "",
      email: "",
      category: "",
      supportTypes: [],
      request: "",
      description: "",
      beneficiaries: "",
      timing: "",
      useOfSupport: "",
    });
    for (const field of [
      "name",
      "email",
      "category",
      "supportTypes",
      "request",
      "description",
      "beneficiaries",
      "timing",
      "useOfSupport",
    ]) {
      expect(errors[field], `expected an error for ${field}`).toBeTruthy();
    }
  });

  it("rejects malformed email but not missing phone/organization", () => {
    const errors = validateSupportRequest({
      ...VALID,
      email: "not-an-email",
      phone: "",
      organization: "",
    });
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeUndefined();
    expect(errors.organization).toBeUndefined();
  });

  it("requires an estimated amount only for financial requests", () => {
    expect(
      validateSupportRequest({ ...VALID, supportTypes: ["services"], amount: "" }).amount
    ).toBeUndefined();
    expect(
      validateSupportRequest({ ...VALID, supportTypes: ["financial"], amount: "" }).amount
    ).toBeTruthy();
  });

  it("requires the accuracy acknowledgement", () => {
    const errors = validateSupportRequest({ ...VALID, acknowledged: false });
    expect(errors.acknowledged).toBeTruthy();
  });

  it("validates the optional reference URL only when provided", () => {
    expect(validateSupportRequest({ ...VALID, referenceUrl: "" }).referenceUrl).toBeUndefined();
    expect(
      validateSupportRequest({ ...VALID, referenceUrl: "not a url" }).referenceUrl
    ).toBeTruthy();
    expect(
      validateSupportRequest({ ...VALID, referenceUrl: "https://example.test/x" }).referenceUrl
    ).toBeUndefined();
  });
});

describe("supportRequestSubject", () => {
  it("prefers the organization, falls back to the requester's name", () => {
    expect(supportRequestSubject(VALID)).toBe(
      "Community Support Request — Saba Youth Football"
    );
    expect(supportRequestSubject({ ...VALID, organization: "" })).toBe(
      "Community Support Request — Alice Johnson"
    );
  });

  it("never carries newlines into the header line", () => {
    expect(
      supportRequestSubject({ ...VALID, organization: "Team\nBCC: spam@x.test" })
    ).not.toContain("\n");
  });
});

describe("supportRequestEmailBody", () => {
  it("includes every filled field with labels staff can scan", () => {
    const body = supportRequestEmailBody(VALID);
    for (const fragment of [
      "Name: Alice Johnson",
      "Email: alice@example.test",
      "Organization / group / project: Saba Youth Football",
      "Phone / WhatsApp: +599 416 0000",
      "Category: Youth",
      "Type of support requested: Financial contribution, Goods or supplies",
      "Estimated amount or value: USD 500",
      "Sponsorship of team uniforms",
      "under-14 team needs new uniforms",
      "Who benefits: About 30 kids aged 8-14",
      "When / timeline: October 2026",
      "Uniforms and league fees",
      "paying a supplier directly or purchasing goods: Yes",
      "Link to project/event info: https://example.test/team",
      "information above is accurate",
    ]) {
      expect(body, `missing ${fragment}`).toContain(fragment);
    }
  });

  it("omits empty optional fields rather than printing blank labels", () => {
    const body = supportRequestEmailBody({
      ...VALID,
      organization: "",
      phone: "",
      amount: "",
      referenceUrl: "",
    });
    expect(body).not.toContain("Organization / group / project:");
    expect(body).not.toContain("Phone / WhatsApp:");
    expect(body).not.toContain("Estimated amount or value");
    expect(body).not.toContain("Link to project/event info");
  });

  it("records the direct-payment answer honestly in both directions", () => {
    expect(supportRequestEmailBody({ ...VALID, vendorPayment: true })).toContain(
      "paying a supplier directly or purchasing goods: Yes"
    );
    expect(supportRequestEmailBody({ ...VALID, vendorPayment: false })).toContain(
      "paying a supplier directly or purchasing goods: No"
    );
  });
});

describe("handoff URLs", () => {
  it("builds a mailto to the canonical inbox with encoded subject and body", () => {
    const href = buildSupportRequestMailto(VALID);
    const url = new URL(href);
    expect(`${url.protocol}${url.pathname}`).toBe(`mailto:${CONTACT.email}`);
    expect(url.searchParams.get("subject")).toBe(
      "Community Support Request — Saba Youth Football"
    );
    const body = url.searchParams.get("body") ?? "";
    expect(body).toContain("Name: Alice Johnson");
    // mailto newlines are normalized to CRLF — the broadest mailto form.
    expect(body).toContain("\r\n");
  });

  it("builds a wa.me URL carrying the same structured request", () => {
    const href = buildSupportRequestWhatsAppUrl(VALID);
    expect(href.startsWith(`https://wa.me/${CONTACT.whatsappNumber}?text=`)).toBe(true);
    const text = decodeURIComponent(href.split("?text=")[1]);
    expect(text).toContain("Alice Johnson");
    expect(text).toContain("Sponsorship of team uniforms");
  });

  it("every field has a length cap — the mailto URI cannot grow unbounded", () => {
    for (const [field, max] of Object.entries(SUPPORT_REQUEST_LIMITS)) {
      expect(max, field).toBeGreaterThan(0);
      expect(max, field).toBeLessThanOrEqual(2000);
    }
  });
});
