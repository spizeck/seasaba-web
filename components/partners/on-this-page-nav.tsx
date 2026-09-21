"use client";

import { PageSectionNav } from "@/components/navigation/PageSectionNav";
import { partnersAnchors } from "@/lib/anchors";

const SECTIONS = [
  { id: partnersAnchors.whereToStay, label: "Where to Stay" },
  { id: partnersAnchors.restaurants, label: "Restaurants" },
  { id: partnersAnchors.transportation, label: "Transportation" },
  { id: partnersAnchors.divePartners, label: "Dive Partners" },
  { id: partnersAnchors.trainingAgencies, label: "Training Agencies" },
  { id: partnersAnchors.equipmentPartners, label: "Equipment Partners" },
  { id: partnersAnchors.conservationPartners, label: "Conservation" },
];

export function OnThisPageNav() {
  return <PageSectionNav items={SECTIONS} offset={0} />;
}
