import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BookingWidget } from "@/components/booking-widget";

type WidgetConfig = { item_id?: string; category_id?: string; host: string; target: string };
const state = window as unknown as { DROPLET?: { Widget: new (config: WidgetConfig) => { render: () => void } } };
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
afterEach(() => { delete state.DROPLET; document.getElementById("checkfront-interface-script")?.remove(); });
function script() { return document.getElementById("checkfront-interface-script")!; }

const GENERIC_FALLBACK = "https://seasaba.checkfront.com/reserve/?tid=seasaba-website";

it.each([["classic", "244", undefined], ["advanced", "243", undefined], ["afternoon", "245", undefined], ["snorkel", "246", undefined], ["private", undefined, "49"], ["248", "248", undefined], [undefined, "245,244,243,246,247,248,253,249,254", "4,51,49"]])("hands %s bookings to the expected Checkfront inventory", (slug, item, category) => {
  const received = vi.fn();
  const renderWidget = vi.fn();
  state.DROPLET = { Widget: class { constructor(config: WidgetConfig) { received(config); } render = renderWidget; } };
  render(<BookingWidget item={slug} />);
  expect(screen.getByText("Loading availability...")).toBeVisible();
  fireEvent.load(script());
  act(() => vi.advanceTimersByTime(100));
  expect(received).toHaveBeenCalledWith(expect.objectContaining({ host: "seasaba.checkfront.com", item_id: item, category_id: category }));
  expect(renderWidget).toHaveBeenCalledOnce();
  expect(screen.queryByText("Loading availability...")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "book directly" })).toHaveAttribute("href", expect.stringContaining("seasaba.checkfront.com/reserve/"));
});

it.each(["load failure", "timeout", "render failure"])("preserves a secure booking fallback on %s", (failure) => {
  if (failure === "render failure") state.DROPLET = { Widget: class { render() { throw new Error("vendor failure"); } } };
  render(<BookingWidget />);
  if (failure === "load failure") fireEvent.error(script());
  else { fireEvent.load(script()); act(() => vi.advanceTimersByTime(12000)); }
  expect(screen.getByText("Booking isn't loading")).toBeVisible();
  const direct = screen.getByRole("link", { name: "Continue to Secure Booking System" });
  expect(direct).toHaveAttribute("href", GENERIC_FALLBACK);
  expect(direct).toHaveAttribute("rel", "noopener noreferrer");
  // Recovery must offer more than the vendor link: WhatsApp and the contact form.
  expect(screen.getByRole("link", { name: "WhatsApp Us" })).toHaveAttribute("href", "https://wa.me/5994162246");
  expect(screen.getByRole("link", { name: "Contact us instead" })).toHaveAttribute("href", "/contact?interest=book-diving");
});

it("keeps the selected product in the fallback when the widget fails", () => {
  render(<BookingWidget item="classic" />);
  fireEvent.error(script());
  expect(screen.getByText("Booking isn't loading")).toBeVisible();
  expect(screen.getByRole("link", { name: "Continue to Secure Booking System" }))
    .toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/?tid=seasaba-website&item_id=244");
});

it("uses the category fallback for the private charter", () => {
  render(<BookingWidget item="private" />);
  fireEvent.error(script());
  expect(screen.getByRole("link", { name: "Continue to Secure Booking System" }))
    .toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/?tid=seasaba-website&category_id=49");
});

it("rejects an unknown item param and loads the full inventory instead", () => {
  const received = vi.fn();
  state.DROPLET = { Widget: class { constructor(config: WidgetConfig) { received(config); } render() {} } };
  render(<BookingWidget item="bogus-product" />);
  expect(screen.getByText("We couldn't find that experience.")).toBeVisible();
  expect(screen.queryByText(/^Booking:/)).not.toBeInTheDocument();
  fireEvent.load(script());
  act(() => vi.advanceTimersByTime(100));
  // Nothing bogus reaches the vendor — the generic inventory loads.
  expect(received).toHaveBeenCalledWith(expect.objectContaining({ item_id: "245,244,243,246,247,248,253,249,254", category_id: "4,51,49" }));
});

it("shows the product banner for a valid preselected item", () => {
  render(<BookingWidget item="advanced" />);
  expect(screen.getByText("Booking: Advanced 2-Tank Dive")).toBeVisible();
  expect(screen.getByRole("link", { name: "view all options" })).toHaveAttribute("href", "/book");
});

it("reuses the script on navigation and stops polling after unmount", () => {
  const existing = document.createElement("script");
  existing.id = "checkfront-interface-script";
  document.head.append(existing);
  const { unmount } = render(<BookingWidget />);
  expect(document.querySelectorAll("#checkfront-interface-script")).toHaveLength(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});
