/**
 * Image optimization script — run once with: node scripts/optimize-images.mjs
 * Converts all source images to WebP, resizes to appropriate dimensions,
 * and outputs to public/images/optimized/
 */

import sharp from "sharp";
import { mkdir, stat } from "fs/promises";
import { join } from "path";

const SRC = "public/images";
const OUT = "public/images/optimized";

await mkdir(OUT, { recursive: true });

/**
 * Map: original filename → { outName, width, quality, role }
 * role: hero | section | card
 */
const IMAGE_MAP = [
  // Nurse shark — Ladder Bay section photo
  {
    src: "nurse-shark.jpg",
    out: "nurse-shark-ladder-bay-saba.webp",
    width: 1920,
    quality: 82,
    role: "section",
  },

  // New dive-site section photos (6000px source → 1920px output)
  {
    src: "DSC03050.jpg",
    out: "wells-bay-dive-site-saba.webp",
    width: 1920,
    quality: 82,
    role: "section",
  },
  {
    src: "DSC03271.jpg",
    out: "windwardside-dive-site-saba.webp",
    width: 1920,
    quality: 82,
    role: "section",
  },

  // Interior page heroes — output at source max (2268px) for full-bleed at ultra-wide
  {
    src: "PXL_20260328_191645999.jpg",
    out: "diving-hero.webp",
    width: 2268,
    quality: 85,
    role: "hero",
  },
  {
    src: "IMG-20240131-WA0003.jpeg",
    out: "courses-hero.webp",
    width: 2268,
    quality: 85,
    role: "hero",
  },

  // Homepage hero — 1920px wide
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
    src: "the-road.jpg",
    out: "saba-the-road.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "colibri-cafe.jpg",
    out: "colibri-cafe-saba.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "island-paradise-cafe.jpg",
    out: "island-paradise-cafe-saba.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "glass-art.jpg",
    out: "saba-glass-art.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "saba-ladder.jpg",
    out: "saba-ladder-bay.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "hiking-signs.jpg",
    out: "saba-hiking-signs.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "sunset-cruise.JPG",
    out: "saba-sunset-cruise.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "indigo.jpeg",
    out: "saba-indigo-arts.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "paint.jpeg",
    out: "saba-paint-arts.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "beads.jpeg",
    out: "saba-beads-jewelry.webp",
    width: 1200,
    quality: 82,
    role: "section",
  },
  {
    src: "turtle-at-surface.jpg",
    out: "saba-snorkeling.webp",
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

  // Staff portraits — 800px wide, 4:5 crop handled in-browser via objectPosition
  { src: "Mel.jpeg",                out: "mel.webp",                   width: 800,  quality: 82, role: "portrait" },
  { src: "Marc&Jeanine.jpg",        out: "marc-and-jeanine.webp",      width: 800,  quality: 82, role: "portrait" },
  { src: "Otto.jpg",                out: "otto.webp",                  width: 800,  quality: 82, role: "portrait" },
  { src: "Aaron.jpeg",              out: "aaron.webp",                 width: 800,  quality: 82, role: "portrait" },
  { src: "Lenny.jpg",               out: "lenny.webp",                 width: 800,  quality: 82, role: "portrait" },
  { src: "Robins.jpg",              out: "robins.webp",                width: 800,  quality: 82, role: "portrait" },
  { src: "Lynn.jpeg",               out: "lynn.webp",                  width: 800,  quality: 82, role: "portrait" },
  { src: "Lionel.jpeg",             out: "lionel.webp",                width: 800,  quality: 82, role: "portrait" },
  { src: "Anthony.jpeg",            out: "anthony.webp",               width: 800,  quality: 82, role: "portrait" },
  { src: "Julijana.jpeg",           out: "julijana.webp",              width: 800,  quality: 82, role: "portrait" },
  { src: "20210704_094402.jpg",     out: "gunner-dive-dog.webp",       width: 800,  quality: 82, role: "portrait" },

  // Operational / facility — section size
  { src: "IMG20260425131559.jpg",   out: "chad-and-katy-nuttall.webp", width: 1400, quality: 82, role: "section" },
  { src: "FortBay2Boats.jpg",       out: "fort-bay-two-boats.webp",    width: 1400, quality: 82, role: "section" },
  { src: "Saba-186.jpg",            out: "saba-volcanic-scenery.webp", width: 1400, quality: 82, role: "section" },

  // Course page images — section size
  { src: "diver-in-trim.jpg",       out: "diver-in-trim.webp",         width: 1400, quality: 82, role: "section" },
  { src: "students.jpg",            out: "students-instruction.webp",  width: 1200, quality: 82, role: "section" },
  { src: "rental-bcd.jpg",          out: "rental-bcd-equipment.webp",  width: 1200, quality: 82, role: "section" },

  // Hotel modal photos — card size (800px wide)
  { src: "el-momo.jpg",       out: "el-momo-cottages.webp",  width: 800, quality: 82, role: "card" },
  { src: "julianas.jpg",      out: "julianas-hotel.webp",    width: 800, quality: 82, role: "card" },
  { src: "cottage-club.jpg",  out: "cottage-club.webp",      width: 800, quality: 82, role: "card" },
  { src: "scenery-hotel.jpg", out: "scenery-hotel.webp",     width: 800, quality: 82, role: "card" },

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
    .rotate()                                          // bake EXIF orientation before resize
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
