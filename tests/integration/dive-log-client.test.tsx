import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DiveLogClient } from "@/components/dive-log-client";
import { buildPublicDives, fetchDiveLogData, formatDate } from "@/lib/firestore/dive-log";
import { exportDiveLogToPdf } from "@/lib/dive-log-export";
import { loadDiveLogHistory, loadDiveLogSiteHistory } from "@/app/(en)/(content)/dive-log/actions";
import { diveData, rawDive } from "../fixtures/dives";
vi.mock("@/lib/firestore/dive-log", async (importOriginal) => ({ ...await importOriginal<typeof import("@/lib/firestore/dive-log")>(), fetchDiveLogData: vi.fn() }));
vi.mock("@/app/(en)/(content)/dive-log/actions", () => ({ loadDiveLogHistory: vi.fn(), loadDiveLogSiteHistory: vi.fn() }));
vi.mock("@/lib/dive-log-export", () => ({ exportDiveLogToPdf: vi.fn().mockResolvedValue(undefined) }));
const nav = vi.hoisted(() => ({ params: new URLSearchParams(), refresh: vi.fn() }));
vi.mock("next/navigation", async (importOriginal) => ({ ...await importOriginal<typeof import("next/navigation")>(), useSearchParams: () => nav.params, useRouter: () => ({ refresh: nav.refresh }) }));
beforeEach(() => {
  nav.params = new URLSearchParams();
  nav.refresh.mockReset();
  vi.mocked(fetchDiveLogData).mockClear();
  vi.mocked(loadDiveLogHistory).mockReset();
  vi.mocked(loadDiveLogSiteHistory).mockReset();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
  const today = new Date().toISOString().slice(0, 10);
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData([rawDive({ date: today }), rawDive({ id: "second", date: today, diveSiteId: "site-2", diveGuides: ["Sam"], diveSlot: "1 pm" }), rawDive({ id: "old", date: "2000-01-01", diveSlot: "9 am" })]));
});
it("loads recent dives, filters by guide, changes units, selects and exports only selected dives", async () => {
  render(<DiveLogClient />);
  expect(screen.getByText("Loading recent dives...")).toBeVisible();
  // The branded bubble treatment accompanies the text while loading.
  expect(screen.getByRole("status").querySelector(".animate-bubble-rise")).toBeTruthy();
  await screen.findByRole("heading", { name: "2 dives" });
  expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(["Diamond Rock", "Tent Reef"]);
  await userEvent.click(screen.getByRole("button", { name: "Filter" }));
  await userEvent.selectOptions(screen.getByLabelText("Guide"), "Alex");
  expect(screen.getByRole("heading", { name: "1 dive matching filters" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Imperial units" }));
  expect(screen.getByText("Max depth: 69 ft")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "+ Add Tent Reef to my dive log" }));
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
  // Sightings live in a native <details> — the species name is in the DOM
  // for crawlers and no-JS visitors even before the disclosure opens.
  const summary = screen.getByText("1 species sighted");
  const details = summary.closest("details");
  expect(details).toBeTruthy();
  expect(details!.textContent).toContain("Green Turtle");
  await userEvent.click(screen.getByRole("button", { name: "+ Add Tent Reef to my dive log" }));
  await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  await userEvent.selectOptions(screen.getByLabelText("Guide"), "Sam");
  expect(screen.getByText("No dives match your filters.")).toBeVisible();
  // The filtered-empty result politely replaces the loaded list for SRs.
  expect(screen.getByRole("status")).toHaveTextContent("No dives match your filters.");
  await userEvent.click(screen.getByRole("button", { name: "Clear filters and show all time" }));
  expect(screen.getByRole("heading", { name: "3 dives" })).toBeVisible();
});
it("exposes disclosure and toggle states to assistive tech", async () => {
  render(<DiveLogClient />);
  await screen.findByRole("heading", { name: "2 dives" });
  const filterToggle = screen.getByRole("button", { name: "Filter" });
  expect(filterToggle).toHaveAttribute("aria-expanded", "false");
  expect(filterToggle).toHaveAttribute("aria-controls", "dive-log-filters");
  await userEvent.click(filterToggle);
  expect(screen.getByRole("button", { name: "Hide Filters" })).toHaveAttribute("aria-expanded", "true");
  // The unit buttons are a single-choice toggle — the active one is pressed.
  expect(screen.getByRole("button", { name: "Metric units" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Imperial units" })).toHaveAttribute("aria-pressed", "false");
  await userEvent.click(screen.getByRole("button", { name: "Imperial units" }));
  expect(screen.getByRole("button", { name: "Imperial units" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Metric units" })).toHaveAttribute("aria-pressed", "false");
});
it("paginates without losing selection and resets the page when filters change", async () => {
  const today = new Date().toISOString().slice(0, 10);
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData(Array.from({ length: 21 }, (_, i) => rawDive({ id: `d-${i}`, date: today, boatId: `boat-${i}` }))));
  render(<DiveLogClient />);
  await screen.findByText("Page 1 of 2");
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  await userEvent.click(screen.getAllByRole("button", { name: "+ Add Tent Reef to my dive log" })[0]);
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1);
  expect(screen.getByText("1 dive selected")).toBeVisible();
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  await userEvent.click(screen.getByRole("button", { name: "Previous" }));
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "all");
  expect(screen.getByText("Page 1 of 2")).toBeVisible();
});
it("renders server-provided dives immediately without fetching", async () => {
  const today = new Date().toISOString().slice(0, 10);
  const initialDives = buildPublicDives(diveData([rawDive({ date: today })]));
  render(<DiveLogClient initialDives={initialDives} />);
  // No loading state, no Firestore call — the SSR payload renders as-is.
  expect(screen.queryByText("Loading recent dives...")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "1 dive" })).toBeVisible();
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("pre-selects the site filter from a ?site= deep link", async () => {
  nav.params = new URLSearchParams("site=Diamond Rock");
  const today = new Date().toISOString().slice(0, 10);
  const initialDives = buildPublicDives(
    diveData([
      rawDive({ date: today }),
      rawDive({ id: "old", date: "2000-01-01", diveSiteId: "site-2", diveSlot: "9 am" }),
    ])
  );
  render(<DiveLogClient initialDives={initialDives} />);
  // The deep-linked site is filtered, the panel opens to show it, and the
  // range widens to all-time so older dives at the site still appear.
  expect(await screen.findByRole("heading", { name: "1 dive matching filters" })).toBeVisible();
  expect(screen.getByLabelText("Dive Site")).toHaveValue("Diamond Rock");
  expect(screen.getByLabelText("Date range")).toHaveValue("all");
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("ignores a ?site= deep link that matches no logged dive", async () => {
  nav.params = new URLSearchParams("site=Atlantis");
  const today = new Date().toISOString().slice(0, 10);
  const initialDives = buildPublicDives(diveData([rawDive({ date: today })]));
  render(<DiveLogClient initialDives={initialDives} />);
  expect(await screen.findByRole("heading", { name: "1 dive" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Filter" })).toHaveAttribute("aria-expanded", "false");
});
it("applies a ?site= deep link after the client fetch resolves", async () => {
  nav.params = new URLSearchParams("site=Diamond Rock");
  render(<DiveLogClient />);
  await screen.findByRole("heading", { name: "1 dive matching filters" });
  expect(screen.getByLabelText("Dive Site")).toHaveValue("Diamond Rock");
});
it("dates the SSR cutoff from the render timestamp, then reconciles", async () => {
  // Rendered Sep 1 (cutoff Aug 18) but hydrated Sep 8 (cutoff Aug 25): the
  // dive inside only the SSR window renders first, then reconciles after
  // mount instead of producing a hydration mismatch.
  const initialDives = buildPublicDives(diveData([rawDive({ date: "2026-08-20" })]));
  const generatedAt = new Date("2026-09-01T12:00:00Z").getTime();
  render(<DiveLogClient initialDives={initialDives} generatedAt={generatedAt} />);
  expect(screen.getByRole("heading", { name: "1 dive" })).toBeVisible();
  await screen.findByText("No dives match your filters.");
});
it("shows permission failure without exposing an export action", async () => {
  vi.mocked(fetchDiveLogData).mockRejectedValue(new Error("Missing or insufficient permissions"));
  render(<DiveLogClient />);
  await screen.findByText("Unable to load dive log");
  // Raw backend error text never reaches the visitor.
  expect(screen.queryByText(/Missing or insufficient permissions/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Export My Dive Log" })).not.toBeInTheDocument();
});
it("announces a load failure and recovers via Try again", async () => {
  vi.mocked(fetchDiveLogData).mockRejectedValueOnce(new Error("network down"));
  render(<DiveLogClient />);
  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("Unable to load dive log");
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  // Second attempt uses the default fixture resolution.
  await screen.findByRole("heading", { name: "2 dives" });
});
it("distinguishes a truly empty log from filtered-empty", async () => {
  vi.mocked(fetchDiveLogData).mockResolvedValue(diveData([]));
  render(<DiveLogClient />);
  await waitFor(() => expect(screen.getByText("No dives logged yet")).toBeVisible());
  // A reset-filter action is useless when there is nothing to filter.
  expect(screen.queryByText("No dives match your filters.")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Browse dive sites" })).toHaveAttribute("href", "/dive-sites");
  // The completed empty state is announced politely after the async fetch.
  expect(screen.getByRole("status")).toHaveTextContent("No dives logged yet");
});
it("politely announces while the PDF is being prepared", async () => {
  // A never-resolving export holds the pending state for the assertion.
  vi.mocked(exportDiveLogToPdf).mockReturnValueOnce(new Promise(() => {}));
  render(<DiveLogClient />);
  await screen.findByRole("heading", { name: "2 dives" });
  await userEvent.click(screen.getByRole("button", { name: "+ Add Tent Reef to my dive log" }));
  await userEvent.click(screen.getByRole("button", { name: "Export My Dive Log" }));
  expect(await screen.findByRole("status")).toHaveTextContent("Preparing your dive log PDF");
  expect(screen.getByRole("button", { name: "Preparing PDF..." })).toBeDisabled();
});
it("surfaces a failed PDF export as an alert with no lingering status region", async () => {
  vi.mocked(exportDiveLogToPdf).mockRejectedValueOnce(new Error("boom"));
  render(<DiveLogClient />);
  await screen.findByRole("heading", { name: "2 dives" });
  await userEvent.click(screen.getByRole("button", { name: "+ Add Tent Reef to my dive log" }));
  await userEvent.click(screen.getByRole("button", { name: "Export My Dive Log" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("couldn't be created");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Export My Dive Log" })).toBeEnabled();
});
it("API mode never reads Firestore in the browser; Try again re-renders on the server", async () => {
  render(<DiveLogClient source="api" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to load dive log");
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(nav.refresh).toHaveBeenCalledTimes(1);
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("API mode treats an empty server list as a genuine empty result, not a failure", async () => {
  vi.mocked(loadDiveLogHistory).mockResolvedValue({ dives: [], generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={[]} generatedAt={Date.now()} />);
  // Only the last 14 days are loaded, so older history may still exist.
  expect(screen.getByText("No dives match your filters.")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clear filters and show all time" }));
  expect(loadDiveLogHistory).toHaveBeenCalledWith("all");
  expect(await screen.findByText("No dives logged yet")).toBeVisible();
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("API mode loads wider date ranges on demand and keeps selections for export", async () => {
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  const all = buildPublicDives(diveData([rawDive({ date: today }), rawDive({ id: "old", date: "2000-01-01", diveSlot: "9 am" })]));
  vi.mocked(loadDiveLogHistory).mockResolvedValue({ dives: all, generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  expect(screen.getByRole("heading", { name: "1 dive" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "+ Add Tent Reef to my dive log" }));
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "30");
  expect(loadDiveLogHistory).toHaveBeenLastCalledWith("30");
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "all");
  expect(loadDiveLogHistory).toHaveBeenLastCalledWith("all");
  expect(await screen.findByRole("heading", { name: "2 dives" })).toBeVisible();
  // Narrowing again reuses the loaded history.
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "90");
  expect(loadDiveLogHistory).toHaveBeenCalledTimes(2);
  await userEvent.click(screen.getByRole("button", { name: "Export My Dive Log" }));
  expect(exportDiveLogToPdf).toHaveBeenCalledWith([expect.objectContaining({ diveSite: "Tent Reef" })], "metric");
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("API mode surfaces a failed history load and retries it", async () => {
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  vi.mocked(loadDiveLogHistory).mockRejectedValueOnce(new Error("503")).mockResolvedValueOnce({ dives: recent, generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  await userEvent.selectOptions(screen.getByLabelText("Date range"), "all");
  expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load dive log");
  await userEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(loadDiveLogHistory).toHaveBeenLastCalledWith("all");
  expect(await screen.findByRole("heading", { name: "1 dive" })).toBeVisible();
  expect(nav.refresh).not.toHaveBeenCalled();
});
it("API mode deep links load only that site's history, not all history", async () => {
  nav.params = new URLSearchParams("site=Diamond Rock");
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  const siteHistory = buildPublicDives(diveData([
    rawDive({ id: "old", date: "2000-01-01", diveSiteId: "site-2", diveSlot: "9 am" }),
    rawDive({ id: "older", date: "1999-06-01", diveSiteId: "site-2", diveSlot: "9 am" }),
  ]));
  vi.mocked(loadDiveLogSiteHistory).mockResolvedValue({ dives: siteHistory, generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  expect(await screen.findByRole("heading", { name: "2 dives matching filters" })).toBeVisible();
  expect(loadDiveLogSiteHistory).toHaveBeenCalledWith("Diamond Rock");
  expect(loadDiveLogHistory).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Date range")).toHaveValue("all");
  expect(screen.getByLabelText("Dive Site")).toHaveValue("Diamond Rock");
  expect(fetchDiveLogData).not.toHaveBeenCalled();
});
it("API mode falls back to full history when the deep-linked site is unknown", async () => {
  nav.params = new URLSearchParams("site=Atlantis");
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  vi.mocked(loadDiveLogSiteHistory).mockResolvedValue(null);
  vi.mocked(loadDiveLogHistory).mockResolvedValue({ dives: recent, generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  await waitFor(() => expect(loadDiveLogHistory).toHaveBeenCalledWith("all"));
  // Unknown site: the filter never applies, no crash.
  expect(screen.getByRole("heading", { name: "1 dive" })).toBeVisible();
});
it("API mode clearing a deep-linked site filter loads full history once", async () => {
  nav.params = new URLSearchParams("site=Diamond Rock");
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  const siteHistory = buildPublicDives(diveData([rawDive({ id: "old", date: "2000-01-01", diveSiteId: "site-2", diveSlot: "9 am" })]));
  vi.mocked(loadDiveLogSiteHistory).mockResolvedValue({ dives: siteHistory, generatedAt: Date.now() });
  vi.mocked(loadDiveLogHistory).mockResolvedValue({ dives: buildPublicDives(diveData([rawDive({ date: today }), rawDive({ id: "other", date: "2001-01-01", diveSlot: "9 am" })])), generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  expect(await screen.findByRole("heading", { name: "1 dive matching filters" })).toBeVisible();
  // Select a dive from the site chunk — it must survive the widening.
  await userEvent.click(screen.getByRole("button", { name: "+ Add Diamond Rock to my dive log" }));
  // Clear the site filter while staying on all time (the deep link opened the panel).
  await userEvent.selectOptions(screen.getByLabelText("Dive Site"), "");
  await waitFor(() => expect(loadDiveLogHistory).toHaveBeenCalledWith("all"));
  expect(await screen.findByRole("heading", { name: "3 dives" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Export My Dive Log" }));
  expect(exportDiveLogToPdf).toHaveBeenCalledWith([expect.objectContaining({ diveSite: "Diamond Rock" })], "metric");
});
it("API mode merges overlapping chunks deduplicated in newest-first order", async () => {
  nav.params = new URLSearchParams("site=Tent Reef");
  const today = new Date().toISOString().slice(0, 10);
  const recent = buildPublicDives(diveData([rawDive({ date: today })]));
  const siteHistory = buildPublicDives(diveData([
    rawDive({ date: today }), // duplicate of the initial chunk
    rawDive({ id: "mid", date: "2020-06-01", diveSlot: "9 am" }),
  ]));
  vi.mocked(loadDiveLogSiteHistory).mockResolvedValue({ dives: siteHistory, generatedAt: Date.now() });
  // Clearing the deep-linked site widens to full history (mocked empty here);
  // the merged list is what matters.
  vi.mocked(loadDiveLogHistory).mockResolvedValue({ dives: [], generatedAt: Date.now() });
  render(<DiveLogClient source="api" initialDives={recent} generatedAt={Date.now()} />);
  expect(await screen.findByRole("heading", { name: "2 dives matching filters" })).toBeVisible();
  // Clear the site filter: both chunks merged, the duplicate counted once,
  // today's dive first.
  await userEvent.selectOptions(screen.getByLabelText("Dive Site"), "");
  expect(await screen.findByRole("heading", { name: "2 dives" })).toBeVisible();
  const html = document.body.innerHTML;
  expect(html.indexOf(formatDate(today))).toBeLessThan(html.indexOf(formatDate("2020-06-01")));
});
