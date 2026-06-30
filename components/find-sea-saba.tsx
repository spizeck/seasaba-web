"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const MAPS_URL = "https://www.google.com/maps/place/Sea+Saba+Dive+Center/@17.6163,-63.2317,17z";
const APPLE_MAPS_URL = "https://maps.apple.com/?q=Sea+Saba+Dive+Center&ll=17.6163,-63.2317";

const PIN = { left: "35%", top: "74%", size: 22 } as const;
const HERO_IMAGE = {
  src: "/images/optimized/fort-bay-harbor-saba.webp",
  alt: "Sea Saba diving operation at Fort Bay Harbor, Saba",
} as const;

function openMaps() {
  window.open(MAPS_URL, "_blank", "noopener,noreferrer");
}

export function FindSeaSaba() {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <div className="flex h-full flex-col rounded-xl ring-1 ring-border/60 ring-inset bg-card overflow-hidden">
      {/* Hero image with title overlay, pin, and buttons */}
      <div
        className="relative h-[240px] w-full sm:h-[260px] lg:h-[280px]"
      >
        <Image
          src={HERO_IMAGE.src}
          alt={HERO_IMAGE.alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />

        {/* Pin */}
        <div
          className="group absolute z-10"
          style={{ left: PIN.left, top: PIN.top, transform: "translate(-50%, -100%)" }}
        >
          {/* Tooltip */}
          <div
            className={`absolute bottom-full left-1/2 mb-3 -translate-x-1/2 transition-all duration-200 ${
              tooltipOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
            } group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto`}
          >
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get directions to Sea Saba Dive Center, opens Google Maps in a new tab"
              className="flex min-w-[10rem] flex-col items-start rounded-xl bg-white px-4 py-3 shadow-xl no-underline"
            >
              <span className="text-sm font-semibold text-foreground">Sea Saba Dive Center</span>
              <span className="mt-0.5 text-xs text-muted-foreground">Fort Bay Harbor</span>
              <span className="mt-2 text-xs font-medium" style={{ color: "#9D2235" }}>
                Get Directions ↗
              </span>
            </a>
            <div className="mx-auto mt-[-5px] h-2.5 w-2.5 rotate-45 bg-white shadow-sm" />
          </div>

          {/* Pin marker — opens Google Maps when clicked */}
          <button
            type="button"
            aria-label="Open Sea Saba Dive Center in Google Maps, opens in a new tab"
            aria-expanded={tooltipOpen}
            onClick={(e) => { e.stopPropagation(); openMaps(); }}
            className="relative flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
          >
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-20"
              style={{ backgroundColor: "#9D2235", animationDuration: "2.8s" }}
            />
            <span
              className="relative flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
              style={{
                width: PIN.size,
                height: PIN.size,
                backgroundColor: "#9D2235",
                boxShadow: "0 4px 14px rgba(157,34,53,0.55)",
                animation: "seasaba-float 3s ease-in-out infinite",
              }}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                <path
                  d="M3 12 C5 9, 7 15, 9 12 S13 9, 15 12 S19 15, 21 12"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45"
              style={{ backgroundColor: "#9D2235" }}
            />
          </button>
          <style>{`
            @keyframes seasaba-float {
              0%, 100% { transform: translateY(0); }
              50%       { transform: translateY(-5px); }
            }
          `}</style>
        </div>
      </div>

      <p className="px-4 pt-8 text-sm leading-snug text-muted-foreground">
        Located directly on Fort Bay Harbor, where every Sea Saba dive trip begins.
      </p>

      {/* Map links */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-4">
        <Button asChild variant="outline" className="w-full">
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Sea Saba in Google Maps, opens in a new tab"
            className="no-underline"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#4285F4"/>
              <circle cx="12" cy="9" r="2.5" fill="white"/>
            </svg>
            Open in Google Maps ↗
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a
            href={APPLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Sea Saba in Apple Maps, opens in a new tab"
            className="no-underline"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
              <path d="M16.05 2c.14 1.3-.38 2.57-1.1 3.49-.75.95-1.96 1.68-3.17 1.58-.17-1.27.45-2.58 1.14-3.4C13.65 2.7 14.94 2.04 16.05 2zM20 17.3c-.6 1.3-1.3 2.5-2.28 3.5-.8.8-1.56 1.2-2.56 1.2-.96 0-1.6-.44-2.56-.44-.98 0-1.7.45-2.57.45-.96 0-1.76-.44-2.56-1.26C5.9 19.4 5 17.3 5 15.3c0-3.4 2.22-5.2 4.4-5.2.98 0 1.8.46 2.42.46.6 0 1.54-.5 2.6-.5 1.57 0 3.22.9 4.06 2.6-3.56 1.94-2.98 6.8.52 4.64z"/>
            </svg>
            Open in Apple Maps ↗
          </a>
        </Button>
      </div>
    </div>
  );
}
