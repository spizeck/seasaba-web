import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  draftEnumErrors,
  isValidIdempotencyKey,
  newIdempotencyKey,
  readSupportRequestDraft,
  COMMUNITY_SUPPORT_SOURCE,
  SUPPORT_REQUEST_SCHEMA_VERSION,
} from "@/lib/community-support/contract";
import { submitSupportRequest } from "@/lib/community-support/server";
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
