"use client";

import { useState, useMemo } from "react";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { MOCK_DIVES } from "@/data/dive-log-mock";
import type { PublicDive } from "@/data/dive-log-mock";
import { BookOpen, SlidersHorizontal, X, ChevronDown, ChevronUp, Download } from "lucide-react";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

const ALL_SITES = unique(MOCK_DIVES.map((d) => d.diveSite)).sort();
const ALL_BOATS = unique(MOCK_DIVES.map((d) => d.boat)).sort();
const ALL_GUIDES = unique(MOCK_DIVES.map((d) => d.diveGuide)).sort();
const ALL_SPECIES = unique(MOCK_DIVES.flatMap((d) => d.sightings.map((s) => s.speciesName))).sort();

const SLOT_LABELS: Record<string, string> = {
  "morning-1": "Morning (Dive 1)",
  "morning-2": "Morning (Dive 2)",
  "afternoon": "Afternoon",
  "night": "Night",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

interface Filters {
  site: string;
  boat: string;
  guide: string;
  species: string;
}

function DiveCard({
  dive,
  selected,
  onToggle,
}: {
  dive: PublicDive;
  selected: boolean;
  onToggle: () => void;
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
                {SLOT_LABELS[dive.diveSlot]}
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
              {dive.maxDepth && <span>Max depth: {dive.maxDepth} ft</span>}
              {dive.waterTemperature && <span>Water temp: {dive.waterTemperature}°F</span>}
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
  const [filters, setFilters] = useState<Filters>({ site: "", boat: "", guide: "", species: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredDives = useMemo(() => {
    return MOCK_DIVES.filter((d) => {
      if (filters.site && d.diveSite !== filters.site) return false;
      if (filters.boat && d.boat !== filters.boat) return false;
      if (filters.guide && d.diveGuide !== filters.guide) return false;
      if (filters.species && !d.sightings.some((s) => s.speciesName === filters.species)) return false;
      return true;
    });
  }, [filters]);

  const selectedDives = MOCK_DIVES.filter((d) => selectedIds.has(d.id));

  function toggleDive(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
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
        src="/images/optimized/divers-above-reef-saba.webp"
        alt="Divers exploring the reef in the Saba Marine Park"
        title="Sea Saba Dive Log"
        subtitle="Recent dives, sightings, and sites"
      />

      <p className="text-base leading-relaxed text-muted-foreground">
        See where Sea Saba has been diving recently, what our guides have spotted, and start building your own trip log from real Sea Saba dives.
      </p>

      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">

        {/* Left — filters + dive list */}
        <div className="min-w-0 flex-1">

          {/* Filter bar header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {filteredDives.length} dive{filteredDives.length !== 1 ? "s" : ""}
              {hasActiveFilters && " matching filters"}
            </h2>
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

          {/* Filter panel */}
          {filtersOpen && (
            <div className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField label="Dive Site" value={filters.site} options={ALL_SITES} onChange={(v) => setFilters((f) => ({ ...f, site: v }))} />
                <SelectField label="Boat" value={filters.boat} options={ALL_BOATS} onChange={(v) => setFilters((f) => ({ ...f, boat: v }))} />
                <SelectField label="Guide" value={filters.guide} options={ALL_GUIDES} onChange={(v) => setFilters((f) => ({ ...f, guide: v }))} />
                <SelectField label="Species Sighted" value={filters.species} options={ALL_SPECIES} onChange={(v) => setFilters((f) => ({ ...f, species: v }))} />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
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
            {filteredDives.length > 0 ? (
              filteredDives.map((dive) => (
                <DiveCard
                  key={dive.id}
                  dive={dive}
                  selected={selectedIds.has(dive.id)}
                  onToggle={() => toggleDive(dive.id)}
                />
              ))
            ) : (
              <div className="rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
                <p className="text-sm font-medium text-foreground">No dives match your filters.</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting or clearing your filters to see more results.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm font-medium text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
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
