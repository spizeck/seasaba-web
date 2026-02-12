"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_ITEMS, SITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

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

  const transparent = isHome && !scrolled && !mobileOpen;

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
          href="/"
          className={`text-xl font-semibold tracking-tight transition-colors ${
            transparent ? "text-white" : "text-foreground"
          }`}
        >
          {SITE_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
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
          <Button asChild size="sm" className={transparent ? "bg-white text-primary hover:bg-white/90" : ""}>
            <Link href="/book">Book Now</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          className={`inline-flex items-center justify-center rounded-md p-2 md:hidden ${
            transparent ? "text-white" : "text-muted-foreground"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-border/40 bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2 w-full">
              <Link href="/book" onClick={() => setMobileOpen(false)}>Book Now</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
