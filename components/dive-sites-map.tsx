"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface DiveRegion {
  id: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  description: string;
  thumbnail: string;
  targetSectionId: string;
}

// Six main dive regions around Saba
const DIVE_REGIONS: DiveRegion[] = [
  {
    id: "pinnacles",
    name: "The Pinnacles",
    x: 50,
    y: 76,
    description: "Saba's most iconic dive sites. Third Encounter, Eye of the Needle, and dramatic submerged pinnacles.",
    thumbnail: "/images/optimized/divers-above-pinnacle-saba.webp",
    targetSectionId: "pinnacles",
  },
  {
    id: "tent-reef",
    name: "Tent Reef",
    x: 38,
    y: 68,
    description: "Versatile diving with both pinnacle and wall options. Exceptional visibility and marine life.",
    thumbnail: "/images/optimized/green-turtle-tent-reef.webp",
    targetSectionId: "tent-reef",
  },
  {
    id: "ladder-bay",
    name: "Ladder Bay",
    x: 26,
    y: 48,
    description: "Dramatic walls and intricate reef systems with consistently excellent visibility.",
    thumbnail: "/images/optimized/spiny-lobster-ladder-bay.webp",
    targetSectionId: "ladder-bay",
  },
  {
    id: "wells-bay",
    name: "Wells Bay",
    x: 32,
    y: 28,
    description: "Pristine, rarely visited sites in the northwest corner with untouched coral.",
    thumbnail: "/images/optimized/saba-volcanic-coastline.webp",
    targetSectionId: "wells-bay",
  },
  {
    id: "windwardside",
    name: "Windwardside",
    x: 72,
    y: 50,
    description: "Protected eastern waters perfect for all experience levels and photographers.",
    thumbnail: "/images/optimized/green-turtle-with-diver-saba.webp",
    targetSectionId: "windwardside",
  },
  {
    id: "diamond-rock",
    name: "Diamond Rock",
    x: 65,
    y: 82,
    description: "Spectacular offshore pinnacle rising from 50 meters. Hammerhead territory.",
    thumbnail: "/images/optimized/reef-shark-pinnacle.webp",
    targetSectionId: "diamond-rock",
  },
];

// Placeholder individual dive sites (for future expansion)
const DIVE_SITE_PINS = [
  { id: "third-encounter", name: "Third Encounter", x: 48, y: 74, targetSectionId: "pinnacles" },
  { id: "eye-of-the-needle", name: "Eye of the Needle", x: 52, y: 78, targetSectionId: "pinnacles" },
  { id: "tent-reef-wall", name: "Tent Reef Wall", x: 36, y: 66, targetSectionId: "tent-reef" },
  { id: "ladder-labyrinth", name: "Ladder Labyrinth", x: 24, y: 46, targetSectionId: "ladder-bay" },
  { id: "man-o-war", name: "Man O' War Shoals", x: 34, y: 26, targetSectionId: "wells-bay" },
  { id: "green-island", name: "Green Island", x: 74, y: 48, targetSectionId: "windwardside" },
];

interface DiveSitesMapProps {
  showIndividualSites?: boolean;
}

export function DiveSitesMap({ showIndividualSites = false }: DiveSitesMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const scrollToSection = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveRegion(null);
    }
  }, []);

  return (
    <div className="relative w-full aspect-[4/3] max-h-[700px] rounded-2xl overflow-hidden bg-muted shadow-xl">
      {/* Map Background Image */}
      {/* TODO: Replace with converted saba_map.jpf when available */}
      <Image
        src="/images/optimized/saba-island-aerial-golden-hour.webp"
        alt="Aerial map of Saba showing dive regions"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      
      {/* Dark overlay for better pin visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

      {/* Region Pins */}
      {DIVE_REGIONS.map((region) => {
        const isHovered = hoveredRegion === region.id;
        const isActive = activeRegion === region.id;

        return (
          <div
            key={region.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
            }}
          >
            {/* Pin Marker */}
            <button
              onClick={() => {
                // On mobile, show card first. On desktop, scroll immediately
                if (window.innerWidth < 768) {
                  setActiveRegion(region.id);
                } else {
                  scrollToSection(region.targetSectionId);
                }
              }}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              onFocus={() => setHoveredRegion(region.id)}
              onBlur={() => setHoveredRegion(null)}
              className={`
                relative group
                flex items-center justify-center
                w-10 h-10 md:w-12 md:h-12
                rounded-full
                bg-primary/90 hover:bg-primary
                text-white
                shadow-lg
                transition-all duration-300 ease-out
                focus:outline-none focus:ring-3 focus:ring-primary focus:ring-offset-2
                ${isActive ? "ring-3 ring-white scale-110" : ""}
                ${isHovered ? "scale-110" : ""}
              `}
              aria-label={`${region.name} - ${region.description}`}
              tabIndex={0}
            >
              {/* Location Icon */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 md:w-6 md:h-6"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>

              {/* Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
            </button>

            {/* Hover Card - Desktop */}
            {isHovered && (
              <div 
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-20 hidden md:block"
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
              >
                <div className="bg-white dark:bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden w-64">
                  {/* Thumbnail */}
                  <div className="relative h-32 w-full">
                    <Image
                      src={region.thumbnail}
                      alt={region.name}
                      fill
                      className="object-cover"
                      sizes="256px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-white">
                      <p className="text-xs font-medium opacity-90">Dive Area</p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <h4 className="text-sm font-bold text-foreground">{region.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {region.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary">
                      Click to explore →
                    </p>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-8 border-transparent border-t-white dark:border-t-card" />
                </div>
              </div>
            )}

            {/* Mobile Info Card */}
            {isActive && (
              <div className="fixed inset-x-4 bottom-20 z-50 md:hidden">
                <div className="bg-white dark:bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                  <div className="relative h-40 w-full">
                    <Image
                      src={region.thumbnail}
                      alt={region.name}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRegion(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-3 left-4 text-white">
                      <h4 className="text-lg font-bold">{region.name}</h4>
                      <p className="text-sm opacity-90">Dive Area</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {region.description}
                    </p>
                    <button
                      onClick={() => scrollToSection(region.targetSectionId)}
                      className="mt-3 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium"
                    >
                      Explore {region.name}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Future: Individual dive site pins (smaller, more subtle) */}
      {showIndividualSites && DIVE_SITE_PINS.map((site) => (
        <button
          key={site.id}
          onClick={() => scrollToSection(site.targetSectionId)}
          className="absolute w-3 h-3 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all hover:scale-125"
          style={{
            left: `${site.x}%`,
            top: `${site.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          title={site.name}
        />
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-border/50">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-foreground">Dive Regions</span>
          </div>
          {showIndividualSites && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border border-border" />
              <span className="text-xs text-muted-foreground">Individual Sites</span>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close mobile card */}
      {activeRegion && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setActiveRegion(null)}
        />
      )}
    </div>
  );
}
