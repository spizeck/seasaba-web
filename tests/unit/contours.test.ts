import { describe, expect, it } from "vitest";
import { contourCluster } from "@/lib/contours";

// The contour generator must stay deterministic: the decoration is static
// markup rendered on the server, so identical input must always produce
// identical path data.

describe("contourCluster", () => {
  it("produces closed smooth rings in opacity order", () => {
    const rings = contourCluster({ seed: 1, cx: 560, cy: 84 });
    expect(rings.length).toBeGreaterThanOrEqual(3);
    for (const ring of rings) {
      expect(ring.d.startsWith("M ")).toBe(true);
      expect(ring.d.endsWith(" Z")).toBe(true);
      expect(ring.d).toContain(" C ");
      expect(ring.opacity).toBeGreaterThan(0.03);
      expect(ring.opacity).toBeLessThanOrEqual(0.07);
    }
    // Opacity fades toward the outermost ring so the cluster dissolves.
    const opacities = rings.map((r) => r.opacity);
    expect([...opacities].sort((a, b) => b - a)).toEqual(opacities);
  });

  it("is deterministic for the same input", () => {
    const a = contourCluster({ seed: 4, cx: 560, cy: 84 });
    const b = contourCluster({ seed: 4, cx: 560, cy: 84 });
    expect(a).toEqual(b);
  });

  it("produces distinct shapes for different seeds", () => {
    const a = contourCluster({ seed: 1, cx: 560, cy: 84 });
    const b = contourCluster({ seed: 7, cx: 560, cy: 84 });
    expect(a.map((r) => r.d)).not.toEqual(b.map((r) => r.d));
  });

  it("respects a custom radii progression", () => {
    const radii = [40, 90, 150];
    const rings = contourCluster({ seed: 1, cx: 320, cy: 320, radii });
    expect(rings).toHaveLength(3);
    // Larger rings should produce longer paths (more arc to cover).
    const coords = (d: string) => d.split(/[A-Z ]+/).filter(Boolean).map(Number);
    const span = (d: string) => {
      const nums = coords(d);
      const xs = nums.filter((_, i) => i % 2 === 0);
      return Math.max(...xs) - Math.min(...xs);
    };
    expect(span(rings[2].d)).toBeGreaterThan(span(rings[0].d));
  });
});
