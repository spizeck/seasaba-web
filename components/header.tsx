"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { trackBookingClick } from "@/lib/analytics";
import { uiFor } from "@/content/ui";
import { DEFAULT_LOCALE, localeHref, type Locale } from "@/lib/locale";

export function Header({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const ui = uiFor(locale);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === localeHref(locale, "/");

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
  const navItems = NAV_ITEMS.map((item) => ({
    label: ui.nav.items[item.href as keyof typeof ui.nav.items],
    href: localeHref(locale, item.href),
  }));

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        transparent
          ? "border-b border-white/10 bg-black/20 backdrop-blur-md"
          : "border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={localeHref(locale, "/")}
          className="relative flex items-center transition-opacity hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={transparent ? "/images/White SEA SABA logo transparent.png" : "/images/Full color SEA SABA logo transparent.png"}
            alt={ui.nav.logoAlt}
            width={180}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label={ui.nav.primaryLabel} className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
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
            className="bg-[#9D2235] text-white hover:bg-[#8a1e2e]"
            onClick={() => trackBookingClick("/book", "Book Now", "header_desktop")}
          >
            <Link href={localeHref(locale, "/book")}>{ui.nav.bookNow}</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md p-2 md:hidden ${
            transparent ? "text-white" : "text-muted-foreground"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? ui.nav.closeMenu : ui.nav.openMenu}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <Menu
            className={`absolute h-5 w-5 transition-all duration-300 ${
              mobileOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            }`}
          />
          <X
            className={`absolute h-5 w-5 transition-all duration-300 ${
              mobileOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
            }`}
          />
        </button>
      </div>

      {/* Mobile nav — always mounted, animated in/out */}
      <nav
        id="mobile-navigation"
        aria-label={ui.nav.mobileLabel}
        inert={!mobileOpen}
        className={`overflow-hidden border-t border-border/40 bg-background transition-all duration-500 ease-in-out md:hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-3 px-4 pb-4 pt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Button
            asChild
            size="sm"
            className="mt-2 w-full bg-[#9D2235] text-white hover:bg-[#8a1e2e]"
            onClick={() => trackBookingClick("/book", "Book Now", "header_mobile")}
          >
            <Link href={localeHref(locale, "/book")} onClick={() => setMobileOpen(false)}>{ui.nav.bookNow}</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
