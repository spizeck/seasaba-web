import {
  test,
  expect,
  hydratedGoto,
  clickNavLink,
  waitForStableScroll,
  scrollToBottomSettled,
} from "./fixtures";

// Logical scroll-position preservation on viewport resize (issue #140).
//
// Browsers preserve the absolute scrollY offset when a responsive reflow makes
// the document taller. Measured on master (production build, Chromium and
// WebKit): a visitor at the footer of /plan-your-trip resizing 1280→768 kept
// scrollY and ended up ~6100px above the bottom (~61% down); a visitor reading
// the Mixed Groups section of /diving kept scrollY and was displaced ~1400px
// up into the Dive Day / Certification sections as the sticky pill nav wrapped
// and content above reflowed.
//
// The keeper pins the recorded position *during* the reflow — every frame of
// the resize burst — rather than correcting once after a settle delay (the
// first revision visibly displaced content ~1400–4500px for ~180ms before
// snapping back). Assertions here are geometric (distance-from-bottom,
// landmark position, visible section, transient drift), never pixel-position
// matches.

type Geo = {
  docH: number;
  y: number;
  vh: number;
  fromBottom: number;
  footerVisible: boolean;
  hOverflow: number;
};

async function measure(page: import("@playwright/test").Page): Promise<Geo> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const docH = Math.max(doc.scrollHeight, document.body.scrollHeight);
    const footer = document.querySelector("footer");
    const fr = footer ? footer.getBoundingClientRect() : null;
    return {
      docH,
      y: window.scrollY,
      vh: window.innerHeight,
      fromBottom: docH - window.scrollY - window.innerHeight,
      footerVisible: !!fr && fr.top < window.innerHeight && fr.bottom > 0,
      hOverflow: doc.scrollWidth - doc.clientWidth,
    };
  });
}

type Reading = {
  chromeBottom: number;
  /** Viewport top of the tagged landmark (see tagLandmark). */
  landmarkTop: number | null;
  /** landmarkTop - chromeBottom: the offset the keeper preserves. */
  landmarkGap: number | null;
  /** The section containing the reading line just below the chrome. */
  section: string | null;
  navH: number;
  y: number;
};

const CONTENT_SEL = "h1,h2,h3,h4,h5,h6,p,li,figure,img,blockquote,td,th";
const CHROME_SEL = '[class*="sticky"], [class*="fixed"]';

// Replicates the keeper's geometric scan in-page: the bottom edge of
// top-pinned sticky/fixed chrome, then the first semantic content element
// below it (the same element the keeper anchors on).
const probeFns = `(() => {
  const x = window.innerWidth / 2;
  // Same cheap measurement the keeper uses: bottom edge of full-width
  // top-pinned sticky/fixed chrome.
  let chromeBottom = 0;
  for (const el of document.querySelectorAll(${JSON.stringify(CHROME_SEL)})) {
    const r = el.getBoundingClientRect();
    if (
      r.width >= window.innerWidth * 0.8 &&
      r.top <= window.innerHeight * 0.25 &&
      r.bottom <= window.innerHeight * 0.75
    ) {
      chromeBottom = Math.max(chromeBottom, r.bottom);
    }
  }
  let landmark = null;
  const limit = Math.min(window.innerHeight * 0.75, chromeBottom + 480);
  for (let y = chromeBottom + 4; y < limit; y += 4) {
    const stack = document.elementsFromPoint(x, y);
    const top = stack[0];
    if (!top) break;
    if (top.closest(${JSON.stringify(CHROME_SEL)})) continue;
    const hit = stack.find((el) => el.matches(${JSON.stringify(CONTENT_SEL)}))
      ?? top.closest(${JSON.stringify(CONTENT_SEL)});
    if (!(hit instanceof HTMLElement)) continue;
    const r = hit.getBoundingClientRect();
    if (r.height === 0) continue;
    if (r.height > window.innerHeight * 2 && !hit.matches("img,figure")) continue;
    landmark = hit;
    break;
  }
  let section = null;
  for (const s of document.querySelectorAll("main section[id]")) {
    const sr = s.getBoundingClientRect();
    if (sr.top > chromeBottom + 40) break;
    if (sr.bottom > chromeBottom + 40) section = s.id;
  }
  const nav = document.querySelector('nav[aria-label="On this page"]');
  return { landmark, chromeBottom, section,
    navH: nav ? nav.getBoundingClientRect().height : 0,
    y: window.scrollY };
})()`;

// Tag the element the keeper would anchor on, then read its position.
async function tagLandmark(page: import("@playwright/test").Page) {
  return page.evaluate(`(() => {
    const { landmark, chromeBottom, section, navH, y } = ${probeFns};
    document.querySelectorAll("[data-probe-landmark]").forEach((el) =>
      el.removeAttribute("data-probe-landmark")
    );
    if (!landmark) return { chromeBottom, landmarkTop: null, landmarkGap: null, section, navH, y };
    landmark.setAttribute("data-probe-landmark", "1");
    const top = landmark.getBoundingClientRect().top;
    return { chromeBottom, landmarkTop: top, landmarkGap: top - chromeBottom, section, navH, y };
  })()`) as Promise<Reading>;
}

// After the resize, find the tagged element and re-measure.
async function verifyLandmark(page: import("@playwright/test").Page) {
  return page.evaluate(`(() => {
    const { chromeBottom, section, navH, y } = ${probeFns};
    const landmark = document.querySelector("[data-probe-landmark]");
    if (!landmark) return { chromeBottom, landmarkTop: null, landmarkGap: null, section, navH, y };
    const top = landmark.getBoundingClientRect().top;
    return { chromeBottom, landmarkTop: top, landmarkGap: top - chromeBottom, section, navH, y };
  })()`) as Promise<Reading>;
}

// Sample the tagged landmark's viewport top on every frame while stepping
// through the given widths — measures the transient "move away, snap back"
// displacement the UX criterion forbids. Returns the sampled tops.
async function traceLandmarkDuring(
  page: import("@playwright/test").Page,
  widths: number[]
): Promise<number[]> {
  await page.evaluate(() => {
    const lm = document.querySelector("[data-probe-landmark]");
    (window as unknown as { __lmTrace: number[] }).__lmTrace = [];
    if (!lm) return;
    const trace = (window as unknown as { __lmTrace: number[] }).__lmTrace;
    const sample = () => {
      if (lm.isConnected) trace.push(lm.getBoundingClientRect().top);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(30);
  }
  await waitForStableScroll(page);
  return page.evaluate(
    () => (window as unknown as { __lmTrace: number[] }).__lmTrace
  );
}

// The keeper's burst settles 150ms after the last resize/ReflowObserver
// event; 600ms covers settle + the final correction + the scroll it fires.
const SETTLE_WAIT = 600;
// Sub-pixel rounding and reflow jitter around the exact restored distance.
const BOTTOM_TOLERANCE = 24;
// The keeper restores a landmark's gap below the chrome exactly; this covers
// font-load shifts and sub-pixel rounding in re-measurement.
const LANDMARK_TOLERANCE = 60;
// Well clear of the footer region (footer is ~460px tall at desktop widths).
const FOOTER_THRESHOLD_HINT = 1500;
// UX budget for transient landmark drift during a stepped resize. The
// keeper pins per frame, so the only legitimate movement is sticky-chrome
// growth (~34px for a wrapped pill nav) plus a frame of jitter. The previous
// settle-then-correct design displaced content ~1400–4500px for ~180ms —
// this bound catches that regression while allowing real chrome reflow.
const TRANSIENT_TOLERANCE = 150;

test.describe("bottom preservation", () => {
  for (const path of ["/plan-your-trip", "/diving"]) {
    test(`footer visitor stays at the bottom when the window narrows (${path})`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!!isMobile, "desktop window-resize scenario");

      await page.setViewportSize({ width: 1280, height: 800 });
      await hydratedGoto(page, path);
      await scrollToBottomSettled(page);
      const before = await measure(page);
      expect(before.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);

      // 1280→768 crosses lg/md and reflows grids to taller stacks.
      await page.setViewportSize({ width: 768, height: 800 });
      await waitForStableScroll(page);
      const after = await measure(page);

      expect(
        after.docH,
        "expected this transition to make the page taller"
      ).toBeGreaterThan(before.docH + 1000);
      expect(after.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);
      expect(after.footerVisible).toBe(true);
      expect(after.hOverflow).toBeLessThanOrEqual(0);
    });
  }

  test("a footer-region offset is preserved, not snapped to the very end", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/plan-your-trip");
    await page.evaluate(() =>
      window.scrollTo(
        0,
        document.documentElement.scrollHeight - window.innerHeight - 200
      )
    );
    await waitForStableScroll(page);
    const before = await measure(page);
    expect(before.fromBottom).toBeGreaterThan(150);

    await page.setViewportSize({ width: 768, height: 800 });
    await waitForStableScroll(page);
    const after = await measure(page);

    // Same distance from the bottom restored — not 0, not the old scrollY.
    expect(Math.abs(after.fromBottom - before.fromBottom)).toBeLessThanOrEqual(
      BOTTOM_TOLERANCE
    );
  });

  test("widening back keeps the footer visitor at the bottom", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 768, height: 800 });
    await hydratedGoto(page, "/diving");
    await scrollToBottomSettled(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await waitForStableScroll(page);
    const after = await measure(page);

    expect(after.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);
    expect(after.footerVisible).toBe(true);
    expect(after.hOverflow).toBeLessThanOrEqual(0);
  });

  test("a height-only resize never repositions a footer visitor", async ({
    page,
  }) => {
    // Mobile chrome collapse, software keyboards and desktop height drags all
    // fire resize without a layout-width change — the document cannot reflow
    // responsively, so the keeper must leave the scroll offset alone.
    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/plan-your-trip");
    await scrollToBottomSettled(page);
    const before = await measure(page);
    expect(before.fromBottom).toBeLessThanOrEqual(BOTTOM_TOLERANCE);

    await page.setViewportSize({ width: 1280, height: 500 });
    await page.waitForTimeout(SETTLE_WAIT);
    await waitForStableScroll(page);
    const after = await measure(page);

    // No correction: same scroll offset (±sub-pixel rounding), document
    // height unchanged, the visitor just sees less of the page end.
    expect(Math.abs(after.docH - before.docH)).toBeLessThanOrEqual(4);
    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(2);
    expect(after.fromBottom).toBeGreaterThan(150);
  });

  test("a height-only resize never repositions a mid-page visitor", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/diving");
    await page.evaluate(() => window.scrollTo(0, 4000));
    await waitForStableScroll(page);
    const before = await measure(page);

    await page.setViewportSize({ width: 1280, height: 1100 });
    await page.waitForTimeout(SETTLE_WAIT);
    await waitForStableScroll(page);
    const after = await measure(page);

    expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(2);
  });

  test("a mid-page visitor keeps the same content in view", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/plan-your-trip");
    await page.evaluate(() =>
      window.scrollTo(
        0,
        (document.documentElement.scrollHeight - window.innerHeight) / 2
      )
    );
    const before = await tagLandmark(page);
    expect(before.landmarkTop).not.toBeNull();

    await page.setViewportSize({ width: 768, height: 800 });
    await waitForStableScroll(page);
    const after = await verifyLandmark(page);
    const geo = await measure(page);

    // The same element is still at the top of the reading area — the scroll
    // offset may move by the full reflow delta, but the visible content must
    // not change. And the visitor was not pulled toward the bottom.
    expect(after.landmarkTop).not.toBeNull();
    expect(
      Math.abs((after.landmarkGap ?? 0) - (before.landmarkGap ?? 0))
    ).toBeLessThanOrEqual(LANDMARK_TOLERANCE);
    expect(geo.fromBottom).toBeGreaterThan(FOOTER_THRESHOLD_HINT);
  });
});

// The manual failure that widened issue #140's scope: on /diving, resizing
// 1280→768 wraps the sticky section pills to a second row and reflows the
// taller Certification section above — a visitor reading Mixed Groups ends
// up staring at Dive Day / Certification content (measured: the Mixed Groups
// heading drifted ~1400px below its prior viewport position).
test.describe("content landmark preservation", () => {
  // Scroll so a mid-section element of Mixed Groups sits just below the
  // sticky chrome — a visitor halfway through the section, not aligned to
  // its heading.
  async function scrollIntoMixedGroups(
    page: import("@playwright/test").Page
  ) {
    await page.evaluate(() => {
      const sec = document.getElementById("mixed-experience");
      const target = sec?.querySelector("ul li:nth-of-type(2)") ?? sec;
      if (!target) return;
      const docTop = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, docTop - 200);
    });
  }

  for (const [from, to] of [
    [1280, 768],
    [768, 1280],
  ] as const) {
    test(`Mixed Groups keeps its reading position ${from}→${to}`, async ({
      page,
      isMobile,
    }) => {
      test.skip(!!isMobile, "desktop window-resize scenario");

      await page.setViewportSize({ width: from, height: 800 });
      await hydratedGoto(page, "/diving");
      const url = page.url();
      await scrollIntoMixedGroups(page);
      // Let the scroll commit and the keeper sample the landmark.
      await waitForStableScroll(page);
      const before = await tagLandmark(page);
      expect(before.section).toBe("mixed-experience");
      expect(before.landmarkTop).not.toBeNull();

      await page.setViewportSize({ width: to, height: 800 });
      await waitForStableScroll(page);
      const after = await verifyLandmark(page);

      // The sticky pill nav really did reflow — the scenario under test.
      expect(after.navH).not.toBe(before.navH);
      // The visitor is still reading Mixed Groups, not the previous section.
      expect(after.section).toBe("mixed-experience");
      expect(after.landmarkTop).not.toBeNull();
      // Same element, approximately the same viewport position relative to
      // the (resized) chrome — no snapping to the section top.
      expect(
        Math.abs((after.landmarkGap ?? 0) - (before.landmarkGap ?? 0))
      ).toBeLessThanOrEqual(LANDMARK_TOLERANCE);
      // Resize must not mutate the URL.
      expect(page.url()).toBe(url);
    });
  }

  test("a visitor partway through a section keeps that paragraph", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/diving");
    // Deep inside Certification: the long "Not certified yet" card.
    await page.evaluate(() => {
      const el = document
        .getElementById("certification")
        ?.querySelector('a[href="/courses"]');
      if (!el) return;
      const docTop = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, docTop - 200);
    });
    await waitForStableScroll(page);
    const before = await tagLandmark(page);
    expect(before.section).toBe("certification");

    await page.setViewportSize({ width: 768, height: 800 });
    await waitForStableScroll(page);
    const after = await verifyLandmark(page);

    expect(after.section).toBe("certification");
    expect(after.landmarkTop).not.toBeNull();
    expect(
      Math.abs((after.landmarkGap ?? 0) - (before.landmarkGap ?? 0))
    ).toBeLessThanOrEqual(LANDMARK_TOLERANCE);
  });

  // The failure mode the first revision shipped: content visibly drifted
  // ~1400px for ~180ms while the settle timer ran, then snapped back. Final
  // geometry was correct but the interaction was not. This asserts the
  // landmark never leaves a small band around its reading position while
  // the stepped resize is still in flight.
  test("the landmark never visibly drifts away during a stepped resize", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/diving");
    await scrollIntoMixedGroups(page);
    await waitForStableScroll(page);
    const before = await tagLandmark(page);
    expect(before.landmarkTop).not.toBeNull();

    const widths = [1216, 1152, 1088, 1024, 960, 896, 832, 768];
    const tops = await traceLandmarkDuring(page, widths);
    expect(tops.length).toBeGreaterThan(3);

    const drift = Math.max(
      ...tops.map((t) => Math.abs(t - before.landmarkTop!))
    );
    expect(drift).toBeLessThanOrEqual(TRANSIENT_TOLERANCE);

    // And it still ends on the same content.
    const after = await verifyLandmark(page);
    expect(after.section).toBe("mixed-experience");
    expect(
      Math.abs((after.landmarkGap ?? 0) - (before.landmarkGap ?? 0))
    ).toBeLessThanOrEqual(LANDMARK_TOLERANCE);
  });
});

// The homepage has a different semantic structure than the content pages —
// hero, image cards, feature grids — and produced two distinct failures in
// manual testing: landmark positions that drifted and snapped back, and a
// visitor just above the (pre-resize) footer being pinned to the bottom
// because the threshold was measured against the taller post-reflow footer.
test.describe("homepage landmark preservation", () => {
  // Reading positions covering a heading, the responsive image-card grid,
  // and content just above the footer (577px from the end at 1280 — inside
  // the post-reflow 758px footer but outside the 462px pre-reflow one).
  // `frac` is a fraction of max scroll; negative means px above the bottom.
  const positions = [
    { label: "upper sections", frac: 0.25 },
    { label: "image-card grid", frac: 0.66 },
    { label: "just above footer", frac: -577 },
  ];

  for (const { label, frac } of positions) {
    test(`keeps ${label} in view 1280→768`, async ({ page, isMobile }) => {
      test.skip(!!isMobile, "desktop window-resize scenario");

      await page.setViewportSize({ width: 1280, height: 800 });
      await hydratedGoto(page, "/");
      await page.evaluate((f) => {
        const max =
          document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo(0, f >= 0 ? max * f : max + f);
      }, frac);
      await waitForStableScroll(page);
      const before = await tagLandmark(page);
      expect(before.landmarkTop).not.toBeNull();

      await page.setViewportSize({ width: 768, height: 800 });
      await waitForStableScroll(page);
      const after = await verifyLandmark(page);

      // Same element, same gap below the chrome — the visitor never left
      // their content and was not pinned toward the footer.
      expect(after.landmarkTop).not.toBeNull();
      expect(
        Math.abs((after.landmarkGap ?? 0) - (before.landmarkGap ?? 0))
      ).toBeLessThanOrEqual(LANDMARK_TOLERANCE);
      const geo = await measure(page);
      expect(geo.fromBottom).toBeGreaterThan(FOOTER_THRESHOLD_HINT);
    });
  }

  test("no visible displacement while stepping through breakpoints", async ({
    page,
    isMobile,
  }) => {
    test.skip(!!isMobile, "desktop window-resize scenario");

    await page.setViewportSize({ width: 1280, height: 800 });
    await hydratedGoto(page, "/");
    await page.evaluate(() =>
      window.scrollTo(
        0,
        (document.documentElement.scrollHeight - window.innerHeight) * 0.66
      )
    );
    await waitForStableScroll(page);
    const before = await tagLandmark(page);
    expect(before.landmarkTop).not.toBeNull();

    const tops = await traceLandmarkDuring(page, [1152, 1024, 896, 768]);
    const drift = Math.max(
      ...tops.map((t) => Math.abs(t - before.landmarkTop!))
    );
    expect(drift).toBeLessThanOrEqual(TRANSIENT_TOLERANCE);
  });
});

test("no scroll correction fires on initial load", async ({ page }) => {
  await hydratedGoto(page, "/visiting-yachts");
  await page.waitForTimeout(SETTLE_WAIT);
  expect((await measure(page)).y).toBe(0);
});

test("fragment deep links still land on their section", async ({
  page,
  isMobile,
}) => {
  await hydratedGoto(page, "/plan-your-trip#where-to-stay");
  await expect(page.locator("#where-to-stay")).toBeInViewport();

  if (isMobile) return;
  // Resizing while a deep-linked section is on screen must not snap the
  // visitor to the bottom: #where-to-stay sits far above the footer.
  await page.setViewportSize({ width: 768, height: 800 });
  await waitForStableScroll(page);
  const geo = await measure(page);
  expect(geo.fromBottom).toBeGreaterThan(1500);
});

test("back/forward scroll restoration still works", async ({
  page,
  isMobile,
}) => {
  await hydratedGoto(page, "/diving");
  await page.evaluate(() => window.scrollTo(0, 4000));
  // WebKit commits programmatic scrolls asynchronously — wait for the
  // commit before sampling `before`, or the baseline itself is wrong.
  await waitForStableScroll(page);
  const before = await measure(page);
  expect(before.y).toBeGreaterThan(3000);

  await clickNavLink(page, "Dive Sites", isMobile);
  await expect(
    page.getByRole("heading", { name: /dive sites/i }).first()
  ).toBeVisible();

  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Diving with Sea Saba" })
  ).toBeVisible();
  // Browser restores the prior offset; the keeper never runs (no resize).
  // Restoration commits asynchronously — under CPU contention the first
  // reading past 3000 is mid-flight, so poll the real contract (restored
  // ≈ recorded) instead of sampling once after a threshold crossing.
  await expect
    .poll(async () =>
      Math.abs((await measure(page)).y - before.y)
    )
    .toBeLessThan(800);
});
