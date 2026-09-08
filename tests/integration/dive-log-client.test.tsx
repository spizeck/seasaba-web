import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiveLogClient } from "@/components/dive-log-client";
import { fetchDiveLogData } from "@/lib/firestore/dive-log";
import { exportDiveLogToPdf } from "@/lib/dive-log-export";
import { diveData, rawDive } from "../fixtures/dives";
vi.mock("@/lib/firestore/dive-log", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/firestore/dive-log")>(), fetchDiveLogData: vi.fn() }));
vi.mock("@/lib/dive-log-export", () => ({ exportDiveLogToPdf: vi.fn().mockResolvedValue(undefined) }));
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
  const today = new Date().toISOString().slice(0, 10);
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData([rawDive({ date: today }), rawDive({ id: "second", date: today, diveSiteId: "site-2", diveGuides: ["Sam"], diveSlot: "1 pm" }), rawDive({ id: "old", date: "2000-01-01", diveSlot: "9 am" })]));
});
it("loads recent dives, filters by guide, changes units, selects and exports only selected dives", async () => {
  render(<DiveLogClient />);
  expect(screen.getByText("Loading recent dives...")).toBeVisible();
  await screen.findByRole("heading", { name: "2 dives" });
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Diamond Rock", "Tent Reef"]);
  await userEvent.click(screen.getByRole("button", { name: "Filter" }));
  await userEvent.selectOptions(screen.getByLabelText("Guide"), "Alex");
  expect(screen.getByRole("heading", { name: "1 dive matching filters" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Imperial units" }));
  expect(screen.getByText("Max depth: 69 ft")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Add Tent Reef to my dive log" }));
  await userEvent.click(screen.getByRole("button", { name: "Export My Dive Log" }));
  expect(exportDiveLogToPdf).toHaveBeenCalledWith([expect.objectContaining({ diveSite: "Tent Reef" })], "imperial");
  await userEvent.click(screen.getByRole("button", { name: "Remove Tent Reef" }));
  expect(screen.queryByRole("button", { name: "Export My Dive Log" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "all");
  expect(screen.getByRole("heading", { name: "3 dives" })).toBeVisible();
});
it("combines filters, recovers from no matches, expands sightings and clears selection", async () => {
  render(<DiveLogClient />);
  await screen.findByRole("heading", { name: "2 dives" });
  await userEvent.click(screen.getByRole("button", { name: "Filter" }));
  await userEvent.selectOptions(screen.getByLabelText("Dive Site"), "Tent Reef");
  await userEvent.selectOptions(screen.getByLabelText("Boat"), "Test Boat");
  await userEvent.selectOptions(screen.getByLabelText("Species Sighted"), "Green Turtle");
  await userEvent.click(screen.getByRole("button", { name: "1 species sighted" }));
  expect(screen.getByRole("button", { name: "Hide sightings" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Add Tent Reef to my dive log" }));
  await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  await userEvent.selectOptions(screen.getByLabelText("Guide"), "Sam");
  expect(screen.getByText("No dives match your filters.")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Clear filters and show all time" }));
  expect(screen.getByRole("heading", { name: "3 dives" })).toBeVisible();
});
it("paginates without losing selection and resets the page when filters change", async () => {
  const today = new Date().toISOString().slice(0, 10);
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData(Array.from({ length: 21 }, (_, i) => rawDive({ id: `d-${i}`, date: today, boatId: `boat-${i}` }))));
  render(<DiveLogClient />);
  await screen.findByText("Page 1 of 2");
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  await userEvent.click(screen.getAllByRole("button", { name: "Add Tent Reef to my dive log" })[0]);
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  expect(screen.getByText("1 dive selected")).toBeVisible();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Previous" }));
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "all");
  expect(screen.getByText("Page 1 of 2")).toBeVisible();
});
it("shows permission failure without exposing an export action", async () => {
  vi.mocked(fetchDiveLogData).mockRejectedValue(new Error("Missing or insufficient permissions"));
  render(<DiveLogClient />);
  await screen.findByText("Unable to load dive log");
  expect(screen.queryByRole("button", { name: "Export My Dive Log" })).not.toBeInTheDocument();
});
it("handles an empty collection", async () => {
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData([]));
  render(<DiveLogClient />);
  await waitFor(() => expect(screen.getByText("No dives match your filters.")).toBeVisible());
});

