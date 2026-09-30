/**
 * Deterministic contour-line geometry for the decorative `ContourLines`
 * component. Produces a cluster of nested, irregular closed rings — the same
 * family of curves a topographic or bathymetric chart draws around a peak or
 * seamount (Saba is a single volcanic cone, so the shapes read as the
 * island's own contours).
 *
 * Everything is derived from an integer `seed`: no Math.random(), no client
 * code, identical markup on every render and deploy. Positions are emitted
 * rounded to keep the SVG small and stable.
 */

const TAU = Math.PI * 2;
/** Angular samples per ring — enough for smooth curves through Catmull-Rom. */
const SAMPLES = 14;

export interface ContourRing {
  d: string;
  opacity: number;
  width: number;
}

export interface ContourClusterOptions {
  /** Shape seed — each value yields a distinct contour family. */
  seed: number;
  /** Peak/summit the rings nest around, in viewBox units. */
  cx: number;
  cy: number;
  /** Ring radii, inner to outer. Spacing grows outward (steeper near the
   *  summit, like a real cone). Rings that fall outside the viewBox are
   *  simply clipped by the consumer. */
  radii?: number[];
  /** Vertical squash (<1 elongates the cluster into a ridge-like ellipse). */
  squash?: number;
  /** Rotation of the squash axis in degrees — tilts the ridge direction. */
  tiltDeg?: number;
}

const DEFAULT_RADII = [64, 122, 188, 262, 344, 434];

/**
 * Radius of one ring at a given angle: three low-frequency harmonics with
 * seed- and ring-dependent phase drift. Small amplitudes keep curves smooth
 * and organic; the per-ring phase terms make successive rings diverge the
 * way real contours do rather than looking like scaled copies.
 */
function radiusAt(angle: number, baseRadius: number, seed: number, ring: number): number {
  const wobble =
    0.1 * Math.sin(2 * angle + seed * 1.31 + ring * 0.62) +
    0.055 * Math.sin(3 * angle + seed * 2.17 - ring * 0.43) +
    0.028 * Math.sin(5 * angle + seed * 0.73 + ring * 1.11);
  return baseRadius * (1 + wobble);
}

/** Catmull-Rom → cubic Bézier for a closed loop through the sample points. */
function smoothClosedPath(points: [number, number][]): string {
  const n = points.length;
  const f = (v: number) => Math.round(v * 10) / 10;
  let d = `M ${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    d += ` C ${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d} Z`;
}

/**
 * Builds the ring set for one cluster. Every third ring is a slightly heavier
 * "index contour" (the convention real charts use for every fifth line — at
 * only ~5 visible lines a subtler every-third rhythm reads better).
 */
export function contourCluster({
  seed,
  cx,
  cy,
  radii = DEFAULT_RADII,
  squash = 0.8,
  tiltDeg = -18,
}: ContourClusterOptions): ContourRing[] {
  const tilt = (tiltDeg * Math.PI) / 180;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  return radii.map((radius, ring) => {
    const points: [number, number][] = [];
    for (let i = 0; i < SAMPLES; i++) {
      const angle = (i / SAMPLES) * TAU;
      const r = radiusAt(angle, radius, seed, ring);
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle) * squash;
      points.push([cx + x * cosT - y * sinT, cy + x * sinT + y * cosT]);
    }
    return {
      d: smoothClosedPath(points),
      // Outermost rings fade — the cluster dissolves into the page rather
      // than ending on a hard outer edge.
      opacity: 0.07 - ring * 0.006,
      width: ring % 3 === 2 ? 1.4 : 0.9,
    };
  });
}
