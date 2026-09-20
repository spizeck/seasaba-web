"use client";

import Image from "next/image";
import Link from "next/link";
import { trackBookingClick, trackLinkClick } from "@/lib/analytics";
import { OPERATIONS } from "@/data/operations";

// A/B test toggle: "A" = Sea Saba red CTA, "B" = white CTA with red text
const HERO_CTA_VARIANT: "A" | "B" = "A";

const TRUST_INDICATORS: { stat: string; statMobile?: string; label: string; href?: string }[] = [
  { stat: `Since ${OPERATIONS.establishedYear}`, label: "Established" },
  { stat: "30+ Dive Sites", label: "Protected Waters" },
  { stat: "\u2605\u2605\u2605\u2605\u2605 4.8/5", statMobile: "\u2605 4.8/5", label: "Google & TripAdvisor", href: "https://www.google.com/maps/search/?api=1&query=Sea+Saba+Dive+Center+Fort+Bay+Saba&query_place_id=ChIJX0c19WkgDowRn2l3bKbFrRU" },
];

const btnClasses =
  "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-md px-6 text-[0.9375rem] font-semibold no-underline transition-[background-color,box-shadow] duration-200 cursor-pointer";

const primaryCTAClasses =
  HERO_CTA_VARIANT === "A"
    ? "bg-[#9D2235] text-white"
    : "bg-white font-bold text-[#9D2235] shadow-[0_4px_12px_rgba(0,0,0,0.15)]";

const glassClasses =
  "border border-white/25 bg-black/35 text-white backdrop-blur-[8px]";

// Compact-but-legible secondary styling on narrow phones: same 44px touch
// target, smaller label/padding so the pair fits side-by-side at 320px.
const secondaryMobileClasses = "max-sm:px-3 max-sm:text-sm";

export function Hero() {
  return (
    <section
      // Marks the homepage hero region: the Respond.io launcher is
      // suppressed while this intersects the viewport (issue #123).
      data-hero
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden -mt-16 pt-16"
      // 100svh = the small viewport: the hero (and its bottom-anchored trust
      // bar) fits the first screen while mobile browser chrome is shown,
      // unlike 100vh which sizes to the chrome-collapsed height. Inline so
      // browsers without svh support ignore it and keep min-h-screen.
      style={{ minHeight: "100svh" }}
    >
      {/* Background image — next/image so the LCP resource is preloaded,
          fetch-prioritised, and served responsively instead of as a
          full-resolution CSS background. */}
      <Image
        src="/images/optimized/divers-above-reef-saba.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Uniform contrast overlay — subtle, not dramatic */}
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />

      {/* Bottom vignette for trust bar separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />

      <div className="relative z-10 mx-auto max-w-3xl flex-1 flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-20 lg:px-8">
        <h1 className="font-heading italic text-3xl leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.4)' }}>
          Dive the Extraordinary.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
          Just 5 square miles above.<br className="hidden sm:block" />{" "}
          Some of the Caribbean&apos;s most unique diving below.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          {/* Primary CTA — A/B tested, own row on mobile */}
          <Link
            href="/book"
            className={`${btnClasses} ${primaryCTAClasses}`}
            onClick={() => trackBookingClick("/book", "Book Diving", "homepage_hero")}
          >
            Book Diving
          </Link>
          {/* Secondary CTAs — glassmorphism; side-by-side on mobile where they
              fit, wrapping to two centered rows at the narrowest widths. */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <Link href="/plan-your-trip" className={`${btnClasses} ${glassClasses} ${secondaryMobileClasses}`}>
              Plan Your Trip
            </Link>
            <Link href="/dive-sites" className={`${btnClasses} ${glassClasses} ${secondaryMobileClasses}`}>
              Explore Dive Sites
            </Link>
          </div>
        </div>
      </div>

      {/* Trust indicator bar — anchored at bottom of hero */}
      <div className="relative z-10 w-full border-t border-white/20 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {TRUST_INDICATORS.map((item) => {
              const inner = (
                <>
                  <div className="whitespace-nowrap text-[13px] font-semibold text-white sm:text-base" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    {item.statMobile ? (
                      <>
                        <span className="sm:hidden">{item.statMobile}</span>
                        <span className="hidden sm:inline">{item.stat}</span>
                      </>
                    ) : (
                      item.stat
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-white/75 uppercase tracking-wide">
                    {item.href ? (
                      <>
                        <span className="sm:hidden">Reviews</span>
                        <span className="hidden sm:inline">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </div>
                </>
              );
              return item.href ? (
                <a
                  key={item.stat}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => item.href && trackLinkClick("social_click", item.href, "Google Reviews")}
                  className="text-center transition-opacity hover:opacity-80"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.stat} className="text-center">
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
