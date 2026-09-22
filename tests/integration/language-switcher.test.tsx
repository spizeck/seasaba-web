import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LanguageSwitcher } from "@/components/language-switcher";

const mocks = vi.hoisted(() => ({
  pathname: { current: "/" },
  search: { current: "" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname.current,
  useSearchParams: () => new URLSearchParams(mocks.search.current),
}));

describe("LanguageSwitcher (#150)", () => {
  it("renders nothing while no route has a published translation", () => {
    for (const path of ["/", "/diving", "/plan-your-trip", "/book"]) {
      mocks.pathname.current = path;
      const { container } = render(<LanguageSwitcher />);
      // The switcher must never advertise an unapproved/nonexistent locale.
      expect(container.innerHTML).toBe("");
      expect(container.querySelector("a[href^='/nl']")).toBeNull();
    }
  });
});
