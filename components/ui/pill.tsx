import { cn } from "@/lib/utils";
import * as React from "react";

type PillProps = {
  children: React.ReactNode;
  active?: boolean;
  /**
   * Toggle/filter semantics: the pill switches something on or off, so the
   * active state is announced as aria-pressed. Without it, active pills
   * carry aria-current for "current item in a set" (e.g. section nav).
   */
  toggle?: boolean;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Shared pill button used for on-page navigation, filter chips, and similar
 * pill-shaped controls across the Sea Saba site.
 *
 * Visual match: round, border, small text, medium weight, transition colors.
 * Active state: primary filled pill with white text.
 * Inactive state: light background with subtle border.
 */
export const Pill = React.forwardRef<HTMLButtonElement, PillProps>(
  ({ children, active = false, toggle = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-pressed={toggle ? active : undefined}
        aria-current={!toggle && active ? "true" : undefined}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full border px-3 py-1 text-xs font-medium pressable focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:opacity-50",
          active
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground disabled:hover:border-border/60 disabled:hover:bg-background disabled:hover:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Pill.displayName = "Pill";
