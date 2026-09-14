import type { Page } from "@playwright/test";
import {
  test,
  expect,
  hydratedGoto,
  stubWindowOpen,
  windowOpenCalls,
  expectNoAxeViolations,
} from "./fixtures";

// Accessibility regression barrier (issue #56).
//
// Browser strategy: axe evaluates the rendered DOM and computed styles, so its
// findings depend on viewport/layout — not browser engine. Full scans run on
// desktop-chromium; mobile-chromium re-scans a representative subset plus the
// mobile-nav-open state to cover the mobile layout. mobile-webkit is skipped
// because it renders the same DOM and would only duplicate Chromium results.
// Keyboard and reduced-motion tests are likewise behavior checks, so they run
// once per relevant form factor rather than across the whole matrix.

const PUBLIC_PAGES = [
  { path: "/", name: "homepage" },
  { path: "/diving", name: "diving" },
  { path: "/courses", name: "courses" },
  { path: "/plan-your-trip", name: "plan your trip" },
  { path: "/contact", name: "contact" },
  { path: "/book", name: "booking" },
  { path: "/book?item=classic", name: "booking item banner" },
  { path: "/dive-sites", name: "dive sites" },
  { path: "/about", name: "about" },
  { path: "/dive-log", name: "dive log" },
];

const MOBILE_SCAN_PAGES = ["/", "/contact", "/book"];

test.describe("automated axe scans", () => {
  for (const { path, name } of PUBLIC_PAGES) {
    test(`desktop: ${name} has no accessibility violations`, async ({ page, isMobile, browserName }) => {
      test.skip(isMobile || browserName !== "chromium", "desktop-chromium covers the full page set");
      await hydratedGoto(page, path);
      await expectNoAxeViolations(page);
    });
  }

  for (const path of MOBILE_SCAN_PAGES) {
    test(`mobile viewport: ${path} has no accessibility violations`, async ({ page, isMobile, browserName }) => {
      test.skip(!isMobile || browserName !== "chromium", "mobile-chromium covers the mobile layout");
      await hydratedGoto(page, path);
      await expectNoAxeViolations(page);
    });
  }

  test("mobile navigation open state has no accessibility violations", async ({ page, isMobile, browserName }) => {
    test.skip(!isMobile || browserName !== "chromium", "mobile layout only");
    await hydratedGoto(page, "/", 'button[aria-controls="mobile-navigation"]');
    await page.getByRole("button", { name: "Open menu" }).click();
    const nav = page.getByRole("navigation", { name: "Mobile" });
    // Wait out the open transition before scanning: mid-animation the links are
    // partially transparent, which axe would (correctly) flag as low contrast.
    await expect(nav).toHaveCSS("opacity", "1");
    await expectNoAxeViolations(page);
  });

  test("contact form with validation errors shown has no accessibility violations", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative scan on desktop-chromium");
    await hydratedGoto(page, "/contact", "#name");
    await page.getByRole("button", { name: "Send inquiry by email" }).click();
    // Error text is always mounted but `invisible` until the field is touched.
    await expect(page.locator("#name-error")).not.toHaveClass(/invisible/);
    await expect(page.locator("#email-error")).not.toHaveClass(/invisible/);
    await expectNoAxeViolations(page);
  });

  test("dive site dialog has no accessibility violations", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative scan on desktop-chromium");
    await hydratedGoto(page, "/dive-sites");
    await page.getByRole("button", { name: "Tent Reef" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expectNoAxeViolations(page);
  });

  test("booking unavailable fallback has no accessibility violations", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative scan on desktop-chromium");
    await hydratedGoto(page, "/book");
    // The fixture blocks the Checkfront loader, so the degraded state is shown.
    await expect(page.getByText("Booking system unavailable")).toBeVisible();
    await expectNoAxeViolations(page);
  });
});

// Focuses an element the way sequential keyboard navigation would land on it.
// Used to position focus mid-page where pressing Tab from the top dozens of
// times would only test tab order, not the behavior under test.
async function keyboardFocus(page: Page, selector: string) {
  await page.locator(selector).first().focus();
}

test.describe("keyboard operation", () => {
  test("skip link is the first tab stop and moves reading position into main content", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "desktop keyboard navigation");
    await hydratedGoto(page, "/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content$/);
    // Next Tab must land inside <main id="main-content">, not back in the header.
    await page.keyboard.press("Tab");
    const inMain = await page.evaluate(() => document.getElementById("main-content")?.contains(document.activeElement));
    expect(inMain, "focus after skip link should be inside main content").toBe(true);
  });

  test("desktop: primary navigation is reachable and operable by keyboard alone", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "desktop chrome only");
    await hydratedGoto(page, "/");
    // Tab order through the header: skip link → logo → nav items → Book Now.
    // Assert destinations, not raw tab counts: each stop must be a named element.
    await page.keyboard.press("Tab"); // skip link
    await page.keyboard.press("Tab"); // logo
    for (const label of ["Diving", "Dive Sites", "Courses", "Plan Your Trip", "About"]) {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toHaveText(label);
      await expect(focused).toHaveCSS("outline-style", /^(?!none).*/);
    }
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toHaveText("Book Now");
    // Activate the middle nav item with Enter and confirm real navigation.
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Diving" }).focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/diving$/);
  });

  test("mobile: menu is fully operable by keyboard and closed links stay unreachable", async ({ page, isMobile, browserName }) => {
    test.skip(!isMobile, "mobile chrome only");
    // The header sits outside #main-content, so probe the menu toggle itself.
    await hydratedGoto(page, "/", 'button[aria-controls="mobile-navigation"]');
    // The button's accessible name flips Open/Close when toggled — select it
    // by the nav region it controls instead.
    const toggle = page.locator('button[aria-controls="mobile-navigation"]');
    const mobileNav = page.getByRole("navigation", { name: "Mobile" });

    // Closed menu: its links must not be focusable (inert) — a programmatic
    // focus attempt on one must leave focus on the toggle.
    await toggle.focus();
    await keyboardFocus(page, 'nav[aria-label="Mobile"] a');
    await expect(toggle).toBeFocused();

    // Open with Enter, tab into the menu, activate a link.
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    if (browserName === "webkit") {
      // WebKit mirrors Safari's default where Tab visits form controls only,
      // skipping links (Option+Tab covers them). Assert the open nav is no
      // longer inert and its links can receive focus instead.
      expect(await mobileNav.getAttribute("inert"), "open nav must not be inert").toBeNull();
      await mobileNav.getByRole("link", { name: "Diving" }).focus();
      await expect(mobileNav.getByRole("link", { name: "Diving" })).toBeFocused();
    } else {
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      await expect(focused).toHaveText("Diving");
      const focusInNav = await page.evaluate(() => !!document.activeElement?.closest('nav[aria-label="Mobile"]'));
      expect(focusInNav, "Tab must enter the open mobile nav").toBe(true);
    }

    // Escape closes; focus stays usable and hidden links stay unreachable.
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("Tab");
    const afterClose = await page.evaluate(() => document.activeElement?.closest('nav[aria-label="Mobile"]'));
    expect(afterClose, "focus must not enter the closed mobile nav").toBeNull();
  });

  test("dive site dialog traps focus, closes on Escape, and restores focus to the trigger", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "desktop keyboard interaction");
    await hydratedGoto(page, "/dive-sites");
    const chip = page.getByRole("button", { name: "Tent Reef" });
    await chip.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Focus lands inside the dialog and is trapped.
    const focusInDialog = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
    expect(focusInDialog, "focus must move inside the dialog").not.toBeNull();

    // Tab/Shift+Tab cycle within the dialog: wrap several times without escape.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
      expect(inside, `focus escaped the dialog on Tab #${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Shift+Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'));
      expect(inside, `focus escaped the dialog on Shift+Tab #${i + 1}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(chip).toBeFocused();
  });

  test("contact form is completable and submits by keyboard alone", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative keyboard test on desktop");
    await stubWindowOpen(page);
    await hydratedGoto(page, "/contact", "#name");
    await page.locator("#name").pressSequentially("Keyboard Guest");
    await page.locator("#email").pressSequentially("guest@example.com");
    // Native <select>: selectOption is Playwright's real interaction for it.
    await page.locator("#inquiry-type").focus();
    await page.locator("#inquiry-type").selectOption("general");
    await page.locator("#message").pressSequentially("Interested in diving.");
    await page.getByRole("button", { name: "Send inquiry by WhatsApp" }).focus();
    await page.keyboard.press("Enter");
    const calls = await windowOpenCalls(page);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("wa.me");
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("team carousel does not autoplay when reduced motion is preferred", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative check on desktop-chromium");
    // Fake clock makes the 5s autoplay interval deterministic and instant.
    await page.clock.install();
    await hydratedGoto(page, "/about");
    const track = page.locator('[aria-live="polite"]');
    const initial = await track.evaluate((el) => (el as HTMLElement).style.transform);
    await page.clock.runFor(12000);
    expect(await track.evaluate((el) => (el as HTMLElement).style.transform)).toBe(initial);
  });

  test("team carousel still advances for visitors without the reduced-motion preference", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile || browserName !== "chromium", "representative check on desktop-chromium");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.clock.install();
    await hydratedGoto(page, "/about");
    const track = page.locator('[aria-live="polite"]');
    const initial = await track.evaluate((el) => (el as HTMLElement).style.transform);
    await page.clock.runFor(6000);
    expect(await track.evaluate((el) => (el as HTMLElement).style.transform)).not.toBe(initial);
  });
});
