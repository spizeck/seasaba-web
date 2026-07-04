"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "where-to-stay", label: "Where to Stay" },
  { id: "restaurants", label: "Restaurants" },
  { id: "transportation", label: "Transportation" },
  { id: "dive-partners", label: "Dive Partners" },
  { id: "training-agencies", label: "Training Agencies" },
  { id: "equipment-partners", label: "Equipment Partners" },
  { id: "conservation-partners", label: "Conservation" },
];

const HEADER_HEIGHT = 64;

export function OnThisPageNav() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      setIsSticky(rect.top <= HEADER_HEIGHT);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "sticky top-16 z-40 w-full py-4 transition-all duration-200",
        isSticky
          ? "border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      )}
      aria-label="On this page"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleClick(id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeId === id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
              aria-current={activeId === id ? "true" : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
