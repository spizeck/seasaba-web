"use client";

import { useState } from "react";

const MAPS_URL =
  "https://www.google.com/maps/place/Sea+Saba+Dive+Center/@17.6163,-63.2317,17z";

/**
 * Breakpoint-specific pin positions.
 * Tune these after reviewing each viewport — the image crop shifts
 * significantly between the 4:3 mobile and 2.4:1 desktop aspect ratios.
 *
 * visible xs  (<640px)      — mobile portrait
 * visible sm  (640–1023px)  — tablet / large phone landscape
 * visible lg  (1024px+)     — desktop
 */
const POSITIONS = {
  xs: { left: "33%", top: "61%" },
  sm: { left: "33%", top: "61%" },
  lg: { left: "34%", top: "68%" },
} as const;

/**
 * Branded location pin for the About page hero.
 * Renders two instances — one per breakpoint — shown/hidden via Tailwind
 * responsive classes so each sits precisely on the building at that crop.
 * Desktop: hover reveals tooltip. Mobile: tap toggles tooltip.
 */
export function LocationPin() {
  return (
    <>
      {/* Mobile (xs, below sm) */}
      <Pin
        left={POSITIONS.xs.left}
        top={POSITIONS.xs.top}
        className="block sm:hidden"
      />
      {/* Tablet (sm–lg) */}
      <Pin
        left={POSITIONS.sm.left}
        top={POSITIONS.sm.top}
        className="hidden sm:block lg:hidden"
      />
      {/* Desktop (lg+) */}
      <Pin
        left={POSITIONS.lg.left}
        top={POSITIONS.lg.top}
        className="hidden lg:block"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Internal Pin — not exported                                          */
/* ------------------------------------------------------------------ */

function Pin({
  left,
  top,
  className = "",
}: {
  left: string;
  top: string;
  className?: string;
}) {
  const [tapped, setTapped] = useState(false);

  return (
    <div
      className={`group absolute z-20 ${className}`}
      style={{ left, top, transform: "translate(-50%, -100%)" }}
    >
      {/* Tooltip — CSS hover (desktop) + tapped state (mobile) */}
      <div
        className={`absolute bottom-full left-1/2 mb-4 -translate-x-1/2 transition-all duration-200 ${
          tapped
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        } group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto`}
      >
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get directions to Sea Saba Dive Center on Google Maps, opens in a new tab"
          className="flex flex-col items-center whitespace-nowrap rounded-xl px-3.5 py-2.5 text-center shadow-xl backdrop-blur-sm"
          style={{ background: "rgba(11,15,59,0.85)", minWidth: "9rem" }}
        >
          <span className="text-xs font-semibold text-white">Sea Saba Dive Center</span>
          <span className="mt-0.5 text-[10px] text-white/70">Fort Bay Harbor</span>
          <span className="mt-2 text-[10px] font-medium tracking-wide text-white/50 uppercase">
            Get Directions ↗
          </span>
        </a>
        {/* Tooltip arrow */}
        <div
          className="mx-auto mt-[-4px] h-2.5 w-2.5 rotate-45"
          style={{ backgroundColor: "rgba(11,15,59,0.85)" }}
        />
      </div>

      {/* Pin marker */}
      <button
        type="button"
        aria-label="Sea Saba Dive Center location. Opens Google Maps in a new tab."
        aria-expanded={tapped}
        onClick={() => setTapped((o) => !o)}
        className="relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
      >
        {/* Pulse ring */}
        <span
          className="absolute inset-0 animate-ping rounded-full opacity-25"
          style={{ backgroundColor: "#9D2235", animationDuration: "2.8s" }}
        />
        {/* Pin body */}
        <span
          className="relative flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform duration-200 group-hover:scale-110 lg:h-12 lg:w-12"
          style={{ backgroundColor: "#9D2235", boxShadow: "0 4px 16px rgba(157,34,53,0.5)" }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5 lg:h-6 lg:w-6">
            <path
              d="M3 12 C5 9, 7 15, 9 12 S13 9, 15 12 S19 15, 21 12"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {/* Pin tail */}
        <span
          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
          style={{ backgroundColor: "#9D2235" }}
        />
      </button>
    </div>
  );
}
