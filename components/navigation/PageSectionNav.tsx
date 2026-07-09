"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PageNavItem = {
  id: string;
  label: string;
};

type PageSectionNavProps = {
  items: PageNavItem[];
  className?: string;
  /** Extra offset for sticky headers (px). Defaults to 96. */
  offset?: number;
};

export function PageSectionNav({ items, className, offset = 96 }: PageSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const visible = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
        });

        let bestId: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestId) setActiveId(bestId);
      },
      {
        rootMargin: `-${offset}px 0px -40% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items, offset]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    // Update URL hash without jumping
    history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "relative",
        className
      )}
    >
      <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 whitespace-nowrap">
          {items.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <Link
                  href={`#${id}`}
                  onClick={(e) => handleClick(e, id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
