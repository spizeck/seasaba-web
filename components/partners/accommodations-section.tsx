"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ExternalLink, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackLinkClick } from "@/lib/analytics";
import type { Accommodation, AccommodationType } from "@/data/partners";

interface AccommodationsSectionProps {
  accommodations: Accommodation[];
}

const TYPE_ORDER: AccommodationType[] = ["hotel", "cottage", "villa"];

const POPULAR_FEATURES = [
  "pool",
  "ocean-view",
  "mountain-view",
  "walk-to-village",
  "full-kitchen",
  "historic",
  "luxury",
] as const;

const FILTER_LABELS: Record<string, string> = {
  hotel: "Hotels",
  cottage: "Cottages",
  villa: "Villas",
  pool: "Pool",
  "ocean-view": "Ocean View",
  "mountain-view": "Mountain View",
  "walk-to-village": "Walk to Village",
  "full-kitchen": "Full Kitchen",
  historic: "Historic",
  luxury: "Luxury",
};

function villageKey(village: string) {
  return village.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function villageLabel(key: string) {
  if (key === "st-john-s") return "St Johns";
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function filterLabel(key: string) {
  return FILTER_LABELS[key] || villageLabel(key);
}

export function AccommodationsSection({ accommodations }: AccommodationsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialFilters = searchParams.get("filters")?.split(",").filter(Boolean) ?? [];
  const initialSearch = searchParams.get("search") ?? "";

  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(initialFilters));
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const urlSyncReady = useRef(false);

  // Sync URL with active filters and search query.
  useEffect(() => {
    if (!urlSyncReady.current) {
      urlSyncReady.current = true;
      return;
    }
    const params = new URLSearchParams();
    const filtersArray = Array.from(activeFilters);
    if (filtersArray.length > 0) {
      params.set("filters", filtersArray.join(","));
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  }, [activeFilters, searchQuery, pathname, router]);

  const availableLocations = useMemo(
    () => Array.from(new Set(accommodations.map((a) => villageKey(a.village)))).sort(),
    [accommodations]
  );

  const availableFeatures = useMemo(() => {
    const present = new Set<string>();
    accommodations.forEach((a) => a.filters.forEach((f) => present.add(f)));
    return POPULAR_FEATURES.filter((f) => present.has(f));
  }, [accommodations]);

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const clearAll = () => {
    setActiveFilters(new Set());
    setSearchQuery("");
  };

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtersArray = Array.from(activeFilters);
    const typeFilters = filtersArray.filter((k) => TYPE_ORDER.includes(k as AccommodationType));
    const locationFilters = filtersArray.filter((k) => availableLocations.includes(k));
    const featureFilters = filtersArray.filter((k) => POPULAR_FEATURES.includes(k as typeof POPULAR_FEATURES[number]));

    return accommodations.filter((a) => {
      if (query) {
        const matchesName = a.name.toLowerCase().includes(query);
        const matchesVillage = a.village.toLowerCase().includes(query);
        const matchesType = a.type.toLowerCase().includes(query);
        if (!matchesName && !matchesVillage && !matchesType) return false;
      }
      if (typeFilters.length > 0 && !typeFilters.includes(a.type)) return false;
      if (locationFilters.length > 0 && !locationFilters.includes(villageKey(a.village))) return false;
      if (featureFilters.length > 0 && !featureFilters.every((f) => a.filters.includes(f))) return false;
      return true;
    });
  }, [accommodations, activeFilters, searchQuery, availableLocations]);

  const hotels = filtered.filter((a) => a.type === "hotel");
  const cottagesAndVillas = filtered.filter((a) => a.type !== "hotel");
  const hasActiveFilters = activeFilters.size > 0 || searchQuery.trim().length > 0;

  return (
    <section id="where-to-stay" className="mt-14 scroll-mt-32">
      <h2 className="text-xl font-semibold text-foreground">Where to Stay</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        A curated selection of hotels, cottages, and villas on Saba.
      </p>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search accommodations..."
          className="w-full rounded-md border border-border/60 bg-background py-2 pl-9 pr-9 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter groups */}
      <div className="mt-6 flex flex-col gap-5">
        <FilterGroup
          title="Accommodation Type"
          options={TYPE_ORDER}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
        />
        <FilterGroup
          title="Location"
          options={availableLocations}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
        />
        <FilterGroup
          title="Popular Features"
          options={availableFeatures}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
        />
      </div>

      {/* Active filters + clear */}
      {hasActiveFilters && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {Array.from(activeFilters).map((key) => (
            <button
              key={key}
              onClick={() => clearFilter(key)}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              {filterLabel(key)}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <button
            onClick={clearAll}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results header */}
      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {filtered.length} accommodation{filtered.length !== 1 ? "s" : ""}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear All
          </button>
        )}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="mt-6 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No accommodations match your filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">Try clearing a filter or searching for a different term.</p>
          <button
            onClick={clearAll}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Hotels */}
      {hotels.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Hotels</h4>
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
          <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">Cottages & Villas</h4>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cottagesAndVillas.map((accommodation) => (
              <AccommodationCard key={accommodation.name} accommodation={accommodation} />
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes accommodationIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

function FilterGroup({
  title,
  options,
  activeFilters,
  onToggle,
}: {
  title: string;
  options: readonly string[];
  activeFilters: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((key) => (
          <button
            key={key}
            onClick={() => onToggle(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilters.has(key)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
            )}
          >
            {filterLabel(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  return (
    <div
      className="group flex flex-col rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
      style={{ animation: "accommodationIn 0.25s ease-out both" }}
    >
      <div className="flex flex-1 flex-col">
        <h4 className="text-sm font-semibold text-foreground">{accommodation.name}</h4>

        <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          {accommodation.village}
        </span>

        <div className="mt-auto pt-4">
          <Link
            href={accommodation.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLinkClick("social_click", accommodation.website, `Visit ${accommodation.name}`)}
            aria-label={`Visit ${accommodation.name} website, opens in a new tab`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Visit Website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
