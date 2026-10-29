import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/newsletter/subscribe/route";
import { POST as CONFIRM_POST } from "@/app/api/newsletter/confirm/route";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
} from "@/lib/newsletter/contract";

// The /api/newsletter/* boundaries: the backend is simulated through
// global fetch so the full route -> server-client chain stays explicit.

const BASE = "https://backend.test";
const KEY = "test-newsletter-key-0123456789abcdef";

const VALID_BODY = {
  subscription: {
    email: "diver@example.com",
    audiences: ["individual"],
    organization: "",
    consent: true,
    consentVersion: NEWSLETTER_CONSENT_VERSION,
    consentText: NEWSLETTER_CONSENT_TEXT,
  },
  attribution: {
    campaign: "dema-2026",
    source: "qr",
    placement: "individual-flyer",
    audience: "individual",
  },
  idempotencyKey: "seasaba-web:test-0001",
};

function makeReq(body: unknown, path = "/api/newsletter/subscribe") {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Request(`https://seasaba.test${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
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
  vi.stubEnv("NEWSLETTER_API_BASE_URL", BASE);
  vi.stubEnv("NEWSLETTER_INGEST_KEY", KEY);
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

describe("POST /api/newsletter/subscribe", () => {
  it("forwards a valid subscription with auth and attribution", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { ok: true }));
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(200);
    const { url, init, payload } = backendCall();
    expect(url).toBe(`${BASE}/api/newsletter/subscribe`);
    expect(init.headers).toMatchObject({ authorization: `Bearer ${KEY}` });
    expect(payload.schemaVersion).toBe(1);
    expect(payload.source).toBe("seasaba-web");
    expect(payload.attribution).toEqual(VALID_BODY.attribution);
    const sub = payload.subscription as Record<string, unknown>;
    expect(sub.consent).toBe(true);
    expect(sub.consentVersion).toBe(NEWSLETTER_CONSENT_VERSION);
  });

  it("rejects a filled honeypot before calling the backend", async () => {
    configureEnv();
    const res = await POST(
      makeReq({ ...VALID_BODY, website: "spammy.example" })
    );
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects missing consent and bad email as validation failures", async () => {
    configureEnv();
    const res = await POST(
      makeReq({
        ...VALID_BODY,
        subscription: { ...VALID_BODY.subscription, consent: false },
      })
    );
    expect(res.status).toBe(400);
    const res2 = await POST(
      makeReq({
        ...VALID_BODY,
        subscription: { ...VALID_BODY.subscription, email: "nope" },
      })
    );
    expect(res2.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps backend 429 to rate_limited and failures to unavailable", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(429, { error: "rate_limited" })
    );
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(429);
    expect(await res.json()).toMatchObject({ kind: "rate_limited" });

    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(503, { error: "not_configured" })
    );
    const res2 = await POST(makeReq(VALID_BODY));
    expect(res2.status).toBe(503);
  });

  it("fails closed when the backend is not configured", async () => {
    // No env at all — the client must report unavailable, never send.
    const res = await POST(makeReq(VALID_BODY));
    expect(res.status).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("POST /api/newsletter/confirm", () => {
  const TOKEN = `nlc_${"a".repeat(43)}`;

  it("forwards a plausible token and maps the outcomes", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(jsonResponse(200, { ok: true }));
    const res = await CONFIRM_POST(
      makeReq({ token: TOKEN }, "/api/newsletter/confirm")
    );
    expect(res.status).toBe(200);
    const { payload } = backendCall();
    expect(payload.token).toBe(TOKEN);
  });

  it("rejects malformed tokens without calling the backend", async () => {
    configureEnv();
    const res = await CONFIRM_POST(
      makeReq({ token: "garbage" }, "/api/newsletter/confirm")
    );
    expect(res.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("maps expired tokens distinctly", async () => {
    configureEnv();
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(410, { error: "token_expired" })
    );
    const res = await CONFIRM_POST(
      makeReq({ token: TOKEN }, "/api/newsletter/confirm")
    );
    expect(res.status).toBe(410);
    expect(await res.json()).toMatchObject({ kind: "expired" });
  });
});
