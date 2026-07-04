"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import {
  fetchDiveLogData,
  normalizeDive,
  groupDivesForDisplay,
  formatDate,
  convertDepth,
  convertTemperature,
  depthUnit,
  temperatureUnit,
  type UnitSystem,
  type PublicDive,
} from "@/lib/firestore/dive-log";
import { BookOpen, SlidersHorizontal, X, ChevronDown, ChevronUp, Download } from "lucide-react";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function useDiveLogData() {
  const [dives, setDives] = useState<PublicDive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiveLogData()
      .then(({ dives, sites, species, boats }) => {
        const normalized = dives.map((d) => normalizeDive(d, sites, species, boats));
        const grouped = groupDivesForDisplay(normalized);
        grouped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setDives(grouped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dive log");
        setLoading(false);
      });
  }, []);

  return { dives, loading, error };
}

type DateRange = "14" | "30" | "90" | "all";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "14": "Past 14 days",
  "30": "Past 30 days",
  "90": "Past 90 days",
  "all": "All time",
};

interface Filters {
  site: string;
  boat: string;
  guide: string;
  species: string;
}

function isWithinDateRange(dateStr: string, days: number): boolean {
  const diveDate = new Date(dateStr + "T12:00:00");
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return diveDate >= cutoff;
}

function DiveCard({
  dive,
  selected,
  onToggle,
  unitSystem,
}: {
  dive: PublicDive;
  selected: boolean;
  onToggle: () => void;
  unitSystem: UnitSystem;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-lg border bg-card transition-colors ${
        selected ? "border-primary/60 ring-1 ring-primary/20" : "border-border/60"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                {formatDate(dive.date)}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {dive.diveSlot}
              </span>
              {dive.driftDive && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Drift
                </span>
              )}
            </div>
            <h3 className="mt-1 text-base font-semibold text-foreground">{dive.diveSite}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              <span>{dive.boat}</span>
              <span>Guide: {dive.diveGuide}</span>
              {dive.maxDepth !== undefined && (
                <span>
                  Max depth: {convertDepth(dive.maxDepth, unitSystem)} {depthUnit(unitSystem)}
                </span>
              )}
              {dive.waterTemperature !== undefined && (
                <span>
                  Water temp: {convertTemperature(dive.waterTemperature, unitSystem)}
                  {temperatureUnit(unitSystem)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onToggle}
            aria-label={selected ? `Remove ${dive.diveSite} from my dive log` : `Add ${dive.diveSite} to my dive log`}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              selected
                ? "border-primary bg-primary text-white hover:bg-primary/90"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {selected ? "Added ✓" : "+ Add"}
          </button>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {expanded ? "Hide sightings" : `${dive.sightings.length} species sighted`}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {dive.sightings.map((s) => (
              <span
                key={s.speciesName}
                className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
              >
                {s.speciesName}
                {s.count && s.count > 1 && (
                  <span className="ml-1 font-semibold text-foreground">×{s.count}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DiveLogClient() {
  const { dives, loading, error } = useDiveLogData();
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [dateRange, setDateRange] = useState<DateRange>("14");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ site: "", boat: "", guide: "", species: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const PAGE_SIZE = 20;

  const ALL_SITES = useMemo(() => unique(dives.map((d) => d.diveSite)).sort(), [dives]);
  const ALL_BOATS = useMemo(() => unique(dives.map((d) => d.boat)).sort(), [dives]);
  const ALL_GUIDES = useMemo(
    () => unique(dives.flatMap((d) => d.diveGuides ?? [])).sort(),
    [dives]
  );
  const ALL_SPECIES = useMemo(
    () => unique(dives.flatMap((d) => d.sightings.map((s) => s.speciesName))).sort(),
    [dives]
  );

  const dateFilteredDives = useMemo(() => {
    if (dateRange === "all") return dives;
    const days = parseInt(dateRange, 10);
    return dives.filter((d) => isWithinDateRange(d.date, days));
  }, [dives, dateRange]);

  const filteredDives = useMemo(() => {
    return dateFilteredDives.filter((d) => {
      if (filters.site && d.diveSite !== filters.site) return false;
      if (filters.boat && d.boat !== filters.boat) return false;
      if (filters.guide && !(d.diveGuides ?? []).includes(filters.guide)) return false;
      if (filters.species && !d.sightings.some((s) => s.speciesName === filters.species)) return false;
      return true;
    });
  }, [dateFilteredDives, filters]);

  const totalPages = Math.ceil(filteredDives.length / PAGE_SIZE) || 1;
  const paginatedDives = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredDives.slice(start, start + PAGE_SIZE);
  }, [filteredDives, currentPage]);

  const selectedDives = useMemo(() => dives.filter((d) => selectedIds.has(d.id)), [dives, selectedIds]);

  function resetPage() {
    setCurrentPage(1);
  }

  function toggleDive(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearFilters() {
    setFilters({ site: "", boat: "", guide: "", species: "" });
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <PageHero
        src="/images/optimized/two-divers-above-reef-saba.webp"
        alt="Two divers above the reef in the Saba Marine Park"
        title="Sea Saba Dive Log"
        subtitle="Recent dives, sightings, and sites"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        See where Sea Saba has been diving recently, what our guides have spotted, and start building your own trip log from real Sea Saba dives.
      </p>

      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Left — filters + dive list */}
        <div className="min-w-0 flex-1">
          {/* Unit system + date range + filter bar header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              {loading ? "Loading dives..." : `${filteredDives.length} dive${filteredDives.length !== 1 ? "s" : ""}`}
              {hasActiveFilters && !loading && " matching filters"}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-md border border-border/60 p-0.5 text-xs">
                <button
                  onClick={() => setUnitSystem("metric")}
                  className={`rounded px-2 py-1 transition-colors ${
                    unitSystem === "metric" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Metric units"
                >
                  Metric
                </button>
                <button
                  onClick={() => setUnitSystem("imperial")}
                  className={`rounded px-2 py-1 transition-colors ${
                    unitSystem === "imperial" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Imperial units"
                >
                  Imperial
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <label htmlFor="date-range" className="text-xs text-muted-foreground">
                  Date range
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value as DateRange);
                    resetPage();
                  }}
                  className="rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((key) => (
                    <option key={key} value={key}>
                      {DATE_RANGE_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                {filtersOpen ? "Hide Filters" : "Filter"}
                {hasActiveFilters && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField label="Dive Site" value={filters.site} options={ALL_SITES} onChange={(v) => { setFilters((f) => ({ ...f, site: v })); resetPage(); }} />
                <SelectField label="Boat" value={filters.boat} options={ALL_BOATS} onChange={(v) => { setFilters((f) => ({ ...f, boat: v })); resetPage(); }} />
                <SelectField label="Guide" value={filters.guide} options={ALL_GUIDES} onChange={(v) => { setFilters((f) => ({ ...f, guide: v })); resetPage(); }} />
                <SelectField label="Species Sighted" value={filters.species} options={ALL_SPECIES} onChange={(v) => { setFilters((f) => ({ ...f, species: v })); resetPage(); }} />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); resetPage(); }}
                  className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Dive list */}
          <div className="mt-4 flex flex-col gap-3">
            {loading ? (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
                <p className="text-sm font-medium text-foreground">Loading recent dives...</p>
              </div>
            ) : error ? (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
                <p className="text-sm font-medium text-foreground">Unable to load dive log</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            ) : paginatedDives.length > 0 ? (
              paginatedDives.map((dive) => (
                <DiveCard
                  key={dive.id}
                  dive={dive}
                  selected={selectedIds.has(dive.id)}
                  onToggle={() => toggleDive(dive.id)}
                  unitSystem={unitSystem}
                />
              ))
            ) : (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
                <p className="text-sm font-medium text-foreground">No dives match your filters.</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting the date range or clearing your filters to see more results.</p>
                <button
                  onClick={() => { clearFilters(); setDateRange("all"); resetPage(); }}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Clear filters and show all time
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredDives.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-muted-foreground"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-muted-foreground"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right — selected dives summary */}
        <div className="lg:w-72 lg:shrink-0">
          <div className="sticky top-24 rounded-lg border border-border/60 bg-card p-5">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">My Dive Log</h2>
            </div>

            {selectedDives.length === 0 ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Click <strong>+ Add</strong> on any dive to add it to your personal log.
              </p>
            ) : (
              <>
                <div className="mt-3 flex flex-col gap-2">
                  {selectedDives.map((d) => (
                    <div key={d.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-foreground">{d.diveSite}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(d.date)}</p>
                      </div>
                      <button
                        onClick={() => toggleDive(d.id)}
                        aria-label={`Remove ${d.diveSite}`}
                        className="mt-0.5 shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-border/40 pt-4">
                  <p className="text-xs text-muted-foreground">
                    {selectedDives.length} dive{selectedDives.length !== 1 ? "s" : ""} selected
                  </p>
                  <Button
                    disabled
                    size="sm"
                    className="mt-3 w-full gap-1.5 opacity-50"
                    title="Export coming soon"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export My Dive Log
                  </Button>
                  <p className="mt-1.5 text-center text-xs text-muted-foreground/60">Coming soon</p>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
