"use client";

import { useState } from "react";
import { Anchor, Clock, AlertTriangle, Users, Fish, Waves } from "lucide-react";

type TimelineEntry =
  | { type: "step"; time: string; label: string; icon: React.ElementType }
  | { type: "callout"; title: string; description: string };

type Experience = {
  id: string;
  label: string;
  entries: TimelineEntry[];
};

const EXPERIENCES: Experience[] = [
  {
    id: "classic",
    label: "Classic 2-Tank",
    entries: [
      { type: "step", time: "10:00 AM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "10:30 AM", icon: Anchor, label: "Boat departs Fort Bay Harbor for two relaxed dives in Saba's Marine Park (~70 ft / 21 m)" },
      { type: "callout", title: "Bring Your Own Lunch", description: "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive. The trip runs through midday with no stop." },
      { type: "step", time: "2:30 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced 2-Tank",
    entries: [
      { type: "step", time: "8:30 AM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "9:00 AM", icon: Anchor, label: "Boat departs for two dives (Dive 1 to ~110 ft / 33 m, Dive 2 to ~70 ft / 21 m)" },
      { type: "callout", title: "Want a Third Dive?", description: "Ask about upgrading to our Triple Tank option for an extended day. If you add the third dive, consider bringing a lunch — the day will run past typical lunch hours and harbor food isn't reliable." },
      { type: "step", time: "1:00 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
  {
    id: "afternoon",
    label: "Afternoon 1-Tank",
    entries: [
      { type: "step", time: "12:30 PM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "1:00 PM", icon: Anchor, label: "Boat departs for a single dive to ~70 ft / 21 m" },
      { type: "step", time: "3:00 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
  {
    id: "snorkel",
    label: "Afternoon Snorkel",
    entries: [
      { type: "step", time: "12:30 PM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "1:00 PM", icon: Waves, label: "Boat departs; snorkel from the surface while divers explore below" },
      { type: "step", time: "3:00 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
  {
    id: "tryscuba",
    label: "Try Scuba",
    entries: [
      { type: "step", time: "8:30 AM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "9:00 AM", icon: Fish, label: "Theory and confined water session at Fort Bay Harbor" },
      { type: "step", time: "11:30 AM", icon: Clock, label: "Lunch break" },
      { type: "callout", title: "Bring Your Own Lunch", description: "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive." },
      { type: "step", time: "1:00 PM", icon: Anchor, label: "Joins the Afternoon boat for a supervised dive on the reef" },
      { type: "step", time: "3:00 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
];

export function ExperienceSelector() {
  const [selected, setSelected] = useState("classic");

  const experience = EXPERIENCES.find((e) => e.id === selected)!;
  const steps = experience.entries.filter((e) => e.type === "step") as Extract<TimelineEntry, { type: "step" }>[];

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground">What to Expect</h2>
      <p className="mt-1 text-sm text-muted-foreground">Select a dive option to see the day schedule.</p>

      {/* Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {EXPERIENCES.map((exp) => (
          <button
            key={exp.id}
            onClick={() => setSelected(exp.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selected === exp.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {exp.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-6 max-w-lg">
        <div className="space-y-0">
          {experience.entries.map((entry, i) => {
            if (entry.type === "callout") {
              return (
                <div key={i} className="ml-12 mb-4 flex items-start gap-3 rounded-lg border border-amber-200/60 bg-amber-50/60 px-4 py-3 dark:border-amber-700/40 dark:bg-amber-950/30">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{entry.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-700 dark:text-amber-400">{entry.description}</p>
                  </div>
                </div>
              );
            }

            const stepEntry = entry as Extract<TimelineEntry, { type: "step" }>;
            const Icon = stepEntry.icon;
            const stepIndex = steps.indexOf(stepEntry);
            const isLastStep = stepIndex === steps.length - 1;

            return (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {!isLastStep && <div className="w-px flex-1 bg-border/60 my-1 min-h-[1rem]" />}
                </div>
                <div className={!isLastStep ? "pb-4" : "pb-0"}>
                  <p className="text-xs font-semibold text-primary">{stepEntry.time}</p>
                  <p className="mt-0.5 text-sm text-foreground">{stepEntry.label}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs italic text-muted-foreground/70">
          Times are approximate and may vary depending on conditions.
        </p>
      </div>
    </section>
  );
}
