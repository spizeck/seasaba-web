import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/support-requests/route";
import type { SupportRequestDraft } from "@/lib/support-request";

// The /api/support-requests boundary (seasaba-web#189). The Community
// Support backend is simulated through global fetch; the tests exercise the
// full route -> server-client chain so the wire contract stays explicit.

const VALID_DRAFT: SupportRequestDraft = {
  name: "Alice Johnson",
  organization: "Saba Youth Football",
  email: "alice@example.test",
  phone: "",
  category: "youth",
  supportTypes: ["financial"],
  amount: "USD 500",
  request: "Sponsorship of team uniforms",
  description: "Our under-14 team needs new uniforms for the season.",
  beneficiaries: "About 30 kids",
  timing: "October 2026",
  useOfSupport: "Uniforms and league fees",
  vendorPayment: false,
  referenceUrl: "",
  acknowledged: true,
};

const BASE = "https://backend.test";
const KEY = "test-ingest-key-0123456789abcdef";

function makeReq(body: unknown, headers: Record<string, string> = {}) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Request("https://seasaba.test/api/support-requests", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: payload,
  });
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function configureEnv() {
  vi.stubEnv("COMMUNITY_SUPPORT_API_BASE_URL", BASE);
  vi.stubEnv("COMMUNITY_SUPPORT_INGEST_KEY", KEY);
}

function backendCall() {
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

describe("POST /api/support-requests", () => {
  it("persists a valid request and returns the human-friendly reference", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, {
        requestId: "req_1",
        reference: "CSR-2026-0042",
        duplicate: false,
      })
    );
    const res = await POST(
      makeReq({
        request: VALID_DRAFT,
        idempotencyKey: "client-key-1",
        submittedAt: "2026-09-30T12:00:00.000Z",
        website: "",
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      reference: "CSR-2026-0042",
    });

    const { url, init, payload } = backendCall();
    expect(url).toBe(`${BASE}/api/community-support/requests`);
    expect((init.headers as Record<string, string>).authorization).toBe(
      `Bearer ${KEY}`
    );
    expect(payload).toMatchObject({
      schemaVersion: 1,
      idempotencyKey: "client-key-1",
      source: "seasaba-web",
      submittedAt: "2026-09-30T12:00:00.000Z",
      request: VALID_DRAFT,
    });
  });

  it("an idempotent replay surfaces the same reference", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        requestId: "req_1",
        reference: "CSR-2026-0042",
        duplicate: true,
      })
    );
    const res = await POST(
      makeReq({ request: VALID_DRAFT, idempotencyKey: "client-key-1" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      reference: "CSR-2026-0042",
    });
  });

  it("generates a backend-valid key when the client omits or spoils one", async () => {
    configureEnv();
    // Fresh Response per call — a resolved Response body is single-use.
    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        jsonResponse(201, {
          requestId: "req_1",
          reference: "CSR-2026-0001",
          duplicate: false,
        })
      )
    );
    for (const idempotencyKey of [undefined, "tiny", "bad key!!"]) {
      vi.mocked(fetch).mockClear();
      const res = await POST(
        makeReq({ request: VALID_DRAFT, idempotencyKey })
      );
      expect(res.status).toBe(200);
      expect(backendCall().payload.idempotencyKey).toMatch(
        /^[\w:.-]{8,128}$/
      );
    }
  });

  it("rejects a honeypot submission before the draft is even read", async () => {
    configureEnv();
    const res = await POST(
      makeReq({ request: VALID_DRAFT, website: "https://spam.example" })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).kind).toBe("validation");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a draft that fails local validation without calling the backend", async () => {
    configureEnv();
    const res = await POST(
      makeReq({ request: { ...VALID_DRAFT, email: "", name: "" } })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toMatchObject({ ok: false, kind: "validation" });
    expect(body.fields.email).toBeTruthy();
    expect(body.fields.name).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects unknown enum values locally", async () => {
    configureEnv();
    const res = await POST(
      makeReq({ request: { ...VALID_DRAFT, category: "not-a-category" } })
    );
    expect(res.status).toBe(400);
    expect((await res.json()).fields.category).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects malformed bodies — non-object, non-JSON, oversized", async () => {
    configureEnv();
    for (const req of [
      makeReq('"just a string"'),
      makeReq("{ not json"),
      makeReq({ request: "not-an-object" }),
    ]) {
      const res = await POST(req);
      expect(res.status).toBe(400);
    }
    const big = await POST(
      makeReq("x".repeat(20 * 1024), { "content-length": `${20 * 1024}` })
    );
    expect(big.status).toBe(413);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps a backend validation failure into the safe field map", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(400, {
        error: "invalid_payload",
        fields: { email: "Email is not a valid address." },
      })
    );
    const res = await POST(makeReq({ request: VALID_DRAFT }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      ok: false,
      kind: "validation",
      fields: { email: "Email is not a valid address." },
    });
  });

  it("maps backend rate limiting to 429", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { error: "rate_limited" })
    );
    const res = await POST(makeReq({ request: VALID_DRAFT }));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ ok: false, kind: "rate_limited" });
  });

  it.each([
    [500, { error: "internal" }],
    [503, { error: "not_configured" }],
    [401, { error: "unauthenticated" }],
    [409, { error: "idempotency_conflict" }],
  ])(
    "maps backend %i to a retryable unavailable — never a false success",
    async (status, body) => {
      configureEnv();
      vi.mocked(fetch).mockResolvedValue(jsonResponse(status, body));
      const res = await POST(makeReq({ request: VALID_DRAFT }));
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ ok: false, kind: "unavailable" });
    }
  );

  it("maps a backend transport failure to unavailable", async () => {
    configureEnv();
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));
    const res = await POST(makeReq({ request: VALID_DRAFT }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, kind: "unavailable" });
  });

  it("fails closed when the backend is not configured", async () => {
    const res = await POST(makeReq({ request: VALID_DRAFT }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ ok: false, kind: "unavailable" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("drops an unparseable submittedAt rather than forwarding it", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(201, {
        requestId: "r",
        reference: "CSR-2026-0001",
        duplicate: false,
      })
    );
    const res = await POST(
      makeReq({ request: VALID_DRAFT, submittedAt: "not a date" })
    );
    expect(res.status).toBe(200);
    expect(backendCall().payload.submittedAt).toBeUndefined();
  });
});
