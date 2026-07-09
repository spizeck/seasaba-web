"use client";

import { PageSectionNav } from "@/components/navigation/PageSectionNav";

const SECTIONS = [
  { id: "where-to-stay", label: "Where to Stay" },
  { id: "restaurants", label: "Restaurants" },
  { id: "transportation", label: "Transportation" },
  { id: "dive-partners", label: "Dive Partners" },
  { id: "training-agencies", label: "Training Agencies" },
  { id: "equipment-partners", label: "Equipment Partners" },
  { id: "conservation-partners", label: "Conservation" },
];

export function OnThisPageNav() {
  return <PageSectionNav items={SECTIONS} offset={0} />;
}
