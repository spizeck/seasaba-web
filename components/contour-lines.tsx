import { contourCluster } from "@/lib/contours";
import { cn } from "@/lib/utils";

/**
 * ContourLines — decorative bathymetric/topographic contour cluster.
 *
 * Renders a handful of nested, irregular closed rings whose implied "summit"
 * sits just outside a section corner, so the visible portion is a set of
 * quiet arcs entering the composition and leaving it again — the same
 * geometry a chart draws around Saba's volcanic cone and seamounts.
 *
 * Purely decorative:
 * - `aria-hidden`, `focusable="false"`, `pointer-events-none`
 * - absolutely positioned — zero layout shift
 * - static inline SVG — no client JavaScript, no animation
 * - hidden under forced-colors so high-contrast mode stays clean
 *
 * Usage: place inside a `relative overflow-hidden` section. The ring set
 * strokes `currentColor`, so set a token color (e.g. `text-primary`) on the
 * element; per-ring opacity/weight are baked into the geometry.
 */

export type ContourCorner =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

/**
 * All rings are authored around a summit near the canvas's top-right corner;
 * corner variants mirror the canvas so the summit always sits just outside
 * the requested corner.
 */
const CORNER_POSITION: Record<ContourCorner, string> = {
  "top-right": "-top-16 -right-16 sm:-top-24 sm:-right-24 lg:-top-28 lg:-right-28",
  "top-left": "-top-16 -left-16 sm:-top-24 sm:-left-24 lg:-top-28 lg:-left-28 -scale-x-100",
  "bottom-right": "-bottom-16 -right-16 sm:-bottom-24 sm:-right-24 lg:-bottom-28 lg:-right-28 -scale-y-100",
  "bottom-left": "-bottom-16 -left-16 sm:-bottom-24 sm:-left-24 lg:-bottom-28 lg:-left-28 -scale-x-100 -scale-y-100",
};

/** Summit anchor in viewBox units (0–640), near the top-right corner. */
const SUMMIT = { cx: 560, cy: 84 };

interface ContourLinesProps {
  /** Section corner the cluster anchors to. */
  corner?: ContourCorner;
  /** Shape seed — each integer produces a distinct contour family. */
  seed?: number;
  className?: string;
}

export function ContourLines({ corner = "top-right", seed = 1, className }: ContourLinesProps) {
  const rings = contourCluster({ seed, ...SUMMIT });
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute size-[300px] sm:size-[440px] lg:size-[560px] [@media(forced-colors:active)]:hidden",
        CORNER_POSITION[corner],
        className,
      )}
    >
      <svg viewBox="0 0 640 640" fill="none" focusable="false" className="block size-full">
        {rings.map((ring, i) => (
          <path
            key={i}
            d={ring.d}
            stroke="currentColor"
            strokeOpacity={ring.opacity}
            strokeWidth={ring.width}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
