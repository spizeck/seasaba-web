import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageLinks, LanguageMenu } from "@/components/language-switcher";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const mocks = vi.hoisted(() => ({
  pathname: { current: "/" },
  search: { current: "" },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname.current,
  useSearchParams: () => new URLSearchParams(mocks.search.current),
}));

beforeEach(() => {
  mocks.pathname.current = "/";
  mocks.search.current = "";
});

// Language selection moved from the footer into the header (#156): a compact
// desktop disclosure beside Book Now plus a labelled group inside the mobile
// hamburger menu. Both share the same publication gate — nothing may render
// unless the current route has an eligible alternate.

describe("publication gate (#150/#151)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("renders nothing in production while no route has a published translation", () => {
    vi.stubEnv("NODE_ENV", "production");
    for (const path of ["/", "/diving", "/plan-your-trip", "/book"]) {
      mocks.pathname.current = path;
      const desktop = render(<LanguageMenu />);
      expect(desktop.container.innerHTML, path).toBe("");
      const mobile = render(<LanguageLinks />);
      expect(mobile.container.innerHTML, path).toBe("");
      desktop.unmount();
      mobile.unmount();
    }
  });

  it("the production header advertises no Dutch destination", () => {
    vi.stubEnv("NODE_ENV", "production");
    mocks.pathname.current = "/diving";
    const { container } = render(<Header />);
    expect(container.querySelector("a[href^='/nl']")).toBeNull();
    expect(
      screen.queryByRole("button", { name: /choose language/i })
    ).toBeNull();
    expect(container.textContent).not.toContain("Nederlands");
  });

  it("shows no Dutch link in preview for routes without a drafted module", () => {
    for (const path of ["/terms", "/dive-sites", "/visiting-yachts", "/about"]) {
      mocks.pathname.current = path;
      const desktop = render(<LanguageMenu />);
      const mobile = render(<LanguageLinks />);
      expect(desktop.container.querySelector("a[href^='/nl']"), path).toBeNull();
      expect(desktop.container.innerHTML, path).toBe("");
      expect(mobile.container.innerHTML, path).toBe("");
      desktop.unmount();
      mobile.unmount();
    }
  });
});

describe("desktop LanguageMenu", () => {
  it("exposes English and drafted Nederlands behind an accessible disclosure", () => {
    // NODE_ENV=test → draft preview enabled.
    mocks.pathname.current = "/diving";
    render(<LanguageMenu />);

    const button = screen.getByRole("button", { name: "Choose language" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    const menu = document.getElementById("header-language-menu")!;
    expect(menu).not.toBeVisible();
    expect(button).toHaveAttribute("aria-controls", "header-language-menu");

    // Alternate links stay mounted while hidden — crawlable markup.
    const nl = menu.querySelector("a[href='/nl/diving']");
    expect(nl).not.toBeNull();
    expect(nl?.getAttribute("hrefLang")).toBe("nl");
    expect(nl?.getAttribute("lang")).toBe("nl");
    expect(nl?.textContent).toContain("Nederlands");
    expect(nl?.textContent).toContain("(draft)");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(menu).toBeVisible();
    expect(menu.querySelector("li[aria-current='true']")).toHaveTextContent(
      "English"
    );
  });

  it("closes on Escape and returns focus to the trigger", () => {
    mocks.pathname.current = "/diving";
    render(<LanguageMenu />);
    const button = screen.getByRole("button", { name: "Choose language" });
    const menu = document.getElementById("header-language-menu")!;

    fireEvent.click(button);
    const nl = menu.querySelector("a[href='/nl/diving']") as HTMLElement;
    nl.focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(menu).not.toBeVisible();
    expect(button).toHaveFocus();
  });

  it("closes on outside pointer interaction", () => {
    mocks.pathname.current = "/diving";
    render(<LanguageMenu />);
    const button = screen.getByRole("button", { name: "Choose language" });
    const menu = document.getElementById("header-language-menu")!;

    fireEvent.click(button);
    expect(menu).toBeVisible();
    fireEvent.pointerDown(document.body);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(menu).not.toBeVisible();
  });

  it("persists the explicit locale choice without forcing navigation", () => {
    mocks.pathname.current = "/diving";
    render(<LanguageMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Choose language" }));
    const nl = screen.getByRole("link", { name: /Nederlands/ });
    fireEvent.click(nl);
    expect(document.cookie).toContain("sea-saba-locale=nl");
    // The link is a plain crawlable anchor — no router interception.
    expect(nl.getAttribute("href")).toBe("/nl/diving");
  });
});

describe("mobile LanguageLinks", () => {
  it("lists the current locale plus the drafted alternate in a labelled group", () => {
    mocks.pathname.current = "/";
    const { container } = render(<LanguageLinks />);
    const group = screen.getByRole("navigation", { name: "Choose language" });
    expect(group).toBe(container.querySelector("nav"));
    expect(group.querySelector("li[aria-current='true']")).toHaveTextContent(
      "English"
    );
    const nl = group.querySelector("a[href='/nl']");
    expect(nl).not.toBeNull();
    expect(nl?.getAttribute("hrefLang")).toBe("nl");
    expect(nl?.textContent).toContain("Nederlands");
    expect(nl?.textContent).toContain("(draft)");
  });
});

describe("alternate URL generation", () => {
  it("preserves query parameters on the alternate link", () => {
    mocks.pathname.current = "/contact";
    mocks.search.current = "interest=book-diving";
    render(<LanguageMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Choose language" }));
    expect(
      screen.getByRole("link", { name: /Nederlands/ }).getAttribute("href")
    ).toBe("/nl/contact?interest=book-diving");
  });

  it("keeps English URLs unprefixed when Dutch is the current locale", () => {
    mocks.pathname.current = "/nl/diving";
    render(<LanguageLinks />);
    const en = screen.getByRole("link", { name: "English" });
    expect(en.getAttribute("href")).toBe("/diving");
    expect(en.getAttribute("hrefLang")).toBe("en");
    // English is published — never draft-marked.
    expect(en.textContent).not.toContain("draft");
  });
});

describe("header placement (#156)", () => {
  it("puts the disclosure in the desktop nav and links inside the mobile menu", () => {
    mocks.pathname.current = "/diving";
    render(<Header />);
    const primary = screen.getByRole("navigation", { name: "Primary" });
    expect(
      primary.querySelector("button[aria-label='Choose language']")
    ).not.toBeNull();
    const mobile = screen.getByRole("navigation", { name: "Mobile" });
    expect(
      mobile.querySelector("nav[aria-label='Choose language']")
    ).not.toBeNull();
    expect(mobile.querySelector("a[href='/nl/diving']")).not.toBeNull();
  });
});

describe("footer (#156)", () => {
  it("contains no language selector", () => {
    // A drafted route — the switcher would render here if it were still
    // mounted in the footer.
    mocks.pathname.current = "/diving";
    const { container } = render(<Footer />);
    expect(container.querySelector("a[href^='/nl']")).toBeNull();
    expect(container.querySelector("button[aria-label]")).toBeNull();
    expect(
      screen.queryByRole("navigation", { name: /choose language/i })
    ).toBeNull();
    expect(container.textContent).not.toContain("Nederlands");
  });
});
