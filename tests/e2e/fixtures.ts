import { test as base, expect } from "@playwright/test";

// Browser tests exercise real pages/hydration, but never contact vendor services.
export const test = base.extend({
  page: async ({ page }, providePage) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (["127.0.0.1", "localhost"].includes(url.hostname)) await route.continue();
      else await route.abort("blockedbyclient");
    });
    await providePage(page);
    expect(errors, "uncaught browser errors").toEqual([]);
  },
});
export { expect };
