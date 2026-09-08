import { afterEach, expect, it, vi } from "vitest";
import { exportDiveLogToPdf } from "@/lib/dive-log-export";
import { publicDive } from "../fixtures/dives";

// Keep the real PDF engine; replace only the file-download boundary.
const output = vi.hoisted(() => ({ pdf: "", filename: "" }));
vi.mock("jspdf", async (importOriginal) => {
  const { default: RealPDF } = await importOriginal<typeof import("jspdf")>();
  return { default: class extends RealPDF {
    constructor(...args: ConstructorParameters<typeof RealPDF>) {
      super(...args);
      this.save = ((filename: string) => { output.pdf = this.output(); output.filename = filename; return this; }) as unknown as typeof this.save;
    }
  } };
});
afterEach(() => { vi.unstubAllGlobals(); output.pdf = ""; output.filename = ""; });
it("does not download an empty selection", async () => {
  await exportDiveLogToPdf([], "metric");
  expect(output.pdf).toBe("");
});
it.each(["metric", "imperial"] as const)("generates a real %s PDF even if the logo is unavailable", async (unit) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
  await exportDiveLogToPdf([publicDive()], unit);
  expect(output.pdf).toMatch(/^%PDF-/);
  expect(output.pdf).toContain("Tent Reef");
  expect(output.pdf).toContain("Green Turtle");
  expect(output.pdf).toContain(unit === "metric" ? "21 m" : "69 ft");
  expect(output.filename).toMatch(/^sea-saba-dive-log-\d{4}-\d{2}-\d{2}\.pdf$/);
});
it("paginates a long export without modifying selected dive data", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  const dives = Array.from({ length: 12 }, (_, i) => publicDive({ id: `d-${i}`, diveSite: `Test Reef ${i}`, sightings: [], maxDepth: undefined, waterTemperature: undefined }));
  const original = structuredClone(dives);
  await exportDiveLogToPdf(dives, "metric");
  expect(output.pdf).toContain("Test Reef 11");
  expect(output.pdf.match(/\/Type \/Page\b/g)!.length).toBeGreaterThan(1);
  expect(dives).toEqual(original);
});
