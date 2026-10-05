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

  return (
    // Sticky band stays full-width (scroll-position-keeper measures it as top
    // chrome); its transparent padding supplies the breathing room that makes
    // the inner shell read as a floating object (issue #204). The band is
    // 16px pad + 64px bar = 80px of flow height — hero.tsx compensates with
    // -mt-20 so the homepage hero still extends to the viewport top.
    <header className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-6 lg:px-8">
      {/* The outline is a ring, not a border: ring draws via box-shadow so it
          doesn't add 2px to the shell — the chrome stays exactly 80px tall
          (16px pad + 64px bar), matching hero's -mt-20 and the sticky
          PageSectionNav's top-20. */}
      <div
        className={`mx-auto max-w-6xl shadow-md ring-1 transition-[background-color,box-shadow,border-radius,color] duration-200 ${
          mobileOpen ? "rounded-3xl lg:rounded-full" : "rounded-full"
        } ${
          transparent
            ? "bg-black/25 ring-white/15 backdrop-blur-md"
            : "bg-background/95 ring-border/50 backdrop-blur supports-backdrop-filter:bg-background/70"
        }`}
      >
        <div className="flex h-16 items-center justify-between pl-5 pr-2.5 sm:pl-6 sm:pr-3 lg:px-6">
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
              className="h-10 w-auto"
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

          {/* Mobile toggle — 44px hit area; the subtle fill makes it read as a
              substantial button inside the rounded shell. */}
          <button
            className={`pressable relative inline-flex h-11 w-11 items-center justify-center rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden ${
              transparent
                ? "bg-white/10 text-white hover:bg-white/20"
                : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"
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

        {/* Mobile nav — expands inside the shell so the open menu stays
            visually attached to the pill rather than dropping as a detached
            full-width panel. Always mounted, animated in/out. */}
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          inert={!mobileOpen}
          className={`transition-[max-height,opacity] duration-300 ease-in-out motion-reduce:transition-none lg:hidden ${
            mobileOpen
              ? "max-h-[70dvh] overflow-y-auto border-t border-border/40 opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          {/* Contiguous py-2.5 rows: ~44px tap targets with no dead space
              between items, so the menu stays dense while remaining
              comfortable to hit. */}
          <div className="flex flex-col px-5 pb-5 pt-2 sm:px-6">
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
    </header>
  );
}
