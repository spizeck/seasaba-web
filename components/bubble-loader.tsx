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
 * - `prefers-reduced-motion`: animation is removed entirely; the bubbles
 *   hold their scattered static positions and remain visible as a quiet
 *   cluster beside the loading text.
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
  delay: string;
  duration: string;
}

/**
 * Hand-tuned scatter: six bubbles is enough to read as a stream without
 * becoming a particle field. Positions/delays are fixed (no Math.random) so
 * server markup is deterministic and hydration-safe.
 */
const BUBBLES: BubbleSpec[] = [
  { left: "10%", top: "64%", size: 10, delay: "0s",    duration: "3.2s" },
  { left: "26%", top: "80%", size: 6,  delay: "1.5s",  duration: "4.0s" },
  { left: "43%", top: "58%", size: 12, delay: "0.6s",  duration: "3.0s" },
  { left: "58%", top: "76%", size: 7,  delay: "2.2s",  duration: "4.2s" },
  { left: "73%", top: "62%", size: 9,  delay: "1.1s",  duration: "3.5s" },
  { left: "86%", top: "82%", size: 8,  delay: "2.8s",  duration: "3.8s" },
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
          className="absolute animate-bubble-rise rounded-full border border-primary/50 bg-primary/10 motion-reduce:animate-none"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
    </div>
  );
}
