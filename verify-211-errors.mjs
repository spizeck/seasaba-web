import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

// #211 follow-up: the support-request form dropped permanently reserved
// error slots — errors now mount on demand. Verify the untouched form is
// compact again and that appearing errors only grow their own field group.
// Shots -> review-shots/211-errors/.
const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const OUT = process.env.OUT ?? "review-shots/211-errors/";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

const hideCookiebot = async (page) => {
  await page.addStyleTag({
    content: "[id^='CybotCookiebot'],[id*='Cookiebot']{display:none!important}",
  }).catch(() => {});
};

const openDonate = async (page) => {
  await page.goto(BASE + "/donate", { waitUntil: "load" });
  await page.waitForSelector("#sr-name");
  await page.waitForTimeout(800);
  await hideCookiebot(page);
};

// Bounding-box metrics for the error-slot question: element presence and
// the vertical gap between consecutive field rows.
const rhythm = () => {
  const rows = ["#sr-name", "#sr-email", "#sr-category", "#sr-amount", "#sr-request"];
  const slots = [...document.querySelectorAll('[id$="-error"]')].map((el) => el.id);
  const gaps = [];
  for (let i = 0; i + 1 < rows.length; i++) {
    const a = document.querySelector(rows[i]);
    const b = document.querySelector(rows[i + 1]);
    if (a && b) gaps.push(Math.round(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom));
  }
  const form = document.querySelector("#sr-name")?.closest("form");
  return { mountedErrorIds: slots, rowGaps: gaps, formHeight: form ? Math.round(form.getBoundingClientRect().height) : null };
};

// Fill every required field except the support-type checkbox group, so the
// group error is the only one left after submit.
const fillAllButTypes = async (page) => {
  await page.locator("#sr-name").fill("Visual Check");
  await page.locator("#sr-email").fill("visual@example.test");
  await page.locator("#sr-category").selectOption("youth");
  await page.locator("#sr-request").fill("Sponsorship of team uniforms");
  await page.locator("#sr-description").fill("A youth football season for island kids.");
  await page.locator("#sr-beneficiaries").fill("About 30 kids aged 8-14");
  await page.locator("#sr-timing").fill("October 2026");
  await page.locator("#sr-use").fill("Uniforms and league fees");
  await page.locator("#sr-ack").check();
};

// ---- Desktop -------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await openDonate(page);
  const form = page.locator("form").filter({ has: page.locator("#sr-name") }).first();
  await form.scrollIntoViewIfNeeded();
  console.log("desktop untouched:", JSON.stringify(await page.evaluate(rhythm)));
  await page.screenshot({ path: `${OUT}desktop-untouched.png` });
  await form.screenshot({ path: `${OUT}desktop-untouched-form.png` });

  await page.getByRole("button", { name: "Send request" }).click();
  await page.waitForSelector("#sr-types-error");
  await page.waitForTimeout(300);
  console.log("desktop invalid:", JSON.stringify(await page.evaluate(rhythm)));
  await page.screenshot({ path: `${OUT}desktop-invalid.png` });
  await form.screenshot({ path: `${OUT}desktop-invalid-form.png` });

  // Partially corrected: fix name + email, leave the rest invalid.
  await page.locator("#sr-name").fill("Visual Check");
  await page.locator("#sr-email").fill("visual@example.test");
  await page.waitForTimeout(300);
  console.log("desktop partial:", JSON.stringify(await page.evaluate(rhythm)));
  await form.screenshot({ path: `${OUT}desktop-partial-form.png` });
  await page.close();
}

// ---- Mobile --------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await openDonate(page);
  const form = page.locator("form").filter({ has: page.locator("#sr-name") }).first();
  await form.scrollIntoViewIfNeeded();
  console.log("mobile untouched:", JSON.stringify(await page.evaluate(rhythm)));
  await page.screenshot({ path: `${OUT}mobile-untouched.png` });

  await page.getByRole("button", { name: "Send request" }).click();
  await page.waitForSelector("#sr-types-error");
  await page.waitForTimeout(300);
  console.log("mobile invalid:", JSON.stringify(await page.evaluate(rhythm)));
  await page.screenshot({ path: `${OUT}mobile-invalid.png` });
  await page.close();
}

// Checkbox-group error in isolation (mobile + desktop).
for (const [w, h, tag] of [[390, 844, "mobile"], [1440, 1000, "desktop"]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await openDonate(page);
  await fillAllButTypes(page);
  await page.getByRole("button", { name: "Send request" }).click();
  await page.waitForSelector("#sr-types-error");
  await page.waitForTimeout(300);
  const fieldset = page.locator("fieldset");
  await fieldset.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}${tag}-types-error.png` });
  console.log(`${tag} group error:`, JSON.stringify(await page.evaluate(rhythm)));
  await page.close();
}

await browser.close();
console.log("done");
