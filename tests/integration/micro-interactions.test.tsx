import { describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ImageCard } from "@/components/image-card";
import { FindSeaSaba } from "@/components/find-sea-saba";
import { Header } from "@/components/header";
import { SpeciesModal } from "@/components/species-modal";
import { DiveSiteModal } from "@/components/dive-site-modal";
import { SPECIES_CATALOG } from "@/data/species";
import { DIVE_SITES } from "@/data/dive-site-videos";

// Issue #199: the site shares one small interaction language — a `pressable`
// control transition + restrained press, a `transition-card` surface
// transition, shared `animate-overlay-in`/`animate-rise-in` dialog entrances,
// and reduced-motion opt-outs on every nonessential animation.

const mocks = vi.hoisted(() => ({ pathname: { current: "/" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname.current,
}));

const globalsCss = readFileSync("app/globals.css", "utf8");

describe("interaction tokens", () => {
  it("defines the shared pressable control utility", () => {
    expect(globalsCss).toMatch(/@utility pressable/);
    // The press uses the independent `scale` property so it composes with
    // translate/rotate utilities already on an element.
    expect(globalsCss).toMatch(/scale:\s*0\.97/);
    // Press is disabled under reduced motion and for link-styled buttons.
    expect(globalsCss).toMatch(/prefers-reduced-motion:\s*no-preference/);
    expect(globalsCss).toContain('[data-variant="link"]');
  });

  it("defines shared card and dialog-entrance tokens", () => {
    expect(globalsCss).toMatch(/@utility transition-card/);
    expect(globalsCss).toContain("--animate-overlay-in");
    expect(globalsCss).toContain("--animate-rise-in");
    expect(globalsCss).toContain("--animate-seasaba-float");
  });
});

describe("controls", () => {
  it("Button carries the shared tactile treatment and a variant marker", () => {
    const { getByRole } = render(<Button>Book</Button>);
    const btn = getByRole("button");
    expect(btn.className).toContain("pressable");
    expect(btn.className).not.toContain("transition-all");
    expect(btn).toHaveAttribute("data-variant", "default");
  });

  it("link-styled buttons keep the link variant marker so press is skipped", () => {
    const { getByRole } = render(
      <Button variant="link">Read more</Button>
    );
    expect(getByRole("button")).toHaveAttribute("data-variant", "link");
    expect(buttonVariants({ variant: "link" })).toContain("pressable");
  });

  it("Pill uses the same tactile treatment", () => {
    const { getByRole } = render(<Pill>Section</Pill>);
    expect(getByRole("button").className).toContain("pressable");
  });
});

describe("cards", () => {
  it("image-card zoom only runs when motion is allowed", () => {
    const { container } = render(
      <ImageCard src="/x.webp" alt="" heading="H" body="B" />
    );
    const img = container.querySelector("img")!;
    expect(img.className).toContain("motion-safe:group-hover:scale-105");
    expect(img.className).not.toMatch(/(?<!motion-safe:)group-hover:scale/);
  });
});

describe("dialogs share one entrance language", () => {
  const noop = () => {};

  it("species modal fades the overlay and rises the panel", () => {
    const { getByRole } = render(
      <SpeciesModal species={SPECIES_CATALOG[0]} onClose={noop} />
    );
    const dialog = getByRole("dialog");
    expect(dialog.className).toContain("animate-overlay-in");
    expect(dialog.className).toContain("motion-reduce:animate-none");
    const panel = dialog.firstElementChild as HTMLElement;
    expect(panel.className).toContain("animate-rise-in");
    expect(panel.className).toContain("motion-reduce:animate-none");
  });

  it("dive-site modal uses the same language", () => {
    const { getByRole } = render(
      <DiveSiteModal
        site={DIVE_SITES[0]}
        allSites={DIVE_SITES}
        onClose={noop}
        onNavigate={noop}
      />
    );
    const dialog = getByRole("dialog");
    expect(dialog.className).toContain("animate-overlay-in");
    const panel = dialog.firstElementChild as HTMLElement;
    expect(panel.className).toContain("animate-rise-in");
  });
});

describe("decorative animation respects reduced motion", () => {
  it("Find Sea Saba pin ping and float stop under reduced motion", () => {
    const { container } = render(<FindSeaSaba />);
    const ping = container.querySelector(".animate-ping")!;
    expect(ping.className).toContain("motion-reduce:animate-none");
    const pin = container.querySelector(".animate-seasaba-float")!;
    expect(pin.className).toContain("motion-reduce:animate-none");
  });

  it("pin tooltip is reachable by keyboard via focus-within", () => {
    const { container } = render(<FindSeaSaba />);
    const tooltip = container.querySelector(".group > div") as HTMLElement;
    expect(tooltip.className).toContain("group-focus-within:opacity-100");
    expect(tooltip.className).toContain("group-focus-within:pointer-events-auto");
  });
});

describe("navigation", () => {
  it("mobile menu reveals as a floating panel via a positional settle, not shell expansion", () => {
    mocks.pathname.current = "/about";
    const { container } = render(<Header />);
    const nav = container.querySelector("#mobile-navigation")!;
    // Anchored just below the pill — a separate surface, not a growing one.
    expect(nav.className).toContain("absolute");
    expect(nav.className).toContain("inset-x-0");
    expect(nav.className).toContain("top-full");
    // Reveal is a 6px positional settle with only a whisper of opacity
    // (0.92↔1, never from transparent); visibility joins the transition so
    // the panel hides exactly when the exit finishes. No layout animation.
    expect(nav.className).toContain("transition-[opacity,translate,visibility]");
    expect(nav.className).toContain("ease-out");
    expect(nav.className).toContain("motion-reduce:transition-none");
    expect(nav.className).not.toContain("transition-all");
    expect(nav.className).not.toContain("grid-rows");
    // Material stays constant in both states — blur and tint are base
    // classes, not open-only — so nothing develops mid-transition.
    expect(nav.className).toContain("backdrop-blur");
    // Closed: nearly opaque, lifted 6px, and unreachable by pointer or focus.
    expect(nav.className).toContain("invisible");
    expect(nav.className).toContain("opacity-[0.92]");
    expect(nav.className).not.toContain("opacity-0");
    expect(nav.className).toContain("-translate-y-1.5");
    expect(nav.className).toContain("pointer-events-none");
    // Open region stays inside short viewports: bounded by 100dvh minus the
    // pill's top offset + bar height, and internally scrollable.
    expect(nav.className).toContain("max-h-[calc(100dvh-7rem)]");
    expect(nav.className).toContain("overflow-y-auto");
    mocks.pathname.current = "/";
  });

  // Issue #204: the header paints a floating rounded shell. The mobile menu
  // is a sibling panel beneath it — the shell's box never changes when the
  // menu opens, it just fades in below.
  it("renders a fixed floating shell with the mobile menu as a sibling panel", () => {
    const { container } = render(<Header />);
    const wrapper = container.querySelector("header > div > div")!;
    const shell = wrapper.firstElementChild as HTMLElement;
    const nav = container.querySelector("#mobile-navigation")!;
    expect(wrapper.className).toContain("relative");
    expect(wrapper.className).toContain("max-w-6xl");
    expect(shell.className).toContain("rounded-full");
    expect(shell.contains(nav)).toBe(false);
    expect(wrapper.contains(nav)).toBe(true);
  });

  it("keeps the 44px menu toggle with an accessible expanded state", () => {
    const { container } = render(<Header />);
    const toggle = container.querySelector('button[aria-controls="mobile-navigation"]')!;
    expect(toggle.className).toContain("h-11");
    expect(toggle.className).toContain("w-11");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  // Issue #204 follow-up: the homepage pill settles into the compact browsing
  // state on scroll — the same geometry interior pages use from first paint —
  // inside a zero-height band, so the page content below never shifts.
  const scrollTo = (y: number) => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    act(() => window.dispatchEvent(new Event("scroll")));
  };

  it("overlays the homepage pill on the hero with no flow height", () => {
    mocks.pathname.current = "/";
    const { container } = render(<Header />);
    const header = container.querySelector("header")!;
    // Zero-height band: the pill overlays the hero, so menu open/close and
    // the compact transition can never push the hero down.
    expect(header.className).toContain("h-0");
    expect(header.className).toContain("overflow-visible");
  });

  it("compacts the homepage pill after scroll without changing flow height", () => {
    mocks.pathname.current = "/";
    const { container } = render(<Header />);
    const header = container.querySelector("header")!;
    const bar = header.firstElementChild!.firstElementChild!.firstElementChild!
      .firstElementChild as HTMLElement;
    const logo = header.querySelector("img")!;

    expect(bar.className).toContain("h-16");
    expect(logo.className).toContain("h-10");

    scrollTo(100);

    expect(bar.className).toContain("h-14");
    expect(logo.className).toContain("h-9");
    expect(header.className).toContain("h-0");
    expect(bar.className).toContain("motion-reduce:transition-none");
  });

  it("keeps the band in flow at the canonical compact size on interior pages", () => {
    mocks.pathname.current = "/diving";
    const { container } = render(<Header />);
    const header = container.querySelector("header")!;
    const bar = header.firstElementChild!.firstElementChild!.firstElementChild!
      .firstElementChild as HTMLElement;
    const logo = header.querySelector("img")!;

    // Interior pages start at the compact geometry — the same size the
    // homepage pill settles into after scroll — and never resize on scroll.
    expect(header.className).not.toContain("h-0");
    expect(bar.className).toContain("h-14");
    expect(logo.className).toContain("h-9");

    scrollTo(100);

    expect(bar.className).toContain("h-14");
    expect(logo.className).toContain("h-9");
    mocks.pathname.current = "/";
  });
});
