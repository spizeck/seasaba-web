import { describe, expect, it } from "vitest";
import {
  attributionFromSearchParams,
  isValidIdempotencyKey,
  newIdempotencyKey,
  NEWSLETTER_CONSENT_VERSION,
  validateNewsletterDraft,
} from "@/lib/newsletter/contract";

describe("newsletter contract", () => {
  it("validates the draft like the backend does", () => {
    expect(
      validateNewsletterDraft({
        email: "",
        audiences: [],
        organization: "",
        consent: false,
      })
    ).toMatchObject({
      email: expect.any(String),
      audiences: expect.any(String),
      consent: expect.any(String),
    });
    expect(
      validateNewsletterDraft({
        email: "diver@example.com",
        audiences: ["individual"],
        organization: "",
        consent: true,
      })
    ).toEqual({});
    expect(
      validateNewsletterDraft({
        email: "diver@example.com",
        audiences: ["individual", "group"],
        organization: "Dive Shop Co",
        consent: true,
      })
    ).toEqual({});
    expect(
      validateNewsletterDraft({
        email: "not-an-email",
        audiences: ["individual"],
        organization: "",
        consent: true,
      }).email
    ).toBeTruthy();
  });

  it("bounds attribution params to safe lowercase slugs", () => {
    expect(
      attributionFromSearchParams({
        campaign: "dema-2026",
        source: "qr",
        placement: "individual-flyer",
        audience: "individual",
      })
    ).toEqual({
      campaign: "dema-2026",
      source: "qr",
      placement: "individual-flyer",
      audience: "individual",
    });
    // Junk/oversized/uppercase values are sanitized or dropped.
    expect(
      attributionFromSearchParams({
        campaign: "DEMA 2026 <script>",
        source: "a".repeat(60),
        placement: "UPPER-OK",
        audience: "bogus",
      })
    ).toEqual({
      campaign: null,
      source: null,
      placement: "upper-ok",
      audience: null,
    });
    expect(attributionFromSearchParams({})).toEqual({
      campaign: null,
      source: null,
      placement: null,
      audience: null,
    });
  });

  it("generates backend-valid idempotency keys", () => {
    const key = newIdempotencyKey();
    expect(isValidIdempotencyKey(key)).toBe(true);
    expect(isValidIdempotencyKey("short")).toBe(false);
    expect(isValidIdempotencyKey("bad key!")).toBe(false);
  });

  it("pins the consent version to the backend contract", () => {
    expect(NEWSLETTER_CONSENT_VERSION).toBe("newsletter-consent-v1");
  });
});
