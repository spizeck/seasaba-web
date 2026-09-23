import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/**
 * #129 integration coverage for the /sentry-check temporary verification
 * surface. The Sentry SDK boundary is fully mocked — no test can emit a real
 * event.
 */

const sentryMock = vi.hoisted(() => ({
  captureException: vi.fn<(error: unknown, context?: unknown) => string>(
    () => "evt-test-id"
  ),
  flush: vi.fn(async () => true),
}));
const { captureException, flush } = sentryMock;
vi.mock("@sentry/nextjs", () => sentryMock);

import {
  POST as serverErrorPost,
  SENTRY_CHECK_SERVER_ERROR_MESSAGE,
} from "@/app/sentry-check/server-error/route";
import SentryCheckPage, { metadata } from "@/app/sentry-check/page";
import {
  SentryCheckControls,
  SENTRY_CHECK_BROWSER_ERROR_MESSAGE,
} from "@/components/sentry-check-controls";

const PROD_DSN = "https://abc@o123.ingest.us.sentry.io/456";

describe("POST /sentry-check/server-error", () => {
  beforeEach(() => {
    captureException.mockClear();
    flush.mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reports sentry_inactive outside Vercel Production instead of sending", async () => {
    const response = await serverErrorPost();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      sent: false,
      reason: "sentry_inactive",
    });
    expect(captureException).not.toHaveBeenCalled();
  });

  it("emits exactly one tagged, controlled error through the server SDK", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", PROD_DSN);
    const response = await serverErrorPost();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      sent: true,
      eventId: "evt-test-id",
    });
    expect(captureException).toHaveBeenCalledTimes(1);
    const [error, context] = captureException.mock.calls[0];
    expect((error as Error).message).toBe(SENTRY_CHECK_SERVER_ERROR_MESSAGE);
    expect(context).toEqual({
      tags: { source: "sentry-check", surface: "server" },
    });
    expect(flush).toHaveBeenCalled();
  });
});

describe("/sentry-check page", () => {
  it("is noindex/nofollow via page metadata", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("renders the two clearly labelled test actions with no auth step", async () => {
    render(await SentryCheckPage());
    expect(
      screen.getByRole("button", { name: /send browser test error/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send server test error/i })
    ).toBeInTheDocument();
    // The deleted token gate must not reappear.
    expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

describe("SentryCheckControls", () => {
  beforeEach(() => {
    captureException.mockClear();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("captures exactly one tagged browser event through the client SDK", async () => {
    vi.stubEnv("NEXT_PUBLIC_VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", PROD_DSN);
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
    expect(
      await screen.findByText(/inactive in this deployment/i)
    ).toBeInTheDocument();
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

  it("surfaces sentry_inactive from the server endpoint", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({ sent: false, reason: "sentry_inactive" }, { status: 503 })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<SentryCheckControls />);
    await userEvent.click(
      screen.getByRole("button", { name: /send server test error/i })
    );
    expect(
      await screen.findByText(/inactive in this deployment/i)
    ).toBeInTheDocument();
  });
});
