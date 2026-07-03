"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Accommodation, AccommodationCategory } from "@/data/partners";

interface AccommodationsSectionProps {
  accommodations: Accommodation[];
}

const CATEGORY_LABELS: Record<AccommodationCategory, string> = {
  hotel: "Hotels",
  cottage: "Cottages",
  villa: "Villas",
};

export function AccommodationsSection({ accommodations }: AccommodationsSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const allFilters = useMemo(() => {
    const categories = ["Hotels", "Cottages", "Villas"];
    const featureSet = new Set<string>();
    accommodations.forEach((a) => a.features.forEach((f) => featureSet.add(f)));
    return ["All", ...categories, ...Array.from(featureSet).sort()];
  }, [accommodations]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return accommodations;
    if (activeFilter === "Hotels") return accommodations.filter((a) => a.category === "hotel");
    if (activeFilter === "Cottages") return accommodations.filter((a) => a.category === "cottage");
    if (activeFilter === "Villas") return accommodations.filter((a) => a.category === "villa");
    return accommodations.filter((a) => a.features.includes(activeFilter));
  }, [accommodations, activeFilter]);

  const hotels = filtered.filter((a) => a.category === "hotel");
  const cottagesAndVillas = filtered.filter((a) => a.category !== "hotel");

  return (
    <section id="where-to-stay" className="mt-14 scroll-mt-24">
      <h2 className="text-xl font-semibold text-foreground">Where to Stay</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A curated selection of hotels, cottages, and villas on Saba.
      </p>

      {/* Filter chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {allFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Hotels */}
      {hotels.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Hotels</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hotels.map((accommodation) => (
              <AccommodationCard key={accommodation.name} accommodation={accommodation} />
            ))}
          </div>
        </div>
      )}

      {/* Cottages & Villas */}
      {cottagesAndVillas.length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Cottages & Villas</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cottagesAndVillas.map((accommodation) => (
              <AccommodationCard key={accommodation.name} accommodation={accommodation} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  return (
    <div className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm">
      <div className="mb-2">
        <Home className="h-4 w-4 text-muted-foreground/40" />
      </div>

      <h4 className="text-sm font-semibold text-foreground">{accommodation.name}</h4>

      <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>{accommodation.village}</span>
      </div>

      <p className="mt-2 flex-1 text-sm leading-snug text-muted-foreground">{accommodation.description}</p>

      {accommodation.features.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {accommodation.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              {feature}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={accommodation.website}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={"Visit " + accommodation.name + " website"}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        Visit Website
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
