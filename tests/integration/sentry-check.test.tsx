import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  issueSessionValue,
  SENTRY_CHECK_COOKIE,
} from "@/lib/sentry-check";

/**
 * #129 integration coverage for the /sentry-check operational surface.
 * The Sentry SDK boundary is fully mocked — no test can emit a real event.
 */

const sentryMock = vi.hoisted(() => ({
  captureException: vi.fn<(error: unknown, context?: unknown) => string>(
    () => "evt-test-id"
  ),
  flush: vi.fn(async () => true),
}));
const { captureException, flush } = sentryMock;
vi.mock("@sentry/nextjs", () => sentryMock);

// Server-side cookie store for the page component — controlled per test.
let sessionCookie: string | undefined;
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) =>
      name === SENTRY_CHECK_COOKIE && sessionCookie
        ? { name, value: sessionCookie }
        : undefined,
  })),
}));

// No app-router context in jsdom — stub the bits the auth form uses.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { POST as authorizePost } from "@/app/sentry-check/session/route";
import {
  POST as serverErrorPost,
  SENTRY_CHECK_SERVER_ERROR_MESSAGE,
} from "@/app/sentry-check/server-error/route";
import SentryCheckPage, { metadata } from "@/app/sentry-check/page";
import {
  SentryCheckControls,
  SENTRY_CHECK_BROWSER_ERROR_MESSAGE,
} from "@/components/sentry-check-controls";
import { SentryCheckAuthForm } from "@/components/sentry-check-auth-form";

const TOKEN = "integration-token-abcdef0123456789";
const BASE = "https://www.seasaba.com";
let ipCounter = 0;

function tokenFormRequest(ip?: string): Request {
  const body = new FormData();
  body.set("token", TOKEN);
  return new Request(`${BASE}/sentry-check/session`, {
    method: "POST",
    headers: { "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}` },
    body,
  });
}

function authedRequest(ip?: string): Request {
  return new Request(`${BASE}/sentry-check/server-error`, {
    method: "POST",
    headers: {
      cookie: `${SENTRY_CHECK_COOKIE}=${issueSessionValue(TOKEN)}`,
      "x-forwarded-for": ip ?? `10.0.0.${++ipCounter}`,
    },
  });
}

describe("POST /sentry-check/session", () => {
  beforeEach(() => {
    vi.stubEnv("SENTRY_CHECK_TOKEN", TOKEN);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets an HttpOnly SameSite=Strict cookie on a correct token", async () => {
    const response = await authorizePost(tokenFormRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${SENTRY_CHECK_COOKIE}=`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Path=/sentry-check");
    expect(cookie).toContain("Secure");
  });

  it("rejects a wrong token and sets no cookie", async () => {
    const body = new FormData();
    body.set("token", "nope");
    const response = await authorizePost(
      new Request(`${BASE}/sentry-check/session`, { method: "POST", body })
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      ok: false,
      reason: "unauthorized",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("fails closed when SENTRY_CHECK_TOKEN is not configured", async () => {
    vi.unstubAllEnvs();
    const response = await authorizePost(tokenFormRequest());
    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("rate limits repeated authorization attempts from one IP", async () => {
    const ip = "10.9.9.9";
    const attempts = await Promise.all(
      Array.from({ length: 12 }, () => authorizePost(tokenFormRequest(ip)))
    );
    expect(attempts.some((r) => r.headers.get("set-cookie"))).toBe(true);
    // After the limit, even a correct token is refused.
    const blocked = await authorizePost(tokenFormRequest(ip));
    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({
      ok: false,
      reason: "rate_limited",
    });
    expect(blocked.headers.get("set-cookie")).toBeNull();
  });
});

describe("POST /sentry-check/server-error", () => {
  beforeEach(() => {
    vi.stubEnv("SENTRY_CHECK_TOKEN", TOKEN);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without a valid session", async () => {
    const response = await serverErrorPost(
      new Request(`${BASE}/sentry-check/server-error`, { method: "POST" })
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ sent: false, reason: "unauthorized" });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("reports sentry_inactive outside Vercel Production instead of sending", async () => {
    const response = await serverErrorPost(authedRequest());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      sent: false,
      reason: "sentry_inactive",
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("emits exactly one tagged, controlled error through the server SDK", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://abc@o123.ingest.us.sentry.io/456"
    );
    const response = await serverErrorPost(authedRequest());
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ sent: true, eventId: "evt-test-id" });
    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0];
    expect((error as Error).message).toBe(SENTRY_CHECK_SERVER_ERROR_MESSAGE);
    expect(context).toEqual({
      tags: { source: "sentry-check", surface: "server" },
    });
    expect(flush).toHaveBeenCalled();
  });

  it("rate limits bursts from one IP", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://abc@o123.ingest.us.sentry.io/456"
    );
    const ip = "10.8.8.8";
    for (let i = 0; i < 5; i++) {
      expect((await serverErrorPost(authedRequest(ip))).status).toBe(200);
    }
    const sixth = await serverErrorPost(authedRequest(ip));
    expect(sixth.status).toBe(429);
    expect(await sixth.json()).toEqual({ sent: false, reason: "rate_limited" });
    expect(captureException).toHaveBeenCalledTimes(5);
  });
});

describe("/sentry-check page", () => {
  beforeEach(() => {
    vi.stubEnv("SENTRY_CHECK_TOKEN", TOKEN);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    sessionCookie = undefined;
  });

  it("is noindex/nofollow via page metadata", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("renders only the token form for unauthenticated visitors", async () => {
    render(await SentryCheckPage());
    expect(screen.getByLabelText(/access token/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /send browser test error/i })
    ).not.toBeInTheDocument();
  });

  it("renders the two clearly labelled test actions for the authorized owner", async () => {
    sessionCookie = issueSessionValue(TOKEN);
    render(await SentryCheckPage());
    expect(
      screen.getByRole("button", { name: /send browser test error/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send server test error/i })
    ).toBeInTheDocument();
  });
});

describe("SentryCheckAuthForm", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the typed token to the session endpoint — never to a URL", async () => {
    const fetchMock = vi.fn<(url: unknown, init?: RequestInit) => Promise<Response>>(
      async () =>
        Response.json({ ok: false, reason: "unauthorized" }, { status: 401 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<SentryCheckAuthForm />);
    await userEvent.type(screen.getByLabelText(/access token/i), "typed-secret");
    await userEvent.click(screen.getByRole("button", { name: /authorize/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/sentry-check/session");
    expect(init?.method).toBe("POST");
    expect((init?.body as FormData).get("token")).toBe("typed-secret");
    // Denied tokens get an in-page alert; controls never appear.
    expect(await screen.findByRole("alert")).toHaveTextContent(/not accepted/i);
  });
});

describe("SentryCheckControls", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("captures exactly one tagged browser event through the client SDK", async () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://abc@o123.ingest.us.sentry.io/456"
    );
    render(<SentryCheckControls />);
    await userEvent.click(
      screen.getByRole("button", { name: /send browser test error/i })
    );
    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0];
    expect((error as Error).message).toBe(SENTRY_CHECK_BROWSER_ERROR_MESSAGE);
    expect(context).toEqual({
      tags: { source: "sentry-check", surface: "browser" },
    });
    expect(await screen.findByText(/test event sent/i)).toBeInTheDocument();
  });

  it("reports inactivity instead of sending when Sentry is off", async () => {
    // Preview/test deployments: the button explains rather than emitting.
    render(<SentryCheckControls />);
    await userEvent.click(
      screen.getByRole("button", { name: /send browser test error/i })
    );
    expect(captureException).not.toHaveBeenCalled();
    expect(await screen.findByText(/inactive in this deployment/i)).toBeInTheDocument();
  });

  it("posts to the server test endpoint and reports the result", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ sent: true, eventId: "evt-1" })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<SentryCheckControls />);
    await userEvent.click(
      screen.getByRole("button", { name: /send server test error/i })
    );
    expect(fetchMock).toHaveBeenCalledWith("/sentry-check/server-error", {
      method: "POST",
    });
    expect(await screen.findByText(/test event sent/i)).toBeInTheDocument();
  });
});
