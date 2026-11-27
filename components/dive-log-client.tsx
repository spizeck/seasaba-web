"use client";

import { Suspense, useState, useMemo, useEffect, useEffectEvent, useId, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { BubbleLoader } from "@/components/bubble-loader";
import { StatePanel } from "@/components/state-panel";
import { Button } from "@/components/ui/button";
import { SpeciesModal } from "@/components/species-modal";
import { findSpeciesInfo } from "@/data/species";
import type { SpeciesInfo } from "@/data/species";
import {
  fetchDiveLogData,
  buildPublicDives,
  formatDate,
  convertDepth,
  convertTemperature,
  depthUnit,
  temperatureUnit,
  type UnitSystem,
  type PublicDive,
} from "@/lib/firestore/dive-log";
import { trackEvent } from "@/lib/analytics";
import { loadDiveLogHistory, loadDiveLogSiteHistory } from "@/app/(en)/(content)/dive-log/actions";
import { diveLogRangeStartDate } from "@/lib/dive-log-dates";
import { parseDiveSlotMinutes } from "@/lib/firestore/dive-log";
import { BookOpen, SlidersHorizontal, X, ChevronDown, Download } from "lucide-react";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

// Firestore retries internally when the backend is unreachable, so a failed
// fetch can hang without ever rejecting. Cap the wait so visitors see the
// error state instead of a loading skeleton that never resolves.
const LOAD_TIMEOUT_MS = 15_000;

const LOAD_ERROR = "The dive log couldn't be loaded right now. Please try again.";

/**
 * Where the server-rendered list came from. With the public API
 * commissioned (issue #325) the browser never reads Firestore: the server
 * renders the default 14 days, wider ranges load on demand through a
 * server action, an empty array is a genuine empty result, and retry asks
 * the server to re-render (ISR) instead of fetching client-side.
 */
export type DiveLogSource = "firestore" | "api";

function useDiveLogData(initialDives: PublicDive[] | undefined, source: DiveLogSource) {
  const serverOnly = source === "api";
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  // An empty payload is ambiguous — Firestore can resolve an empty snapshot
  // when its backend is unreachable — so only a non-empty list counts.
  const hasInitial = Boolean(initialDives?.length);
  const [dives, setDives] = useState<PublicDive[]>(initialDives ?? []);
  const [loading, setLoading] = useState(!hasInitial);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // A refreshed server payload (RSC navigation) replaces the current list.
  // (Render-time adjustment — React re-renders before committing.)
  const [prevInitialDives, setPrevInitialDives] = useState(initialDives);
  if (initialDives !== prevInitialDives) {
    setPrevInitialDives(initialDives);
    if (initialDives?.length) {
      setDives(initialDives);
      setLoading(false);
      setError(null);
    }
  }

  useEffect(() => {
    // Server-rendered pages already carry the dive list — only fetch on a
    // manual retry, or when no initial payload was provided. Depending on
    // initialDives itself (not just presence) means a refreshed server
    // payload cancels an in-flight retry rather than racing it.
    if (serverOnly || (initialDives?.length && attempt === 0)) return;
    let cancelled = false;

    const timeout = setTimeout(() => {
      if (cancelled) return;
      setError("The dive log is taking longer than expected to load. Check your connection and try again.");
      setLoading(false);
    }, LOAD_TIMEOUT_MS);
    fetchDiveLogData()
      .then((data) => {
        if (cancelled) return;
        setDives(buildPublicDives(data));
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        // The real error is logged for diagnostics — visitors get a calm,
        // nontechnical message instead of a raw Firestore/network exception.
        console.error("Dive log failed to load", err);
        if (cancelled) return;
        setError(LOAD_ERROR);
        setLoading(false);
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [attempt, initialDives, serverOnly]);

  const [history, setHistory] = useState<{ range: DateRange; dives: PublicDive[] } | null>(null);
  // All-history chunks for individual sites, keyed by site name. They are
  // never a complete dataset, so they don't widen `loadedRange`.
  const [siteChunks, setSiteChunks] = useState<Record<string, PublicDive[]>>({});
  const [lastRequest, setLastRequest] = useState<{ type: "range"; range: DateRange } | { type: "site"; site: string }>({ type: "range", range: "14" });
  const [historyFailed, setHistoryFailed] = useState(false);
  const [loadingHistory, startHistory] = useTransition();
  const loadedRange: DateRange = serverOnly ? history?.range ?? "14" : "all";

  function loadRange(range: DateRange) {
    setLastRequest({ type: "range", range });
    setHistoryFailed(false);
    startHistory(async () => {
      try {
        const result = await loadDiveLogHistory(range);
        startHistory(() =>
          setHistory((h) => (h && coversRange(h.range, range) ? h : { range, dives: result.dives }))
        );
      } catch (err) {
        console.error("Dive log history failed to load", err);
        setHistoryFailed(true);
      }
    });
  }

  function loadSiteHistory(site: string) {
    setLastRequest({ type: "site", site });
    setHistoryFailed(false);
    startHistory(async () => {
      try {
        const result = await loadDiveLogSiteHistory(site);
        if (!result) {
          // Unknown site: only full history can confirm whether it has dives.
          loadRange("all");
          return;
        }
        startHistory(() =>
          setSiteChunks((prev) => (prev[site] ? prev : { ...prev, [site]: result.dives }))
        );
      } catch (err) {
        console.error("Dive log site history failed to load", err);
        setHistoryFailed(true);
      }
    });
  }

  /**
   * API mode: fetch whatever the (range, site) view needs. A range chunk
   * covers every site within it; a site chunk covers that site at any
   * range. For a site-filtered all-time view the site chunk is much
   * smaller than full history.
   */
  function ensureCoverage(range: DateRange, site?: string) {
    if (!serverOnly) return;
    const rangeOk = coversRange(loadedRange, range);
    const covered = site ? rangeOk || Boolean(siteChunks[site]) : rangeOk;
    if (covered) {
      if (historyFailed) setHistoryFailed(false);
      return;
    }
    if (loadingHistory) return;
    if (site && range === "all") loadSiteHistory(site);
    else loadRange(range);
  }

  // Union of every loaded chunk, deduplicated, in API order. Selections
  // survive widening because ids persist across chunks.
  const mergedDives = useMemo(() => {
    const byId = new Map<string, PublicDive>();
    for (const list of [initialDives ?? [], ...(history ? [history.dives] : []), ...Object.values(siteChunks)]) {
      for (const d of list) if (!byId.has(d.id)) byId.set(d.id, d);
    }
    return Array.from(byId.values()).sort(compareDives);
  }, [initialDives, history, siteChunks]);

  if (serverOnly) {
    return {
      dives: mergedDives,
      loading: refreshing || loadingHistory,
      error: historyFailed ? LOAD_ERROR : initialDives || history || refreshing ? null : LOAD_ERROR,
      retry: historyFailed
        ? () => (lastRequest.type === "site" ? loadSiteHistory(lastRequest.site) : loadRange(lastRequest.range))
        : () => startRefresh(() => router.refresh()),
      loadedRange,
      siteChunks,
      ensureCoverage,
    };
  }

  return {
    dives,
    loading,
    error,
    retry: () => {
      setLoading(true);
      setError(null);
      setAttempt((a) => a + 1);
    },
    loadedRange,
    siteChunks,
    ensureCoverage,
  };
}

type DateRange = "14" | "30" | "90" | "all";

const RANGE_ORDER: DateRange[] = ["14", "30", "90", "all"];

function coversRange(loaded: DateRange, wanted: DateRange): boolean {
  return RANGE_ORDER.indexOf(loaded) >= RANGE_ORDER.indexOf(wanted);
}

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

// Date-string comparison against an explicit reference instant — calling
// new Date() here would make SSR and hydration disagree around the cutoff.
function isWithinDateRange(dateStr: string, days: number, nowMs: number): boolean {
  return dateStr >= diveLogRangeStartDate(days, nowMs);
}

/** Same newest-first order the API returns: date, then dive slot, then id. */
function compareDives(a: PublicDive, b: PublicDive): number {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  const slotDiff = parseDiveSlotMinutes(b.diveSlot) - parseDiveSlotMinutes(a.diveSlot);
  if (slotDiff !== 0) return slotDiff;
  return b.id.localeCompare(a.id);
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
  const [activeSpecies, setActiveSpecies] = useState<SpeciesInfo | null>(null);

  const openSpecies = (name: string) => {
    const info = findSpeciesInfo(name);
    if (info) setActiveSpecies(info);
  };

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
            aria-label={selected ? `Added ✓. Remove ${dive.diveSite} from my dive log` : `+ Add ${dive.diveSite} to my dive log`}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium pressable focus-ring ${
              selected
                ? "border-primary bg-primary text-white hover:bg-primary/90"
                : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {selected ? "Added ✓" : "+ Add"}
          </button>
        </div>

        {/* Native disclosure: species names stay in the DOM for crawlers
            and no-JS visitors (the server-rendered list is crawlable, #108)
            — opening only reveals them visually. */}
        <details className="group mt-3">
          <summary className="flex list-none items-center gap-1 rounded-md text-xs text-muted-foreground cursor-pointer select-none pressable hover:text-foreground focus-ring [&::-webkit-details-marker]:hidden">
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
            {dive.sightings.length} species sighted
          </summary>
          <div className="-mx-4 -mb-4 mt-3 border-t border-border/40 px-4 py-3">
            <div className="flex flex-wrap gap-2">
            {dive.sightings.map((s) => {
              const hasInfo = Boolean(findSpeciesInfo(s.speciesName));
              const chip = (
                <>
                  {s.speciesName}
                  {s.count && s.count > 1 && (
                    <span className="ml-1 font-semibold text-foreground">×{s.count}</span>
                  )}
                </>
              );
              return hasInfo ? (
                <button
                  key={s.speciesName}
                  onClick={() => openSpecies(s.speciesName)}
                  className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground pressable hover:bg-primary/10 hover:text-primary focus-ring"
                >
                  {chip}
                </button>
              ) : (
                <span
                  key={s.speciesName}
                  className="inline-flex items-center rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground"
                >
                  {chip}
                </span>
              );
            })}
            </div>
          </div>
        </details>
      </div>

      {activeSpecies && (
        <SpeciesModal species={activeSpecies} onClose={() => setActiveSpecies(null)} />
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
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border/60 bg-background px-3 py-2 text-base text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 lg:text-sm"
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

/**
 * Reads `?site=` deep links (from dive-site guides) and reports the value
 * up. Kept tiny and inside Suspense so it bails out of static prerendering
 * alone — the dive list itself still server-renders.
 */
function DiveLogSearchParam({ onSite }: { onSite: (site: string | null) => void }) {
  const site = useSearchParams().get("site");
  useEffect(() => {
    onSite(site);
  }, [site, onSite]);
  return null;
}

export function DiveLogClient({
  initialDives,
  generatedAt,
  source = "firestore",
}: {
  initialDives?: PublicDive[];
  generatedAt?: number;
  source?: DiveLogSource;
}) {
  const { dives, loading, error, retry, loadedRange, siteChunks, ensureCoverage } = useDiveLogData(initialDives, source);
  // Date filtering must produce identical markup during SSR and hydration:
  // seed "now" from the serialized render timestamp, then adopt local time
  // post-mount (the effect schedules rather than setting synchronously).
  const [now, setNow] = useState(() => generatedAt ?? Date.now());
  useEffect(() => {
    if (generatedAt === undefined) return;
    const timer = setTimeout(() => setNow(Date.now()), 0);
    return () => clearTimeout(timer);
  }, [generatedAt]);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [dateRange, setDateRange] = useState<DateRange>("14");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({ site: "", boat: "", guide: "", species: "" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "exporting" | "error">("idle");
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

  // `?site=` deep links (from dive-site guides) pre-select the site
  // filter once a list exists. The param arrives after hydration via
  // DiveLogSearchParam — the server render stays static. Names matching
  // no logged dive are ignored; a changed param on client-side nav
  // re-applies. The range widens to all-time so older dives at the site
  // still appear. (Render-time adjustment, applied before commit.)
  const [siteParam, setSiteParam] = useState<string | null>(null);
  const [lastAppliedSiteParam, setLastAppliedSiteParam] = useState<string | null>(null);
  if (siteParam === null && lastAppliedSiteParam !== null) {
    // The deep link was removed — clear the filter only if it still holds
    // the auto-applied value; a manual site choice stays untouched.
    setFilters((f) => (f.site === lastAppliedSiteParam ? { ...f, site: "" } : f));
    setLastAppliedSiteParam(null);
  } else if (
    siteParam &&
    siteParam !== lastAppliedSiteParam &&
    dives.length > 0 &&
    (loadedRange === "all" || Boolean(siteChunks[siteParam]))
  ) {
    setLastAppliedSiteParam(siteParam);
    if (ALL_SITES.includes(siteParam)) {
      setFilters((f) => ({ ...f, site: siteParam }));
      setDateRange("all");
      setFiltersOpen(true);
      setCurrentPage(1);
    }
  }
  // In API mode the current view (and a deep link, which widens to
  // all-time for one site) loads whatever history it doesn't have yet.
  // `dives` in the deps re-checks coverage when a chunk lands.
  const loadCoverage = useEffectEvent((range: DateRange, site?: string) => ensureCoverage(range, site));
  useEffect(() => {
    if (siteParam) loadCoverage("all", siteParam);
    loadCoverage(dateRange, filters.site || undefined);
  }, [siteParam, dateRange, filters.site, dives]);

  const dateFilteredDives = useMemo(() => {
    if (dateRange === "all") return dives;
    const days = parseInt(dateRange, 10);
    return dives.filter((d) => isWithinDateRange(d.date, days, now));
  }, [dives, dateRange, now]);

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
  // A refreshed payload or filter change can shrink the list — clamp the
  // page so the visitor never lands past the last page.
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
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
      <Suspense fallback={null}>
        <DiveLogSearchParam onSite={setSiteParam} />
      </Suspense>
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
                  className={`rounded px-2 py-1 pressable focus-ring ${
                    unitSystem === "metric" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Metric units"
                  aria-pressed={unitSystem === "metric"}
                >
                  Metric
                </button>
                <button
                  onClick={() => setUnitSystem("imperial")}
                  className={`rounded px-2 py-1 pressable focus-ring ${
                    unitSystem === "imperial" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label="Imperial units"
                  aria-pressed={unitSystem === "imperial"}
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
                  className="rounded-md border border-border/60 bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
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
                aria-expanded={filtersOpen}
                aria-controls="dive-log-filters"
                className="inline-flex items-center gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground pressable hover:border-primary/40 hover:text-primary focus-ring"
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
            <div id="dive-log-filters" className="mt-3 rounded-lg border border-border/40 bg-muted/20 p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField label="Dive Site" value={filters.site} options={ALL_SITES} onChange={(v) => { setFilters((f) => ({ ...f, site: v })); resetPage(); }} />
                <SelectField label="Boat" value={filters.boat} options={ALL_BOATS} onChange={(v) => { setFilters((f) => ({ ...f, boat: v })); resetPage(); }} />
                <SelectField label="Guide" value={filters.guide} options={ALL_GUIDES} onChange={(v) => { setFilters((f) => ({ ...f, guide: v })); resetPage(); }} />
                <SelectField label="Species Sighted" value={filters.species} options={ALL_SPECIES} onChange={(v) => { setFilters((f) => ({ ...f, species: v })); resetPage(); }} />
              </div>
              {hasActiveFilters && (
                <button
                  onClick={() => { clearFilters(); resetPage(); }}
                  className="mt-4 flex items-center gap-1 rounded-md py-1.5 text-xs text-muted-foreground pressable hover:text-foreground focus-ring"
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
              <StatePanel
                role="status"
                leading={<BubbleLoader size="sm" className="mx-auto mb-2" />}
                title="Loading recent dives..."
              />
            ) : error ? (
              <StatePanel
                role="alert"
                title="Unable to load dive log"
                description={error}
              >
                <button
                  onClick={retry}
                  className="mt-4 rounded-md px-2 py-1 text-sm font-medium text-primary pressable hover:underline focus-ring"
                >
                  Try again
                </button>
              </StatePanel>
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
            ) : dives.length === 0 && loadedRange === "all" ? (
              <StatePanel
                role="status"
                title="No dives logged yet"
                description="Our guides add new dives after most trips. Check back soon. In the meantime, explore the sites we visit."
              >
                <Link
                  href="/dive-sites"
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Browse dive sites
                </Link>
              </StatePanel>
            ) : (
              <StatePanel
                role="status"
                title="No dives match your filters."
                description="Try adjusting the date range or clearing your filters to see more results."
              >
                <button
                  onClick={() => { clearFilters(); setDateRange("all"); resetPage(); }}
                  className="mt-4 rounded-md px-2 py-1 text-sm font-medium text-primary pressable hover:underline focus-ring"
                >
                  Clear filters and show all time
                </button>
              </StatePanel>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filteredDives.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground pressable hover:border-primary/40 hover:text-primary focus-ring disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-muted-foreground"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-md border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground pressable hover:border-primary/40 hover:text-primary focus-ring disabled:opacity-40 disabled:hover:border-border/60 disabled:hover:text-muted-foreground"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right — selected dives summary */}
        <div className="lg:w-72 lg:shrink-0">
          <div className="rounded-lg border border-border/60 bg-card p-5 lg:sticky lg:top-24">
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
                        className="-mx-1.5 -mb-1.5 -mt-1 shrink-0 rounded-md p-1.5 text-muted-foreground pressable hover:text-foreground focus-ring"
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
                    onClick={() => {
                      trackEvent("pdf_download", {
                        dive_count: selectedDives.length.toString(),
                        unit_system: unitSystem,
                      });
                      setExportState("exporting");
                      // jsPDF is ~300KB — loaded only when a visitor actually exports.
                      import("@/lib/dive-log-export")
                        .then((m) => m.exportDiveLogToPdf(selectedDives, unitSystem))
                        .then(() => setExportState("idle"))
                        .catch((err) => {
                          console.error("Dive log PDF export failed", err);
                          setExportState("error");
                        });
                    }}
                    disabled={exportState === "exporting"}
                    size="sm"
                    className="mt-3 w-full gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {exportState === "exporting" ? "Preparing PDF..." : "Export My Dive Log"}
                  </Button>
                  {exportState === "exporting" && (
                    <p role="status" className="sr-only">
                      Preparing your dive log PDF, please wait.
                    </p>
                  )}
                  {exportState === "error" && (
                    <p role="alert" className="mt-2 text-center text-xs text-destructive">
                      The PDF couldn&apos;t be created. Please try again.
                    </p>
                  )}
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="mt-3 w-full rounded-md py-1.5 text-center text-xs text-muted-foreground pressable hover:text-foreground focus-ring"
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
