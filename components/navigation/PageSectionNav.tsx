"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui/pill";

// Stuck position: the 72px floating-header chrome (16px pad + 56px compact
// bar) plus a 12px breathing gap, so the secondary strip reads as a
// separate, subordinate layer rather than a bar stacked edge-to-edge
// against the pill (issue #204).
const STICKY_TOP_PX = 84;
const SCROLL_END_DEBOUNCE_MS = 100;

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
  const [isSticky, setIsSticky] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const suppressObserverRef = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Stable active-section detection using a narrow reading-line window.
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return;

        // Pick the section with the largest intersection ratio inside the
        // observer window. This naturally favors the section closest to the
        // reading position without rapid toggling between nearby sections.
        let bestId: string | null = null;
        let bestRatio = 0;

        entries.forEach((entry) => {
          const id = entry.target.id;
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestId = id;
          }
        });

        if (bestId) setActiveId(bestId);
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0,
      }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  // Track sticky state for background blur.
  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      setIsSticky(rect.top <= STICKY_TOP_PX);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Single-row strip at every width: overflow scrolls horizontally inside
  // the nav, so the right-edge fade only makes sense while content actually
  // extends past the visible edge — and lifts when scrolled to the end.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  // Keep the active pill visible in the horizontal nav container.
  useEffect(() => {
    if (!activeId) return;

    const button = buttonRefs.current[activeId];
    const container = containerRef.current;
    if (!button || !container) return;

    const pillRect = button.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const isFullyVisible =
      pillRect.left >= containerRect.left &&
      pillRect.right <= containerRect.right;

    if (!isFullyVisible) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      button.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeId]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Immediately mark the clicked pill as active and suppress observer updates
    // while the programmatic scroll is in motion to avoid flicker.
    suppressObserverRef.current = true;
    setActiveId(id);
    history.replaceState(null, "", `#${id}`);

    if (offset === 0) {
      // When offset is 0, rely on CSS scroll-margin-top for the spacing.
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      suppressObserverRef.current = false;
    }, SCROLL_END_DEBOUNCE_MS + (prefersReducedMotion ? 0 : 300));
  };

  return (
    // Stuck state stays a light translucent wash — no border or shadow — so
    // scrolled-under content is frosted out without the strip reading as a
    // second bar competing with the floating primary shell (issue #204).
    <nav
      ref={navRef}
      aria-label="On this page"
      className={cn(
        "sticky top-[84px] z-40 w-full py-2.5 transition-[background-color] duration-200 motion-reduce:transition-none sm:py-4",
        isSticky ? "bg-background/80 backdrop-blur-md" : "bg-transparent",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Always one row — overflow scrolls inside the strip at every
            width. The right-edge mask fade appears only while content
            actually extends past the edge, so a partially visible next pill
            reads as an intentional scroll affordance. scroll-px keeps a
            comfortable inset when the browser scrolls a focused pill into
            view. */}
        <div
          ref={containerRef}
          className={cn(
            "scrollbar-hide flex flex-nowrap gap-2 overflow-x-auto scroll-px-4 pb-2",
            canScrollRight &&
              "[mask-image:linear-gradient(to_right,black_85%,transparent)]"
          )}
        >
          {items.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <Pill
                key={id}
                ref={(node) => {
                  buttonRefs.current[id] = node;
                }}
                active={isActive}
                onClick={() => handleClick(id)}
              >
                {label}
              </Pill>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
