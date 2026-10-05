import sharp from "sharp";
import { mkdirSync } from "node:fs";

// Before = last pushed state (204b/204d after dirs), after = 204e/after.
const PAIRS = [
  ["review-shots/204b/after/plan-your-trip-768-scrolled.png", "review-shots/204e/after/plan-your-trip-768-scrolled.png", "plan-your-trip-768-scrolled"],
  ["review-shots/204b/after/plan-your-trip-1024-scrolled.png", "review-shots/204e/after/plan-your-trip-1024-scrolled.png", "plan-your-trip-1024-scrolled"],
  ["review-shots/204d/after/home-390-menu-top.png", "review-shots/204e/after/home-390-menu-top.png", "home-390-menu-top"],
  ["review-shots/204d/after/home-390-scrolled.png", "review-shots/204e/after/home-390-scrolled.png", "home-390-scrolled"],
];

mkdirSync("review-shots/204e/compare", { recursive: true });

for (const [b, a, name] of PAIRS) {
  const bm = await sharp(b).metadata();
  const am = await sharp(a).metadata();
  const h = Math.max(bm.height, am.height);
  const br = await sharp(b).resize({ height: h }).toBuffer();
  const ar = await sharp(a).resize({ height: h }).toBuffer();
  const brm = await sharp(br).metadata();
  const arm = await sharp(ar).metadata();
  const gap = 8;
  await sharp({
    create: { width: brm.width + arm.width + gap, height: h, channels: 3, background: "#333" },
  })
    .composite([
      { input: br, left: 0, top: 0 },
      { input: ar, left: brm.width + gap, top: 0 },
    ])
    .png()
    .toFile(`review-shots/204e/compare/${name}.png`);
  console.log("ok", name);
}
