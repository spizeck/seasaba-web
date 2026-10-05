import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * StatePanel — shared presentational block for calm inline states:
 * loading, empty, filtered-empty, recoverable error, and unavailable.
 *
 * Deliberately small: a bordered, centered panel with a title, an optional
 * concise description, an optional leading visual (e.g. BubbleLoader or an
 * icon), and optional children for actions (retry, clear filters, links).
 *
 * ARIA: pass `role="status"` for pending states and `role="alert"` for
 * failures that appear asynchronously; leave `role` unset for static
 * empty states that are announced by surrounding content (e.g. a result
 * count updating to zero).
 */
export function StatePanel({
  title,
  description,
  leading,
  role,
  children,
  className,
}: {
  title: string;
  description?: ReactNode;
  /** Visual shown above the title — BubbleLoader, icon, etc. */
  leading?: ReactNode;
  role?: "status" | "alert";
  /** Actions rendered below the description (retry, reset, links). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={role}
      className={cn(
        "rounded-lg border border-border/40 bg-muted/20 p-8 text-center",
        className
      )}
    >
      {leading}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
