import { expect } from "@playwright/test";
import { test, hydratedGoto } from "./fixtures";

const jsonLd = async (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((script) =>
      JSON.parse(script.textContent ?? "{}"),
    ),
  );

test.describe("staff biography pages", () => {
  test("render approved biographies with SEO metadata, breadcrumbs, and internal CTAs", async ({ page }) => {
    await hydratedGoto(page, "/about/jake-mulford");

    await expect(page.getByRole("heading", { name: "Jake Mulford", exact: true })).toBeVisible();
    await expect(page.getByText("Born in South Florida and raised in North Carolina").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "← Back to Meet the Crew" })).toHaveAttribute("href", "/about#meet-the-crew");
    await expect(page.getByRole("link", { name: "Book Diving" })).toHaveAttribute("href", "/book");
    await expect(page.getByRole("link", { name: "View Diving Options" })).toHaveAttribute("href", "/diving#dive-options");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://www.seasaba.com/about/jake-mulford");
    await expect(page).toHaveTitle(/Jake Mulford, Scuba Instructor/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /Born in South Florida/);

    const person = (await jsonLd(page)).find((block) => block["@type"] === "Person");
    expect(person).toMatchObject({
      "@id": "https://www.seasaba.com/about/jake-mulford#person",
      name: "Jake Mulford",
      jobTitle: "Scuba Instructor",
      url: "https://www.seasaba.com/about/jake-mulford",
      mainEntityOfPage: "https://www.seasaba.com/about/jake-mulford",
    });
    expect(person.worksFor["@id"]).toBe("https://www.seasaba.com/#business");
    await expect(page.getByText("Professional qualifications")).toBeVisible();
    await expect(page.getByText("Favorite Saba dive sites")).toBeHidden();
  });

  test("render established crew biographies and languages on desktop and mobile", async ({ page }) => {
    await hydratedGoto(page, "/about/lilian-caro");
    await expect(page.getByRole("heading", { name: "Lilian Caro", exact: true })).toBeVisible();
    await expect(page.getByText("Born in Colombia").first()).toBeVisible();
    await expect(page.getByText("A little Portuñol")).toBeVisible();

    await page.setViewportSize({ width: 375, height: 800 });
    await hydratedGoto(page, "/about/otto-de-vries");
    await expect(page.getByRole("heading", { name: "Otto de Vries", exact: true })).toBeVisible();
    await expect(page.getByAltText("Otto de Vries, Head Boat Captain & Dive Instructor at Sea Saba")).toBeVisible();
    await expect(page.getByText("Technical diving").first()).toBeVisible();
  });

  test("owner profiles remain linked and unknown profiles are genuine 404s", async ({ page, monitor }) => {
    await hydratedGoto(page, "/about/chad-nuttall");
    await expect(page.getByRole("heading", { name: "Chad Nuttall", exact: true })).toBeVisible();
    await expect(page.getByText("Together, Chad and Katy oversee daily operations")).toBeVisible();

    monitor.allowConsoleError(/about\/jeanine-marc/);
    monitor.allowRequestFailure(/about\/jeanine-marc/);
    const response = await page.goto("/about/jeanine-marc");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });
});
