/**
 * Image optimization script — run once with: node scripts/optimize-images.mjs
 * Converts all source images to WebP, resizes to appropriate dimensions,
 * and outputs to public/images/optimized/
 */

import sharp from "sharp";
import { readdir, mkdir, stat } from "fs/promises";
import { join, basename } from "path";

const SRC = "public/images";
const OUT = "public/images/optimized";

await mkdir(OUT, { recursive: true });

/**
 * Map: original filename → { outName, width, quality, role }
 * role: hero | section | card
 */
const IMAGE_MAP = [
  // Hero — 1920px wide
  {
    src: "heroimage.jpg",
    out: "divers-above-reef-saba.webp",
    width: 1920,
    quality: 82,
    role: "hero",
  },
  {
    src: "SabaHarborAerial.jpg",
    out: "saba-island-aerial-golden-hour.webp",
    width: 1920,
    quality: 82,
    role: "hero",
  },

  // Section images — 1400px wide
  {
    src: "DSC03073.jpg",
    out: "diver-volcanic-pinnacle-saba.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "DSC03063.jpg",
    out: "green-turtle-tent-reef.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "CandiceLandauLobster.jpg",
    out: "spiny-lobster-ladder-bay.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "CandiceLandauPinnacleSquare.jpg",
    out: "divers-above-pinnacle-saba.webp",
    width: 1000,
    quality: 82,
    role: "section",
  },
  {
    src: "FTDiamondRock.jpg",
    out: "fin-and-tonic-boat-diamond-rock.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "Saba-200.jpg",
    out: "windwardside-village-saba.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },

  // Plan Your Trip section images — 1200px wide
  {
    src: "Saba-003.jpg",
    out: "juancho-airport-approach-saba.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "DSC03336.jpg",
    out: "reef-shark-saba-marine-park.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "CandiceLandau096.jpg",
    out: "green-turtle-with-diver-saba.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "Saba-146.jpg",
    out: "fort-bay-harbor-saba.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "SabaTidePools.jpg",
    out: "saba-volcanic-coastline.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },

  // About page hero
  {
    src: "Saba-118.jpg",
    out: "saba-118-about-hero.webp",
    width: 1920,
    quality: 82,
    role: "hero",
  },

  // Unused but in folder — convert at section size
  {
    src: "DSC03031.jpg",
    out: "green-turtle-seagrass-divers.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "DSC03348.jpg",
    out: "reef-shark-pinnacle.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "CandiceLandauPinnacle.jpg",
    out: "divers-above-coral-pinnacle-saba.webp",
    width: 1400,
    quality: 82,
    role: "section",
  },
  {
    src: "Saba-024.jpg",
    out: "saba-024.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "Saba-076.jpg",
    out: "saba-076.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
];

const rows = [];

for (const item of IMAGE_MAP) {
  const srcPath = join(SRC, item.src);
  const outPath = join(OUT, item.out);

  let srcStat;
  try {
    srcStat = await stat(srcPath);
  } catch {
    console.warn(`  SKIP (not found): ${item.src}`);
    rows.push({ src: item.src, out: item.out, status: "NOT FOUND" });
    continue;
  }

  const meta = await sharp(srcPath).metadata();
  await sharp(srcPath)
    .resize({ width: item.width, withoutEnlargement: true })
    .webp({ quality: item.quality })
    .toFile(outPath);

  const outStat = await stat(outPath);
  const reduction = (((srcStat.size - outStat.size) / srcStat.size) * 100).toFixed(1);

  rows.push({
    src: item.src,
    out: item.out,
    role: item.role,
    origW: meta.width,
    origH: meta.height,
    targetW: item.width,
    origKB: Math.round(srcStat.size / 1024),
    outKB: Math.round(outStat.size / 1024),
    reduction: `${reduction}%`,
    status: "OK",
  });

  console.log(`  ✓ ${item.src} → ${item.out} | ${Math.round(srcStat.size/1024)}KB → ${Math.round(outStat.size/1024)}KB (${reduction}% saved)`);
}

// Print report table
console.log("\n=== OPTIMIZATION REPORT ===\n");
console.log(
  "Source".padEnd(36) +
  "Output".padEnd(46) +
  "OrigKB".padStart(8) +
  "OutKB".padStart(8) +
  "Saved".padStart(8)
);
console.log("-".repeat(110));
for (const r of rows) {
  if (r.status === "NOT FOUND") {
    console.log(`  [NOT FOUND] ${r.src}`);
    continue;
  }
  console.log(
    r.src.padEnd(36) +
    r.out.padEnd(46) +
    String(r.origKB).padStart(8) +
    String(r.outKB).padStart(8) +
    r.reduction.padStart(8)
  );
}
