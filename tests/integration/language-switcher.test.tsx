import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => vi.unstubAllEnvs());

  it("renders nothing in production while no route has a published translation", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const path of ["/", "/diving", "/plan-your-trip", "/book"]) {
      mocks.pathname.current = path;
      const { container } = render(<LanguageSwitcher />);
      // The switcher must never advertise an unapproved/nonexistent locale.
      expect(container.innerHTML).toBe("");
      expect(container.querySelector("a[href^='/nl']")).toBeNull();
    }
  });

  it("marks drafted Dutch routes as drafts in preview only", () => {
    // NODE_ENV=test → draft preview enabled.
    mocks.pathname.current = "/diving";
    const { container } = render(<LanguageSwitcher />);
    const nl = container.querySelector("a[href^='/nl']");
    expect(nl).not.toBeNull();
    expect(nl?.getAttribute("href")).toBe("/nl/diving");
    expect(nl?.getAttribute("hrefLang")).toBe("nl");
    expect(nl?.textContent).toContain("Nederlands");
    expect(nl?.textContent).toContain("(draft)");
  });

  it("shows no Dutch link in preview for routes without a drafted module", () => {
    for (const path of ["/terms", "/dive-sites", "/visiting-yachts", "/about"]) {
      mocks.pathname.current = path;
      const { container } = render(<LanguageSwitcher />);
      expect(container.querySelector("a[href^='/nl']"), path).toBeNull();
      expect(container.innerHTML, path).toBe("");
    }
  });

  it("preserves query parameters on the alternate link", () => {
    mocks.pathname.current = "/contact";
    mocks.search.current = "interest=book-diving";
    const { container } = render(<LanguageSwitcher />);
    expect(
      container.querySelector("a[href^='/nl']")?.getAttribute("href"),
    ).toBe("/nl/contact?interest=book-diving");
    mocks.search.current = "";
  });
});
