"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { trackBookingClick } from "@/lib/analytics";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const transparent = isHome && !scrolled && !mobileOpen;
  // Compact geometry is the site-wide standard (issue #204): the homepage's
  // scrolled pill is the canonical size, and interior pages render it from
  // first paint — no oversized start, no scroll-driven shrink. Only the
  // homepage hero state runs the larger pill. Reuses the existing `scrolled`
  // threshold (scrollY > 48) so the pill's color and size settle at the same
  // deterministic point — a single boolean flip means no flicker, no
  // per-frame measurement, and no competing thresholds.
  const compact = !isHome || scrolled;

  return (
    // On the homepage the sticky band is zero-height: the pill overlays the
    // hero instead of occupying document flow, so menu open/close and the
    // compact transition can never push the hero down (issue #204). The
    // hero's own pt-20 keeps its content clear of the overlaid pill.
    // Interior pages keep the band in flow — 16px pad + 56px compact bar =
    // 72px of top chrome that scroll-position-keeper measures and
    // PageSectionNav offsets against.
    <header
      className={`sticky top-0 z-50 w-full ${
        isHome ? "h-0 overflow-visible" : ""
      }`}
    >
      {/* Outer padding lives on this wrapper (not the band) so the homepage's
          zero-height band truly reserves no flow space; children simply
          overflow visibly over the hero. */}
      <div className="px-4 pt-4 sm:px-6 lg:px-8">
      {/* Anchors the floating mobile panel to the pill's box so the shell
          itself never has to grow to host the open menu. */}
      <div className="relative mx-auto max-w-6xl">
      {/* The outline is a ring, not a border: ring draws via box-shadow so it
          doesn't add to the shell — the interior chrome stays exactly 72px
          tall (16px pad + 56px bar), matching the sticky PageSectionNav's
          offset. The shell's geometry is fixed; opening the menu never
          morphs it. */}
      <div
        className={`rounded-full shadow-md ring-1 transition-[background-color,box-shadow,color] duration-200 motion-reduce:transition-none ${
          transparent
            ? "bg-black/25 ring-white/15 backdrop-blur-md"
            : "bg-background/95 ring-border/50 backdrop-blur supports-backdrop-filter:bg-background/70"
        }`}
      >
        {/* Compact is the canonical bar geometry: h-14 bar / h-9 logo
            everywhere except the homepage's unscrolled hero state (h-16 /
            h-10). Horizontal padding is constant so the shell keeps its
            stance; the hamburger retains its 44px target. */}
        <div
          className={`flex items-center justify-between pl-5 pr-2.5 transition-[height] duration-200 motion-reduce:transition-none sm:pl-6 sm:pr-3 lg:px-6 ${
            compact ? "h-14" : "h-16"
          }`}
        >
          <Link
            href="/"
            className="relative flex items-center transition-opacity hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={transparent ? "/images/White SEA SABA logo transparent.png" : "/images/Full color SEA SABA logo transparent.png"}
              alt="Sea Saba logo"
              width={180}
              height={40}
              className={`w-auto transition-[height] duration-200 motion-reduce:transition-none ${
                compact ? "h-9" : "h-10"
              }`}
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  transparent
                    ? "text-white/80 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              size="sm"
              className="rounded-full bg-[#9D2235] text-white hover:bg-[#8a1e2e]"
              onClick={() => trackBookingClick("/book", "Book Now", "header_desktop")}
            >
              <Link href="/book">Book Now</Link>
            </Button>
          </nav>

          {/* Mobile toggle — 44px hit area, but visually a ghost chip of the
              pill itself: a hairline ring and a barely-there tinted wash in
              the shell's own color family (white on the dark hero pill, Sea
              Saba blue on the light pill) with a light backdrop blur. The
              surface is identical for the hamburger and X states — only the
              icon crossfades. */}
          <button
            className={`pressable relative inline-flex h-11 w-11 items-center justify-center rounded-full p-2 ring-1 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden ${
              transparent
                ? "bg-white/10 text-white ring-white/20 hover:bg-white/20"
                : "bg-primary/[0.04] text-primary ring-primary/15 hover:bg-primary/10"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            <Menu
              className={`absolute h-5 w-5 transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
                mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
              }`}
            />
            <X
              className={`absolute h-5 w-5 transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
                mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
              }`}
            />
          </button>
        </div>

        </div>

        {/* Mobile nav — a separate floating surface below the pill, not an
            expansion of it. The shell keeps its geometry; the panel reveals
            as one object with a 6px settle while opacity only softens the
            move (0.92→1 in, 1→0.92 out) — it never fades from nothing. The
            material itself (glass/ring/shadow/radius) is constant in both
            states so nothing appears to develop or brighten mid-transition;
            `visibility` joins the transition list so the panel hides exactly
            when the exit finishes (discrete flip at the end on close, at the
            start on open) instead of fading to transparent. Always mounted
            so the same transition runs in reverse on close; inert +
            visibility keep the hidden panel out of the tab order and out
            from under taps. The scrollable region is bounded by the viewport
            minus the pill's top offset + bar so Book Now stays reachable on
            very short viewports. */}
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          inert={!mobileOpen}
          className={`absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl bg-background/95 shadow-md ring-1 ring-border/50 backdrop-blur transition-[opacity,translate,visibility] ease-out motion-reduce:transition-none supports-backdrop-filter:bg-background/70 lg:hidden ${
            mobileOpen
              ? "visible translate-y-0 opacity-100 duration-[180ms]"
              : "invisible pointer-events-none -translate-y-1.5 opacity-[0.92] duration-[140ms]"
          }`}
        >
          {/* Contiguous py-2.5 rows: ~44px tap targets with no dead space
              between items, so the menu stays dense while remaining
              comfortable to hit. */}
          <div className="flex flex-col px-5 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2.5 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              size="lg"
              className="mt-2 w-full bg-[#9D2235] text-white hover:bg-[#8a1e2e]"
              onClick={() => trackBookingClick("/book", "Book Now", "header_mobile")}
            >
              <Link href="/book" onClick={() => setMobileOpen(false)}>Book Now</Link>
            </Button>
          </div>
        </nav>
      </div>
      </div>
    </header>
  );
}
