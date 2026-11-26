import { describe, it, expect } from "vitest";
import { formatWindow } from "@/components/dive-stats-section";

describe("formatWindow", () => {
  it("collapses the month within a single month", () => {
    expect(formatWindow("2026-11-20", "2026-11-26")).toBe("November 20 to 26, 2026");
  });

  it("spans month boundaries within a year", () => {
    expect(formatWindow("2026-11-28", "2026-12-04")).toBe("November 28 to December 4, 2026");
  });

  it("spans year boundaries", () => {
    expect(formatWindow("2026-12-29", "2027-01-04")).toBe("December 29, 2026 to January 4, 2027");
  });
});
