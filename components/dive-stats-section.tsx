import Link from "next/link";
import { Thermometer, MapPin, Turtle } from "lucide-react";
import { celsiusToFahrenheit, type WeeklyDiveStats } from "@/lib/dive-stats";

// Lucide has no shark icon — this is a minimal dorsal-fin-and-waterline mark
// drawn in the same style (24x24, 2px stroke, round caps) so the set stays
// visually consistent.
function SharkFin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6.5 15c.5-3.5 2-7 5.5-9.5 3 2 4.5 5.5 5 9.5" />
      <path d="M2 18.5c2 1 4 1 6 0 2 1 4 1 6 0 2 1 4 1 6 0" />
    </svg>
  );
}

function formatWindow(start: string, end: string): string {
  const startDate = new Date(start + "T12:00:00Z");
  const endDate = new Date(end + "T12:00:00Z");
  const monthDay = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const year = endDate.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" });
  return `${monthDay(startDate)} – ${monthDay(endDate)}, ${year}`;
}

interface Metric {
  icon: React.ReactNode;
  value: string;
  unit?: string;
  label: string;
}

/**
 * Rolling seven-day observations from the dive team (issue #311). Purely
 * presentational and server-rendered — the numbers are in the initial HTML
 * for visitors and crawlers alike. `stats` is always real, deduplicated
 * production data; the caller hides the section entirely when no dives were
 * recorded in the window.
 */
export function DiveStatsSection({ stats }: { stats: WeeklyDiveStats }) {
  const metrics: Metric[] = [];

  if (stats.avgTempCelsius !== null) {
    metrics.push({
      icon: <Thermometer className="size-5 text-primary" aria-hidden="true" />,
      value: `${Math.round(celsiusToFahrenheit(stats.avgTempCelsius))}°F`,
      unit: `/ ${Math.round(stats.avgTempCelsius)}°C`,
      label: "Average water temperature",
    });
  }

  metrics.push(
    {
      icon: <MapPin className="size-5 text-primary" aria-hidden="true" />,
      value: String(stats.diveSitesVisited),
      label: stats.diveSitesVisited === 1 ? "Dive site visited" : "Dive sites visited",
    },
    {
      icon: <Turtle className="size-5 text-primary" aria-hidden="true" />,
      value: String(stats.turtleSightings),
      label: stats.turtleSightings === 1 ? "Turtle sighting" : "Turtle sightings",
    },
    {
      icon: <SharkFin className="size-5 text-primary" />,
      value: String(stats.sharkSightings),
      label: stats.sharkSightings === 1 ? "Shark sighting" : "Shark sightings",
    }
  );

  return (
    <section aria-labelledby="dive-stats-heading" className="bg-muted/30 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Straight from our dive team
          </p>
          <h2 id="dive-stats-heading" className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            This Week Beneath the Surface.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Real observations recorded by our dive team during the past seven
            days of diving in Saba — {formatWindow(stats.windowStart, stats.windowEnd)}.
          </p>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border border-border/40 bg-card p-5">
              <div className="flex items-center gap-2">
                {metric.icon}
                <dt className="text-sm font-medium text-muted-foreground">{metric.label}</dt>
              </div>
              <dd className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {metric.value}
                {metric.unit && (
                  <span className="ml-1 text-lg font-normal text-muted-foreground">{metric.unit}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
            Counts are sightings recorded by our guides on dives with logged
            activity — not every animal encountered. Statistics refresh hourly
            from the same log linked below.
          </p>
          <Link
            href="/dive-log"
            className="shrink-0 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Explore Our Dive Log →
          </Link>
        </div>
      </div>
    </section>
  );
}
