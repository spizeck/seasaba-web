import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { BookingWidget } from "@/components/booking-widget";

type WidgetConfig = { item_id?: string; category_id?: string; host: string; target: string };
const state = window as unknown as { DROPLET?: { Widget: new (config: WidgetConfig) => { render: () => void } } };
beforeEach(() => { vi.useFakeTimers(); vi.spyOn(window, "scrollTo").mockImplementation(() => {}); });
afterEach(() => { delete state.DROPLET; document.getElementById("checkfront-interface-script")?.remove(); });
function script() { return document.getElementById("checkfront-interface-script")!; }

it.each([["classic", "244", undefined], ["advanced", "243", undefined], ["afternoon", "245", undefined], ["snorkel", "246", undefined], ["private", undefined, "49"], ["248", "248", undefined], ["", "245,244,243,246,247,248,253,249,254", "4,51,49"]])("hands %s bookings to the expected Checkfront inventory", (slug, item, category) => {
  window.history.replaceState({}, "", slug ? `/book?item=${slug}` : "/book");
  const received = vi.fn();
  const renderWidget = vi.fn();
  state.DROPLET = { Widget: class { constructor(config: WidgetConfig) { received(config); } render = renderWidget; } };
  render(<BookingWidget />);
  expect(screen.getByText("Loading availability...")).toBeVisible();
  fireEvent.load(script());
  act(() => vi.advanceTimersByTime(100));
  expect(received).toHaveBeenCalledWith(expect.objectContaining({ host: "seasaba.checkfront.com", item_id: item, category_id: category }));
  expect(renderWidget).toHaveBeenCalledOnce();
  expect(screen.queryByText("Loading availability...")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "book directly" })).toHaveAttribute("href", "https://seasaba.checkfront.com/reserve/");
});
it.each(["load failure", "timeout", "render failure"])("preserves a secure booking fallback on %s", (failure) => {
  if (failure === "render failure") state.DROPLET = { Widget: class { render() { throw new Error("vendor failure"); } } };
  render(<BookingWidget />);
  if (failure === "load failure") fireEvent.error(script());
  else { fireEvent.load(script()); act(() => vi.advanceTimersByTime(12000)); }
  expect(screen.getByText("Booking system unavailable")).toBeVisible();
  expect(screen.getByRole("link", { name: "Continue to Secure Booking System" })).toHaveAttribute("rel", "noopener noreferrer");
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
