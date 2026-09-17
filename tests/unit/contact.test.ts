import { describe, expect, it } from "vitest";
import {
  buildContactMailto,
  contactEmailBody,
  contactEmailSubject,
  type InquiryDraft,
} from "@/lib/contact";

// The contact form's delivery path is a client-side mailto: handoff — the
// visitor's own email app sends the message, so Respond.io sees the real
// visitor identity. These tests pin the generated subject/body contract.

const BASE: InquiryDraft = {
  name: "Jane Smith",
  email: "jane@example.com",
  whatsapp: "",
  dates: "",
  students: "",
  certification: "",
  loggedDives: "",
  preferredContact: "email",
  inquiryType: "try-scuba",
  message: "I'd like to try scuba while visiting Saba.",
};

describe("contactEmailSubject", () => {
  it("combines the canonical inquiry subject with the visitor name", () => {
    expect(contactEmailSubject(BASE)).toBe("Try Scuba Inquiry — Jane Smith");
    expect(contactEmailSubject({ ...BASE, inquiryType: "sunset-cruise" })).toBe(
      "Sunset Cruise Inquiry — Jane Smith"
    );
  });

  it("strips newlines from the name so a subject line stays single-line", () => {
    expect(contactEmailSubject({ ...BASE, name: "Jane\r\nBcc: evil@x.test" })).toBe(
      "Try Scuba Inquiry — Jane Bcc: evil@x.test"
    );
  });

  it("falls back gracefully for an unknown inquiry type", () => {
    expect(contactEmailSubject({ ...BASE, inquiryType: "bogus" })).toBe(
      "Website Inquiry — Jane Smith"
    );
  });
});

describe("contactEmailBody", () => {
  it("includes the header and all core fields", () => {
    const body = contactEmailBody(BASE);
    expect(body).toContain("Sea Saba Website Inquiry");
    expect(body).toContain("Name: Jane Smith");
    expect(body).toContain("Email: jane@example.com");
    expect(body).toContain("Inquiry: Try Scuba");
    expect(body).toContain("Preferred contact method: Email");
    expect(body).toContain("Message:\nI'd like to try scuba while visiting Saba.");
  });

  it("includes contextual fields only when they have values", () => {
    const empty = contactEmailBody(BASE);
    for (const absent of ["WhatsApp:", "travel dates", "participants", "Certification", "Logged dives"]) {
      expect(empty).not.toContain(absent);
    }

    const full = contactEmailBody({
      ...BASE,
      whatsapp: "+1 234 567 8900",
      dates: "March 10 - 17, 2027",
      students: "2",
      certification: "Advanced",
      loggedDives: "75",
    });
    expect(full).toContain("WhatsApp: +1 234 567 8900");
    expect(full).toContain("Planned travel dates: March 10 - 17, 2027");
    // try-scuba's canonical party label is "Number of participants".
    expect(full).toContain("Number of participants: 2");
    expect(full).toContain("Certification level: Advanced");
    expect(full).toContain("Logged dives: 75");
  });

  it("uses the inquiry's canonical party label", () => {
    const body = contactEmailBody({ ...BASE, inquiryType: "sunset-cruise", students: "4" });
    expect(body).toContain("Number of guests: 4");
    expect(body).not.toContain("students");
  });

  it("reflects the explicit WhatsApp preference verbatim", () => {
    expect(
      contactEmailBody({ ...BASE, whatsapp: "+1 234 567 8900", preferredContact: "whatsapp" })
    ).toContain("Preferred contact method: WhatsApp");
    // A number alone is alternate contact info — never a preference.
    expect(
      contactEmailBody({ ...BASE, whatsapp: "+1 234 567 8900", preferredContact: "email" })
    ).toContain("Preferred contact method: Email");
  });

  it("preserves a multiline message", () => {
    const body = contactEmailBody({ ...BASE, message: "Line one.\n\nLine two." });
    expect(body).toContain("Message:\nLine one.\n\nLine two.");
  });
});

describe("buildContactMailto", () => {
  it("targets the canonical inbox with encoded subject and body", () => {
    const href = buildContactMailto(BASE);
    expect(href.startsWith("mailto:info@seasaba.com?")).toBe(true);
    const url = new URL(href);
    expect(url.searchParams.get("subject")).toBe("Try Scuba Inquiry — Jane Smith");
    const body = url.searchParams.get("body")!;
    expect(body).toContain("Name: Jane Smith");
    expect(body).toContain("Email: jane@example.com");
  });

  it("encodes special characters and non-ASCII content safely", () => {
    const href = buildContactMailto({
      ...BASE,
      name: "Renée & Björn <täst>",
      message: "Ümläuts, ampersands & question marks? Plus emoji 🤿",
    });
    // Raw <, >, ? must never appear unencoded inside the URI parameters —
    // the only separators are `?` before the params and `&` between them.
    const params = href.slice(href.indexOf("?") + 1);
    expect(params).not.toMatch(/[<>?]/);
    expect(href.indexOf("?")).toBe(href.lastIndexOf("?"));
    const url = new URL(href);
    expect(url.searchParams.get("subject")).toBe("Try Scuba Inquiry — Renée & Björn <täst>");
    expect(url.searchParams.get("body")).toContain("Ümläuts, ampersands & question marks? Plus emoji 🤿");
  });

  it("encodes body line breaks so they survive the mail client", () => {
    const href = buildContactMailto({ ...BASE, message: "Line one.\nLine two." });
    expect(href).toContain("%0D%0A");
    expect(href).not.toContain("\n");
    const url = new URL(href);
    expect(url.searchParams.get("body")).toContain("Line one.\r\nLine two.");
  });
});
