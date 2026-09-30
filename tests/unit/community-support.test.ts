import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DONATION_CATEGORIES,
  draftEnumErrors,
  isValidIdempotencyKey,
  newIdempotencyKey,
  parsePublicRecipients,
  readSupportRequestDraft,
  toDonationRecipient,
  COMMUNITY_SUPPORT_SOURCE,
  SUPPORT_REQUEST_SCHEMA_VERSION,
  type PublicDonationRecipient,
} from "@/lib/community-support/contract";
import {
  fetchPublicRecipients,
  getDonationRecipients,
  submitSupportRequest,
} from "@/lib/community-support/server";
import { DONATION_RECIPIENTS } from "@/data/donations";
import type { SupportRequestDraft } from "@/lib/support-request";

// Integration boundary tests for seasaba-web#189. The backend
// (contract-builder#148) is simulated through global fetch — no live
// deployment is required.

const VALID_DRAFT: SupportRequestDraft = {
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
  useOfSupport: "Uniforms and league fees",
  vendorPayment: true,
  referenceUrl: "https://example.test/team",
  acknowledged: true,
};

const BASE = "https://backend.test";
const KEY = "test-ingest-key-0123456789abcdef";

function configureEnv() {
  vi.stubEnv("COMMUNITY_SUPPORT_API_BASE_URL", BASE);
  vi.stubEnv("COMMUNITY_SUPPORT_INGEST_KEY", KEY);
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function lastBackendCall(): {
  url: string;
  init: RequestInit;
  payload: Record<string, unknown>;
} {
  const call = vi.mocked(fetch).mock.calls.at(-1);
  expect(call, "expected a backend fetch").toBeTruthy();
  const [url, init] = call as [string, RequestInit];
  return {
    url,
    init,
    payload: JSON.parse(String(init.body)) as Record<string, unknown>,
  };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("readSupportRequestDraft", () => {
  it("accepts a complete draft verbatim", () => {
    expect(readSupportRequestDraft(VALID_DRAFT)).toEqual(VALID_DRAFT);
  });

  it("rejects a missing or mistyped field — absent is a contract violation, not empty", () => {
    const { email, ...noEmail } = VALID_DRAFT;
    void email;
    expect(readSupportRequestDraft(noEmail)).toBeNull();
    expect(
      readSupportRequestDraft({ ...VALID_DRAFT, name: 42 })
    ).toBeNull();
    expect(
      readSupportRequestDraft({ ...VALID_DRAFT, supportTypes: "financial" })
    ).toBeNull();
    expect(
      readSupportRequestDraft({ ...VALID_DRAFT, vendorPayment: "true" })
    ).toBeNull();
    expect(readSupportRequestDraft(null)).toBeNull();
    expect(readSupportRequestDraft("draft")).toBeNull();
  });
});

describe("draftEnumErrors", () => {
  it("flags unknown categories and support types", () => {
    expect(
      draftEnumErrors({ ...VALID_DRAFT, category: "space-travel" }).category
    ).toBeTruthy();
    expect(
      draftEnumErrors({ ...VALID_DRAFT, supportTypes: ["gold"] }).supportTypes
    ).toBeTruthy();
    expect(
      draftEnumErrors({ ...VALID_DRAFT, supportTypes: ["goods", "goods"] })
        .supportTypes
    ).toBeTruthy();
    expect(draftEnumErrors(VALID_DRAFT)).toEqual({});
  });
});

describe("idempotency keys", () => {
  it("accepts only the backend's key shape (8-128 chars of [\\w:.-])", () => {
    expect(isValidIdempotencyKey("abc-def_123:456.789")).toBe(true);
    expect(isValidIdempotencyKey("short")).toBe(false);
    expect(isValidIdempotencyKey("has space in it!")).toBe(false);
    expect(isValidIdempotencyKey("x".repeat(129))).toBe(false);
    expect(isValidIdempotencyKey(12345)).toBe(false);
  });

  it("generates keys that always satisfy the backend shape", () => {
    for (let i = 0; i < 20; i++) {
      expect(isValidIdempotencyKey(newIdempotencyKey())).toBe(true);
    }
  });
});

describe("submitSupportRequest", () => {
  it("fails closed when the backend is not configured — no request attempted", async () => {
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "key-12345",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails closed when the ingest key is missing or too short", async () => {
    vi.stubEnv("COMMUNITY_SUPPORT_API_BASE_URL", BASE);
    vi.stubEnv("COMMUNITY_SUPPORT_INGEST_KEY", "short");
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "key-12345",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses to send the ingest key over http to a non-loopback host", async () => {
    vi.stubEnv("COMMUNITY_SUPPORT_API_BASE_URL", "http://backend.test");
    vi.stubEnv("COMMUNITY_SUPPORT_INGEST_KEY", KEY);
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "key-12345",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("still permits http for loopback development backends", async () => {
    for (const base of [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://[::1]:3000",
    ]) {
      vi.stubEnv("COMMUNITY_SUPPORT_API_BASE_URL", base);
      vi.stubEnv("COMMUNITY_SUPPORT_INGEST_KEY", KEY);
      vi.mocked(fetch).mockResolvedValue(
        jsonResponse(201, { reference: "CSR-2026-0001", requestId: "r", duplicate: false })
      );
      const result = await submitSupportRequest(VALID_DRAFT, {
        idempotencyKey: "key-12345",
      });
      expect(result.ok).toBe(true);
    }
  });

  it("posts the shared contract to the ingest endpoint with Bearer auth", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, {
        requestId: "req_1",
        reference: "CSR-2026-0001",
        duplicate: false,
      })
    );
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
      submittedAt: "2026-09-30T12:00:00.000Z",
    });
    expect(result).toEqual({
      ok: true,
      reference: "CSR-2026-0001",
      duplicate: false,
    });

    const { url, init, payload } = lastBackendCall();
    expect(url).toBe(`${BASE}/api/community-support/requests`);
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe(
      `Bearer ${KEY}`
    );
    expect(payload).toMatchObject({
      schemaVersion: SUPPORT_REQUEST_SCHEMA_VERSION,
      idempotencyKey: "my-key-123",
      source: COMMUNITY_SUPPORT_SOURCE,
      submittedAt: "2026-09-30T12:00:00.000Z",
    });
    // The draft is forwarded verbatim — no renamed or dropped fields.
    expect(payload.request).toEqual(VALID_DRAFT);
  });

  it("treats a 200 replay as a successful duplicate", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        requestId: "req_1",
        reference: "CSR-2026-0001",
        duplicate: true,
      })
    );
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({
      ok: true,
      reference: "CSR-2026-0001",
      duplicate: true,
    });
  });

  it("maps a backend validation failure to fields — names only, never values", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, {
        error: "invalid_payload",
        fields: { email: "Email is not a valid address." },
      })
    );
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({
      ok: false,
      kind: "validation",
      fields: { email: "Email is not a valid address." },
    });
  });

  it("maps 429 to rate_limited", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { error: "rate_limited" })
    );
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({ ok: false, kind: "rate_limited" });
  });

  it.each([
    [401, { error: "unauthenticated" }],
    [409, { error: "idempotency_conflict" }],
    [500, { error: "internal" }],
    [503, { error: "not_configured" }],
  ])("maps backend %i to unavailable — never a false success", async (status, body) => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(status, body));
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
  });

  it("maps transport failure (DNS/timeout/abort) to unavailable", async () => {
    configureEnv();
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
  });

  it("a 2xx without the promised reference is not a success", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { requestId: "x" }));
    const result = await submitSupportRequest(VALID_DRAFT, {
      idempotencyKey: "my-key-123",
    });
    expect(result).toEqual({ ok: false, kind: "unavailable" });
  });

  it("never logs the request body or applicant PII", async () => {
    configureEnv();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(500, { error: "internal" })
    );
    await submitSupportRequest(VALID_DRAFT, { idempotencyKey: "my-key-123" });
    const logged = errorSpy.mock.calls.map((c) => JSON.stringify(c)).join(" ");
    for (const pii of [
      "Alice Johnson",
      "alice@example.test",
      "Saba Youth Football",
      "team uniforms",
    ]) {
      expect(logged, `logged payload leaked ${pii}`).not.toContain(pii);
    }
    // And the ingest key itself must never be logged either.
    expect(logged).not.toContain(KEY);
    errorSpy.mockRestore();
  });
});

const SEA_AND_LEARN_DTO: PublicDonationRecipient = {
  slug: "sea-and-learn-foundation",
  name: "Sea & Learn Foundation",
  description: "Year-round programs.",
  funds: "Year-round programs on Saba.",
  category: "science-education",
  website: "https://www.seaandlearn.org/",
  donationUrl: "https://www.seaandlearn.org/donate",
  image: "/images/optimized/sea-and-learn-foundation-logo-horizontal.webp",
  imageAlt: "Sea & Learn Foundation logo",
  sortOrder: 0,
};

describe("parsePublicRecipients", () => {
  it("parses the public DTO list", () => {
    const parsed = parsePublicRecipients({
      schemaVersion: 1,
      recipients: [SEA_AND_LEARN_DTO],
    });
    expect(parsed).toEqual([SEA_AND_LEARN_DTO]);
  });

  it("rejects a malformed top-level body", () => {
    expect(parsePublicRecipients(null)).toBeNull();
    expect(parsePublicRecipients({})).toBeNull();
    expect(parsePublicRecipients({ recipients: "nope" })).toBeNull();
    expect(parsePublicRecipients({ recipients: [{ name: "x" }] })).toBeNull();
  });

  it("drops a record whose image lacks alt text — never renders alt-less logos", () => {
    const parsed = parsePublicRecipients({
      recipients: [
        SEA_AND_LEARN_DTO,
        { ...SEA_AND_LEARN_DTO, slug: "bad", name: "Bad Org", imageAlt: "" },
      ],
    });
    expect(parsed).toHaveLength(1);
    expect(parsed?.[0].slug).toBe("sea-and-learn-foundation");
  });
});

describe("toDonationRecipient", () => {
  it("maps DTO nulls to optional absences and keeps local images", () => {
    const mapped = toDonationRecipient(SEA_AND_LEARN_DTO);
    expect(mapped).toEqual({
      name: "Sea & Learn Foundation",
      description: "Year-round programs.",
      funds: "Year-round programs on Saba.",
      category: "science-education",
      website: "https://www.seaandlearn.org/",
      donationUrl: "https://www.seaandlearn.org/donate",
      image: "/images/optimized/sea-and-learn-foundation-logo-horizontal.webp",
      imageAlt: "Sea & Learn Foundation logo",
    });
    // The DTO allowlist — no internal field can reach the mapped record.
    expect(JSON.stringify(mapped)).not.toMatch(
      /staffNotes|reviewStatus|publication|lastVerifiedAt|sortOrder/
    );
  });

  it("drops a remote image URL rather than hotlinking", () => {
    const mapped = toDonationRecipient({
      ...SEA_AND_LEARN_DTO,
      image: "https://cdn.example.org/logo.png",
    });
    expect(mapped.image).toBeUndefined();
    expect(mapped.imageAlt).toBeUndefined();
  });

  it("handles a no-frills record", () => {
    const mapped = toDonationRecipient({
      ...SEA_AND_LEARN_DTO,
      funds: null,
      category: null,
      donationUrl: null,
      image: null,
      imageAlt: null,
    });
    expect(mapped.funds).toBeUndefined();
    expect(mapped.category).toBeUndefined();
    expect(mapped.donationUrl).toBeUndefined();
    expect(mapped.image).toBeUndefined();
    expect(mapped.imageAlt).toBeUndefined();
    expect(DONATION_CATEGORIES.length).toBeGreaterThan(0);
  });
});

describe("fetchPublicRecipients", () => {
  it("returns null without configuration — no request attempted", async () => {
    expect(await fetchPublicRecipients()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns validated DTOs on success", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        schemaVersion: 1,
        recipients: [SEA_AND_LEARN_DTO],
      })
    );
    const result = await fetchPublicRecipients();
    expect(result).toEqual([SEA_AND_LEARN_DTO]);
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
      `${BASE}/api/public/community-support/recipients`
    );
  });

  it.each([[503], [404], [500]])("returns null on backend %i", async (status) => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(status, { error: "unavailable" })
    );
    expect(await fetchPublicRecipients()).toBeNull();
  });

  it("returns null on transport failure or malformed JSON", async () => {
    configureEnv();
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    expect(await fetchPublicRecipients()).toBeNull();

    vi.mocked(fetch).mockResolvedValue(
      new Response("not json", { status: 200 })
    );
    expect(await fetchPublicRecipients()).toBeNull();
  });
});

describe("getDonationRecipients", () => {
  it("maps backend recipients in server order when the read succeeds", async () => {
    configureEnv();
    const first = { ...SEA_AND_LEARN_DTO };
    const second = {
      ...SEA_AND_LEARN_DTO,
      slug: "saba-conservation-foundation",
      name: "Saba Conservation Foundation",
      sortOrder: 1,
    };
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, { schemaVersion: 1, recipients: [first, second] })
    );
    const recipients = await getDonationRecipients();
    expect(recipients.map((r) => r.name)).toEqual([
      "Sea & Learn Foundation",
      "Saba Conservation Foundation",
    ]);
  });

  it("falls back to the local registry on failure or empty backend lists", async () => {
    configureEnv();
    // Backend down.
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(503, { error: "unavailable" })
    );
    expect(await getDonationRecipients()).toBe(DONATION_RECIPIENTS);
    // Backend healthy but nothing published yet — the migration floor keeps
    // verified content visible.
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, { schemaVersion: 1, recipients: [] })
    );
    expect(await getDonationRecipients()).toBe(DONATION_RECIPIENTS);
  });

  it("falls back when the backend is unconfigured", async () => {
    expect(await getDonationRecipients()).toBe(DONATION_RECIPIENTS);
  });
});
