"use client";

import { useState } from "react";
import { Anchor, Clock, Users, Fish, Waves } from "lucide-react";

type TimelineEntry =
  | { type: "step"; time: string; label: string; icon: React.ElementType }
  | { type: "callout"; variant: "warning" | "info"; title: string; description: string };

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
      { type: "callout", variant: "warning", title: "Bring Your Own Lunch", description: "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive. The trip runs through midday with no stop." },
      { type: "step", time: "3:00 PM", icon: Clock, label: "Return to Fort Bay Harbor" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced 2-Tank",
    entries: [
      { type: "step", time: "8:30 AM", icon: Users, label: "Taxi pickup" },
      { type: "step", time: "9:00 AM", icon: Anchor, label: "Boat departs for two dives (Dive 1 to ~110 ft / 33 m, Dive 2 to ~70 ft / 21 m)" },
      { type: "callout", variant: "info", title: "Want a Third Dive?", description: "Ask about upgrading to our Triple Tank option for an extended day. If you add the third dive, consider bringing a lunch — the day will run past typical lunch hours and harbor food isn't reliable." },
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
      { type: "callout", variant: "warning", title: "Bring Your Own Lunch", description: "Lunch availability in Fort Bay Harbor isn't reliable, so pack something before you arrive." },
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
        {/* Continuous vertical line behind all items — from top of first icon to top of last icon */}
        <div className="relative">
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border/60" />
          <div className="space-y-0">
            {experience.entries.map((entry, i) => {
              if (entry.type === "callout") {
                const isWarning = entry.variant === "warning";
                return (
                  <div key={i} className={`relative ml-12 mb-3 mt-1 rounded-lg px-4 py-3 ${
                    isWarning ? "bg-destructive" : "bg-primary"
                  }`}>
                    <p className="font-sans text-xs font-bold text-white">{entry.title}</p>
                    <p className="mt-0.5 font-sans text-xs font-medium leading-relaxed text-white/90">{entry.description}</p>
                  </div>
                );
              }

              const stepEntry = entry as Extract<TimelineEntry, { type: "step" }>;
              const Icon = stepEntry.icon;
              const stepIndex = steps.indexOf(stepEntry);
              const isLastStep = stepIndex === steps.length - 1;

              return (
                <div key={i} className={`relative flex gap-4 ${!isLastStep ? "pb-4" : "pb-0"}`}>
                  {/* Icon sits above the line via z-index and opaque background */}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-border/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-primary">{stepEntry.time}</p>
                    <p className="mt-0.5 text-sm text-foreground">{stepEntry.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="mt-4 text-xs italic text-muted-foreground/70">
          Times are approximate and may vary depending on conditions.
        </p>
      </div>
    </section>
  );
}
