import { test, expect, hydratedGoto } from "./fixtures";

test("desktop: primary navigation, logo, and Book Now reach their destinations", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop chrome only");
  await hydratedGoto(page, "/about", "#main-content");

  await page.getByRole("link", { name: "Sea Saba logo" }).click();
  await expect(page).toHaveURL(/\/$/);

  for (const [name, path] of [
    ["Diving", "/diving"], ["Dive Sites", "/dive-sites"], ["Courses", "/courses"],
    ["Plan Your Trip", "/plan-your-trip"], ["About", "/about"],
  ] as const) {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator("h1").first()).toBeVisible();
  }

  await page.getByRole("link", { name: "Book Now" }).click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
});

test("mobile: menu opens, closes, navigates, and responds to repeated use and Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile chrome only");
  await hydratedGoto(page, "/", "#main-content");
  const toggle = page.getByRole("button", { name: "Open menu" });
  const mobileNav = page.getByRole("navigation", { name: "Mobile" });

  // Closed by default: aria-expanded reports the collapsed state.
  await expect(toggle).toHaveAttribute("aria-expanded", "false");

  // Open and navigate via a nav link; menu auto-closes.
  await toggle.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
  await mobileNav.getByRole("link", { name: "Diving" }).click();
  await expect(page).toHaveURL(/\/diving$/);
  await expect(page.getByRole("heading", { name: "Diving with Sea Saba" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");

  // Repeated use: open again, close with Escape.
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");

  // Book Now path.
  await page.getByRole("button", { name: "Open menu" }).click();
  await mobileNav.getByRole("link", { name: "Book Now" }).click();
  await expect(page).toHaveURL(/\/book$/);
  await expect(page.getByRole("heading", { name: "Book Your Dive" })).toBeVisible();
});

test("footer and contact page expose working phone, WhatsApp, email, and map paths", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "link-target assertions only need one browser");
  await hydratedGoto(page, "/contact", "#main-content");
  const footer = page.getByRole("contentinfo");

  await expect(footer.getByRole("link", { name: /^Phone:/ })).toHaveAttribute("href", "tel:+5994162246");
  await expect(footer.getByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", /wa\.me\/5994162246/);
  await expect(footer.getByRole("link", { name: "info@seasaba.com" })).toHaveAttribute("href", "mailto:info@seasaba.com");
  await expect(page.getByRole("link", { name: /Open Sea Saba in Google Maps/ })).toHaveAttribute("href", /google\.com\/maps/);
  await expect(page.getByRole("link", { name: /Open Sea Saba in Apple Maps/ })).toHaveAttribute("href", /maps\.apple\.com/);

  for (const name of ["Instagram", "Facebook", "YouTube", "TripAdvisor", "Google Reviews"]) {
    const link = footer.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", /^https:\/\//);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
  }
});
