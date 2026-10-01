import { cn } from "@/lib/utils";

/**
 * BubbleLoader — branded loading treatment for prominent async states.
 *
 * Renders a few small hollow bubbles rising through a contained vertical
 * area — diver bubbles on their way up. Deliberately restrained: thin rings
 * in Sea Saba blue, gentle opacity ramp, staggered starts, and a modest
 * travel distance so it reads as "nice touch," not "animation."
 *
 * - Decorative only: `aria-hidden`; pair it with visible loading text and a
 *   `role="status"` container, never as the sole loading indicator.
 * - CSS-first: transform/opacity keyframes (`--animate-bubble-rise` theme
 *   token). No JS timers, no canvas, no layout cost.
 * - Bubbles start at `opacity-0`: those still inside their stagger delay
 *   stay invisible instead of sitting fully opaque until their first cycle.
 * - `prefers-reduced-motion`: animation is removed entirely and opacity is
 *   restored, so the bubbles hold their scattered static positions as a
 *   quiet cluster beside the loading text.
 *
 * Usage: `<BubbleLoader />` (standard) or `<BubbleLoader size="sm" />`
 * inside a centered loading block.
 */

interface BubbleSpec {
  /** Horizontal anchor within the container. */
  left: string;
  /** Resting position — also where the rise begins. */
  top: string;
  /** Diameter in px. */
  size: number;
  /** Gentle one-way lateral drift in px — a few px only, no zig-zag. */
  drift: number;
  delay: string;
  duration: string;
}

/**
 * Hand-tuned scatter: six bubbles is enough to read as a stream without
 * becoming a particle field. Positions/delays are fixed (no Math.random) so
 * server markup is deterministic and hydration-safe. Larger bubbles rise a
 * little faster; smaller ones linger — a loose nod to buoyancy, kept subtle.
 */
const BUBBLES: BubbleSpec[] = [
  { left: "10%", top: "64%", size: 10, drift: 4,  delay: "0s",   duration: "3.1s" },
  { left: "26%", top: "80%", size: 6,  drift: -3, delay: "1.5s", duration: "4.4s" },
  { left: "43%", top: "58%", size: 12, drift: 5,  delay: "0.6s", duration: "2.9s" },
  { left: "58%", top: "76%", size: 7,  drift: -3, delay: "2.2s", duration: "4.1s" },
  { left: "73%", top: "62%", size: 9,  drift: 4,  delay: "1.1s", duration: "3.5s" },
  { left: "86%", top: "82%", size: 8,  drift: -5, delay: "2.8s", duration: "3.9s" },
];

const SIZES = {
  /** ~80×144px stage, 72px rise. */
  md: "h-20 w-36 [--bubble-rise-distance:-72px]",
  /** ~48×96px stage, 44px rise — for tighter loading blocks. */
  sm: "h-12 w-24 [--bubble-rise-distance:-44px]",
} as const;

interface BubbleLoaderProps {
  /** `md` (default) for prominent states like booking; `sm` for tighter blocks. */
  size?: keyof typeof SIZES;
  className?: string;
}

export function BubbleLoader({ size = "md", className }: BubbleLoaderProps) {
  return (
    <div aria-hidden="true" className={cn("relative overflow-hidden", SIZES[size], className)}>
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="absolute animate-bubble-rise rounded-full border border-primary/50 bg-primary/10 opacity-0 motion-reduce:animate-none motion-reduce:opacity-100"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
            ["--bubble-drift" as string]: `${b.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
