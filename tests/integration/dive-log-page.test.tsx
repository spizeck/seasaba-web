import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import DiveLogPage from "@/app/(en)/(content)/dive-log/page";
import { DiveLogClient } from "@/components/dive-log-client";
import { loadPublicDives } from "@/lib/firestore/dive-log";

import { isPublicDivingApiEnabled, loadPublicDivesFromApi } from "@/lib/public-diving/client";

vi.mock("@/lib/firestore/dive-log", () => ({
  loadPublicDives: vi.fn(),
}));

vi.mock("@/lib/public-diving/client", () => ({
  isPublicDivingApiEnabled: vi.fn(() => false),
  loadPublicDivesFromApi: vi.fn(),
  DIVE_LOG_DEFAULT_DAYS: 14,
  diveLogStartDate: (days: number) => `start-${days}`,
}));

function findClient(node: ReactNode): ReactElement | undefined {
  if (isValidElement(node)) {
    if (node.type === DiveLogClient) return node as ReactElement;
    const children = (node.props as { children?: ReactNode }).children;
    if (children) {
      for (const child of Array.isArray(children) ? children : [children]) {
        const found = findClient(child);
        if (found) return found;
      }
    }
  }
  return undefined;
}

beforeEach(() => {
  vi.mocked(loadPublicDives).mockReset();
  vi.mocked(loadPublicDivesFromApi).mockReset();
  vi.mocked(isPublicDivingApiEnabled).mockReturnValue(false);
});

afterEach(() => vi.unstubAllEnvs());

describe("dive-log ISR resilience", () => {
  it("throws on fetch failure at runtime so ISR keeps the last good page", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    vi.mocked(loadPublicDives).mockRejectedValue(new Error("backend down"));
    await expect(DiveLogPage()).rejects.toThrow("backend down");
  });

  it("throws on an empty payload at runtime — a cached good page beats an empty shell", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    vi.mocked(loadPublicDives).mockResolvedValue({ dives: [], generatedAt: 123 });
    await expect(DiveLogPage()).rejects.toThrow("no dives");
  });

  it("treats NEXT_PHASE unset (plain next start) as production runtime", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "");
    vi.mocked(loadPublicDives).mockRejectedValue(new Error("backend down"));
    await expect(DiveLogPage()).rejects.toThrow();
  });

  it("renders the client-fetch fallback shell at build on failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.mocked(loadPublicDives).mockRejectedValue(new Error("backend down"));
    const el = await DiveLogPage();
    const client = findClient(el);
    expect(client).toBeTruthy();
    expect((client!.props as { initialDives?: unknown }).initialDives).toBeUndefined();
  });

  it("renders the client-fetch fallback shell at build on an empty payload", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.mocked(loadPublicDives).mockResolvedValue({ dives: [], generatedAt: 123 });
    const el = await DiveLogPage();
    const client = findClient(el);
    expect((client!.props as { initialDives?: unknown }).initialDives).toBeUndefined();
  });

  it("falls back to the client-fetch shell in development rather than erroring", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PHASE", "phase-development-server");
    vi.mocked(loadPublicDives).mockRejectedValue(new Error("backend down"));
    const el = await DiveLogPage();
    const client = findClient(el);
    expect((client!.props as { initialDives?: unknown }).initialDives).toBeUndefined();
  });

  it("passes successful dives through regardless of phase", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    const dives = [{ id: "d1" }];
    vi.mocked(loadPublicDives).mockResolvedValue({ dives: dives as never, generatedAt: 456 });
    const el = await DiveLogPage();
    const client = findClient(el);
    expect((client!.props as { initialDives?: unknown }).initialDives).toBe(dives);
    expect((client!.props as { generatedAt?: number }).generatedAt).toBe(456);
  });
});

describe("dive-log public API source (issue #325)", () => {
  beforeEach(() => vi.mocked(isPublicDivingApiEnabled).mockReturnValue(true));

  it("renders from the API, not Firestore, when commissioned", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    const dives = [{ id: "api-1" }];
    vi.mocked(loadPublicDivesFromApi).mockResolvedValue({ dives: dives as never, generatedAt: 789 });
    const client = findClient(await DiveLogPage());
    expect((client!.props as { initialDives?: unknown }).initialDives).toBe(dives);
    expect(loadPublicDivesFromApi).toHaveBeenCalledWith({ startDate: "start-14" });
    expect(loadPublicDives).not.toHaveBeenCalled();
  });

  it("renders a genuine empty API result instead of treating it as a failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    vi.mocked(loadPublicDivesFromApi).mockResolvedValue({ dives: [], generatedAt: 789 });
    const props = findClient(await DiveLogPage())!.props as { initialDives?: unknown; source?: string };
    expect(props.initialDives).toEqual([]);
    expect(props.source).toBe("api");
  });

  it("throws on API failure at runtime so ISR keeps the last good page", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-server");
    vi.mocked(loadPublicDivesFromApi).mockRejectedValue(
      new Error("Public diving API responded 503 (backend_unavailable)")
    );
    await expect(DiveLogPage()).rejects.toThrow("backend_unavailable");
  });

  it("renders the client-fetch shell at build when the API is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PHASE", "phase-production-build");
    vi.mocked(loadPublicDivesFromApi).mockRejectedValue(new Error("down"));
    const client = findClient(await DiveLogPage());
    expect((client!.props as { initialDives?: unknown }).initialDives).toBeUndefined();
  });
});
