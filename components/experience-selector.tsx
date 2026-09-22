"use client";

import { useState } from "react";
import { Anchor, Clock, Users, Fish, Waves } from "lucide-react";
import { DIVE_PRODUCTS, OPERATIONS } from "@/data/operations";
import { uiFor } from "@/content/ui";
import { DEFAULT_LOCALE, type Locale } from "@/lib/locale";

type TimelineEntry =
  | { type: "step"; time: string; label: string; icon: React.ElementType }
  | { type: "callout"; variant: "warning" | "info"; title: string; description: string };

type Experience = {
  id: string;
  label: string;
  entries: TimelineEntry[];
};

function buildExperiences(locale: Locale): Experience[] {
  const ui = uiFor(locale).experienceSelector;
  const harbor = OPERATIONS.harbor;
  const ret = `${ui.steps.returnTo}`.replace("{harbor}", harbor);
  const taxi = ui.taxiPickup;
  return [
    {
      id: "classic",
      label: ui.pills.classic,
      entries: [
        { type: "step", time: DIVE_PRODUCTS.classic.schedule.taxiPickup, icon: Users, label: taxi },
        { type: "step", time: DIVE_PRODUCTS.classic.schedule.departure, icon: Anchor, label: ui.steps.classicDeparture.replace("{harbor}", harbor) },
        { type: "callout", variant: "warning", title: ui.bringLunchTitle, description: ui.bringLunchClassic },
        { type: "step", time: DIVE_PRODUCTS.classic.schedule.returns, icon: Clock, label: ret },
      ],
    },
    {
      id: "advanced",
      label: ui.pills.advanced,
      entries: [
        { type: "step", time: DIVE_PRODUCTS.advanced.schedule.taxiPickup, icon: Users, label: taxi },
        { type: "step", time: DIVE_PRODUCTS.advanced.schedule.departure, icon: Anchor, label: ui.steps.advancedDeparture.replace("{harbor}", harbor) },
        { type: "callout", variant: "info", title: ui.thirdDiveTitle, description: ui.thirdDiveBody },
        { type: "step", time: DIVE_PRODUCTS.advanced.schedule.returns, icon: Clock, label: ret },
      ],
    },
    {
      id: "afternoon",
      label: ui.pills.afternoon,
      entries: [
        { type: "step", time: DIVE_PRODUCTS.afternoon.schedule.taxiPickup, icon: Users, label: taxi },
        { type: "step", time: DIVE_PRODUCTS.afternoon.schedule.departure, icon: Anchor, label: ui.steps.afternoonDeparture.replace("{harbor}", harbor) },
        { type: "step", time: DIVE_PRODUCTS.afternoon.schedule.returns, icon: Clock, label: ret },
      ],
    },
    {
      id: "snorkel",
      label: ui.pills.snorkel,
      entries: [
        { type: "step", time: DIVE_PRODUCTS.snorkel.schedule.taxiPickup, icon: Users, label: taxi },
        { type: "step", time: DIVE_PRODUCTS.snorkel.schedule.departure, icon: Waves, label: ui.steps.snorkelDeparture.replace("{harbor}", harbor) },
        { type: "step", time: DIVE_PRODUCTS.snorkel.schedule.returns, icon: Clock, label: ret },
      ],
    },
    {
      id: "tryscuba",
      label: ui.pills.tryscuba,
      entries: [
        { type: "step", time: "8:30 AM", icon: Users, label: taxi },
        { type: "step", time: "9:00 AM", icon: Fish, label: ui.steps.tryScubaTheory.replace("{harbor}", harbor) },
        { type: "step", time: "11:30 AM", icon: Clock, label: ui.lunchBreak },
        { type: "callout", variant: "warning", title: ui.bringLunchTitle, description: ui.bringLunchTryScuba },
        { type: "step", time: DIVE_PRODUCTS.afternoon.schedule.departure, icon: Anchor, label: ui.steps.tryScubaDive },
        { type: "step", time: DIVE_PRODUCTS.afternoon.schedule.returns, icon: Clock, label: ret },
      ],
    },
  ];
}

export function ExperienceSelector({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const [selected, setSelected] = useState("classic");
  const ui = uiFor(locale).experienceSelector;
  const experiences = buildExperiences(locale);

  const experience = experiences.find((e) => e.id === selected)!;
  const steps = experience.entries.filter((e) => e.type === "step") as Extract<TimelineEntry, { type: "step" }>[];

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-foreground">{ui.heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{ui.subtext}</p>

      {/* Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {experiences.map((exp) => (
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
        <p className="mt-4 text-xs italic text-muted-foreground">
          {ui.footnote}
        </p>
      </div>
    </section>
  );
}
