import {
  test,
  expect,
  hydratedGoto,
  expectNoAxeViolations,
} from "./fixtures";

// Dutch Phase 1 drafts (#151). These routes exist in source but must never
// render in production. In a normal `next build` + `next start` run (what CI
// does) every /nl route must 404. A build made with
// NEXT_PUBLIC_DRAFT_LOCALE_PREVIEW=1 — or `next dev` — serves them for human
// language review; in that mode this spec asserts the draft pages render
// Dutch, carry lang="nl", and pass axe.

const DRAFT_ROUTES = [
  "/nl",
  "/nl/diving",
  "/nl/plan-your-trip",
  "/nl/courses",
  "/nl/contact",
  "/nl/book",
];

test.describe("Dutch draft pages (#151)", () => {
  test("draft routes render Dutch and pass axe in preview, or 404 in production", async ({
    page,
    request,
    isMobile,
    browserName,
  }) => {
    test.skip(
      isMobile || browserName !== "chromium",
      "representative scan on desktop-chromium",
    );

    const probe = await request.get("/nl");
    if (probe.status() === 404) {
      // Production build: every drafted route must stay dark.
      for (const path of DRAFT_ROUTES) {
        const response = await request.get(path);
        expect(response.status(), path).toBe(404);
      }
      return;
    }

    // Draft preview build: drafts render in the Dutch shell.
    for (const path of DRAFT_ROUTES) {
      await hydratedGoto(page, path);
      await expect(page.locator("html")).toHaveAttribute("lang", "nl");
      await expectNoAxeViolations(page);
    }
  });

  test("language selection lives in the header, drafts clearly marked (#156)", async ({
    page,
    request,
    isMobile,
  }) => {
    const probe = await request.get("/nl");
    test.skip(probe.status() === 404, "draft preview disabled");

    await hydratedGoto(page, "/diving", "#main-content");
    if (isMobile) {
      // Mobile: inside the hamburger menu, below the Book Now CTA.
      await page.getByRole("button", { name: "Open menu" }).click();
      const mobileNav = page.getByRole("navigation", { name: "Mobile" });
      const group = mobileNav.getByRole("navigation", { name: "Choose language" });
      await expect(group).toBeVisible();
      await expect(group.getByText("English")).toBeVisible();
      await expect(
        group.getByRole("link", { name: /Nederlands \(draft\)/ })
      ).toHaveAttribute("href", "/nl/diving");
    } else {
      // Desktop: compact disclosure beside the primary nav / Book Now.
      const button = page
        .getByRole("navigation", { name: "Primary" })
        .getByRole("button", { name: "Choose language" });
      await expect(button).toHaveAttribute("aria-expanded", "false");
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const menu = page.getByRole("navigation", { name: "Choose language" });
      await expect(menu.getByText("English")).toBeVisible();
      const nl = menu.getByRole("link", { name: /Nederlands \(draft\)/ });
      await expect(nl).toHaveAttribute("href", "/nl/diving");
      await expect(nl).toHaveAttribute("hreflang", "nl");
      // Keyboard: Escape closes and focus returns to the trigger.
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(button).toBeFocused();
    }
  });

  test("Dutch contact form preserves query-param and inquiry behavior", async ({
    page,
    request,
  }) => {
    const probe = await request.get("/nl");
    test.skip(probe.status() === 404, "draft preview disabled");

    await hydratedGoto(page, "/nl/contact?interest=tdi-technical", "#name");
    // The English inquiry slug must survive into the form's canonical value.
    const inquiry = page.locator("#inquiry-type");
    if (await inquiry.count()) {
      await expect(inquiry).toHaveValue("tdi-technical");
    }
  });
});
