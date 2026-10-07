import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccommodationsSection } from "@/components/partners/accommodations-section";
import type { Accommodation } from "@/data/partners";

// Issue #218: the "Where to Stay" search and pill filters behave like a
// public form — the search box needs a real accessible name (no
// placeholder-only labels) and the filter pills are toggles, not nav items.

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/partners",
}));

const FIXTURE: Accommodation[] = [
  {
    name: "Ridge Hotel",
    type: "hotel",
    village: "Windwardside",
    description: "A hillside hotel.",
    website: "https://ridge.example.com",
    filters: ["pool"],
    amenities: [],
  },
  {
    name: "Bay Cottage",
    type: "cottage",
    village: "The Bottom",
    description: "A quiet cottage.",
    website: "https://bay.example.com",
    filters: ["ocean-view"],
    amenities: [],
  },
];

it("gives the search control an accessible name inside a search landmark", () => {
  render(<AccommodationsSection accommodations={FIXTURE} />);
  // role="search" landmark wraps the control so SR users can jump to it.
  const landmark = screen.getByRole("search");
  const search = screen.getByRole("searchbox", { name: "Search accommodations" });
  expect(landmark).toContainElement(search);
  expect(search).toHaveAttribute("type", "search");
  // Placeholder stays purely supplemental — never the label.
  expect(search).toHaveAttribute("placeholder", "Search accommodations...");
});

it("filters the list by the named search box and clears via the clear button", async () => {
  render(<AccommodationsSection accommodations={FIXTURE} />);
  const search = screen.getByRole("searchbox", { name: "Search accommodations" });
  await userEvent.type(search, "ridge");
  expect(screen.getByRole("heading", { name: "1 accommodation" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Bay Cottage" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByRole("heading", { name: "2 accommodations" })).toBeVisible();
});

it("announces filter pills as toggles, not as current navigation items", async () => {
  render(<AccommodationsSection accommodations={FIXTURE} />);
  const pool = screen.getByRole("button", { name: "Pool" });
  expect(pool).toHaveAttribute("aria-pressed", "false");
  expect(pool).not.toHaveAttribute("aria-current");
  await userEvent.click(pool);
  expect(pool).toHaveAttribute("aria-pressed", "true");
  // The toggle actually filters: only the pool-filtered hotel remains.
  expect(screen.getByRole("heading", { name: "1 accommodation" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Bay Cottage" })).toBeNull();
});

// Issue #209: a filtered-empty result must explain what happened and offer
// the way back — never a silent zero-result list.
it("explains an empty filter result and offers a way back", async () => {
  render(<AccommodationsSection accommodations={FIXTURE} />);
  await userEvent.type(
    screen.getByRole("searchbox", { name: "Search accommodations" }),
    "zzz-no-match"
  );
  // The always-mounted result count is a polite live region, so the zero
  // state is announced while focus stays on the filter control.
  const count = screen.getByRole("heading", { name: "0 accommodations" });
  expect(count).toHaveAttribute("aria-live", "polite");
  expect(count).toHaveAttribute("aria-atomic", "true");
  const panel = screen.getByText("No accommodations match your filters.");
  expect(panel).toBeVisible();
  // The recovery action actually restores the list.
  await userEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
  expect(screen.getByRole("heading", { name: "2 accommodations" })).toBeVisible();
  expect(screen.queryByText("No accommodations match your filters.")).toBeNull();
});
