import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// No Firebase app initialization or external analytics in unit/component tests.
vi.mock("@/lib/firebase", () => ({ db: { name: "test-only" } }));
vi.mock("@vercel/analytics", () => ({ track: vi.fn() }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  window.history.replaceState({}, "", "/");
});
