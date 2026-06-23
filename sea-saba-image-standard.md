# Sea Saba Website — Image Standard & Implementation Spec

## Task for AI coding agent (Devin / Claude Code / etc.)

Implement the image standard and layout components described below across the
Sea Saba Next.js codebase (`seasaba-web`). Where a page already matches a
category's spec, leave it alone. Where it doesn't, refactor it to use the
shared `PageHero` and `MediaRow` components defined in Section 5. If an
existing image asset doesn't meet the crop/ratio requirement for its category,
flag it for re-crop/re-export rather than force-fitting it with CSS — a
stretched or badly-cropped photo is worse than a flagged gap.

This spec assumes Next.js (App Router or Pages Router — adapt accordingly),
`next/image`, and the existing brand tokens already defined in
`THEME_UX_GUIDE.md` (colors, type scale, spacing scale). Don't introduce a new
styling system; match whatever the codebase already uses (CSS Modules,
Tailwind, styled-components) when implementing the snippets below.

---

## 1. Why this exists

The site currently has two image pipelines running side by side:

- **Editorial/marketing images** — pre-optimized, descriptively named, served
  from `/images/optimized/*.webp` (e.g. `divers-above-pinnacle-saba.webp`).
- **Staff, founder, and some operational photos** — raw camera/phone exports
  served from `/images/*.jpg|jpeg` with inconsistent naming
  (`IMG20260425131559.jpg`, `Mel.jpeg`, `Marc&Jeanine.jpg`).

This spec standardizes both the **visual treatment** (aspect ratios, layout)
and the **technical pipeline** (naming, format, optimization) so every image
on the site — present and future — follows one set of rules.

---

## 2. Image categories — overview

| # | Category | Where it appears | Orientation |
|---|---|---|---|
| 1 | Homepage Hero | `/` | Landscape, full immersive |
| 2 | Interior Page Hero | `/diving`, `/dive-sites`, `/courses`, `/about`, `/plan-your-trip` | Landscape, banner |
| 3 | Alternating Media Row | Editorial sections, dive-site areas, owner feature, operational/facility shots | Landscape |
| 4 | Staff Portrait | `/about` — Meet the Crew | **Portrait** (people, not scenery) |
| 5 | Quote/Testimonial Banner | `/about` — Why Divers Love Saba | Landscape, banner |
| 6 | Card Grid Thumbnail | Future: Marine Life grid | Landscape/square |
| 7 | Logo Mark | Nav (all pages) | N/A |
| 8 | Social/OG Image | `<head>` meta | Landscape (fixed) |

**Rule that cuts across every scenic/operational category (1, 2, 3, 5, 6):**
images of place, water, boats, and equipment stay landscape, full stop — even
in a narrower column. Never crop these to portrait; let the column get
narrower and the image's rendered height follow from its ratio. This matches
how premium expedition-travel sites (e.g. Lindblad Expeditions/National
Geographic Expeditions) handle it — their hero crops run 2:1 to 2.9:1, their
in-row feature images run ~4:3 to 1.65:1, and nothing goes portrait anywhere
in their system.

**Category 4 (Staff Portraits) is the deliberate exception** — you're
photographing a person, not a horizon, so a vertical crop is correct there.

---

## 3. Detailed specs per category

### 3.1 Homepage Hero
- No change from current implementation. Full-bleed, landscape (~16:9 to 2:1),
  navbar overlay (translucent + blur, per `THEME_UX_GUIDE.md`).

### 3.2 Interior Page Hero
- `aspect-ratio: 2.4 / 1` desktop, `min-height: 420px`, `max-height: 640px`.
- `aspect-ratio: 4 / 3` mobile, `min-height: 320px`, `max-height: 480px`.
- Use CSS `aspect-ratio`, **not** `vh** units — `vh` is unstable on mobile
  browsers with collapsing address bars and causes layout shift (hurts CLS).
- Breadcrumb moves from its current standalone line into a small translucent
  pill, top-left, sitting under the nav and inside the hero composition —
  not a separate bar above the image.
- Title (H1) + subtitle overlay directly on the image per existing hero rules
  (local gradient or text-shadow behind text only, no full-image filter).

### 3.3 Alternating Media Row
The core reusable pattern for editorial sections, the five dive-site area
blocks, the owner/founder feature, and operational/facility shots (boats,
harbor, gear, training photos).

- Desktop: `grid-template-columns: 2fr 1fr`, `gap: 56px`,
  `align-items: center`.
- Alternate image side row-to-row (left on odd rows, right on even rows).
- Image: `aspect-ratio: 4 / 3`, `object-fit: cover`.
- Mobile: single column, image full-bleed edge-to-edge at `aspect-ratio: 4/3`,
  text below with normal page padding.
- Any CTA link for the row lives inside the text column, directly under the
  paragraph — never as a separate block under the full row.

### 3.4 Staff Portrait
- `aspect-ratio: 4 / 5` for every crew member, no exceptions.
- Consistent framing: head-and-shoulders, similar camera distance and zoom
  across the whole set, so the "Meet the Crew" grid doesn't look patchwork.
- Consistent background: prefer outdoor on-premises settings (boat deck,
  harbor) over a mix of indoor/outdoor/random phone snapshots.
- Natural light, consistent white balance across the set.
- The owner/founder family photo (Chad & Katy) is **not** in this category —
  treat it as a Media Row (3.3) since it's a wider lifestyle shot, not a
  headshot.

### 3.5 Quote/Testimonial Banner
- New small component, similar to the Interior Page Hero but shorter:
  `aspect-ratio: 3 / 1`, `min-height: 280px`, `max-height: 420px`.
- Text sits on top via a local gradient/scrim behind the text block only —
  same rule as hero overlays.

### 3.6 Card Grid Thumbnail (future — Marine Life grid)
- Not yet built (called for in `THEME_UX_GUIDE.md` homepage section order #4).
- When built: `aspect-ratio: 1 / 1` tiles, species-centered framing, calm/
  uncluttered backgrounds so the grid reads as a coherent set.

### 3.7 Logo Marks
- White transparent logo (`White SEA SABA logo transparent.png`) — used only
  over imagery / dark or translucent nav backgrounds (homepage hero).
- Full-color logo (`Full color SEA SABA logo transparent.png`) — used on
  solid light nav backgrounds (all interior pages).
- Prefer SVG if/when available; keep PNG as fallback.
- Maintain clear space around the mark roughly equal to its own height.

### 3.8 Social/OG Image
- Keep `1200×630`. Currently one generic `og-image.jpg` is reused across every
  page — fine for now; per-page OG images is a nice-to-have, not required by
  this spec.

---

## 4. File naming & optimization pipeline

- **Every** image — including staff and operational photos currently outside
  the pipeline — gets converted to WebP and served from
  `/images/optimized/`.
- Naming: lowercase kebab-case, descriptive:
  `[subject]-[location-or-context]-saba.webp`
  (matches existing good examples like `divers-above-pinnacle-saba.webp`).
- Staff portraits: `firstname-lastname.webp` (e.g. `otto.webp`,
  `marc-and-jeanine.webp`).
- Migrate these specific files out of raw `/images/*.jpg|jpeg` and into the
  optimized pipeline with proper names:
  `IMG20260425131559.jpg`, `Mel.jpeg`, `Marc&Jeanine.jpg`, `Otto.jpg`,
  `Aaron.jpeg`, `Lenny.jpg`, `Robins.jpg`, `Lynn.jpeg`, `Lionel.jpeg`,
  `Anthony.jpeg`, `Julijana.jpeg`, `20210704_094402.jpg`, `FortBay2Boats.jpg`,
  `Saba-186.jpg`, `diver-in-trim.jpg`, `students.jpg`, `rental-bcd.jpg`.
- Keep original/source files in a non-deployed folder (not under `/public`).
- Keep existing `q=75` quality setting — matches current pipeline.

---

## 5. Components to build

### `PageHero`

```tsx
type PageHeroProps = {
  image: string;
  alt: string;
  title: string;
  subtitle?: string;
  breadcrumb: { label: string; href?: string }[];
};

export function PageHero({ image, alt, title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="page-hero">
      <Image src={image} alt={alt} fill style={{ objectFit: "cover" }} priority />
      <div className="page-hero__overlay">
        <nav className="page-hero__breadcrumb">
          {breadcrumb.map((b, i) => (
            <span key={i}>
              {b.href ? <a href={b.href}>{b.label}</a> : b.label}
              {i < breadcrumb.length - 1 && " / "}
            </span>
          ))}
        </nav>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  );
}
```

```css
.page-hero {
  position: relative;
  aspect-ratio: 2.4 / 1;
  min-height: 420px;
  max-height: 640px;
}
.page-hero__breadcrumb {
  display: inline-block;
  background: rgba(11, 15, 59, 0.45); /* Abyss Navy, translucent */
  backdrop-filter: blur(8px);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 14px;
  color: #fff;
}
@media (max-width: 768px) {
  .page-hero { aspect-ratio: 4 / 3; min-height: 320px; max-height: 480px; }
}
```

### `MediaRow`

```tsx
type MediaRowProps = {
  image: string;
  alt: string;
  reverse?: boolean;
  children: React.ReactNode; // heading, paragraph, CTA
};

export function MediaRow({ image, alt, reverse = false, children }: MediaRowProps) {
  return (
    <div className={`media-row ${reverse ? "media-row--reverse" : ""}`}>
      <div className="media-row__image">
        <Image src={image} alt={alt} width={1200} height={900} style={{ objectFit: "cover" }} />
      </div>
      <div className="media-row__text">{children}</div>
    </div>
  );
}
```

```css
.media-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 56px;
  align-items: center;
  padding: 80px 0;
}
.media-row--reverse { direction: rtl; }
.media-row--reverse > * { direction: ltr; }
.media-row__image img { aspect-ratio: 4 / 3; object-fit: cover; width: 100%; }

@media (max-width: 768px) {
  .media-row { grid-template-columns: 1fr; gap: 24px; padding: 48px 0; }
}
```

---

## 6. Page-level migration tasks

- **`/diving`** — Wrap the standalone images (`guests-on-bow-saba.webp`,
  `green-turtle-seagrass-divers.webp`) into `MediaRow` instances alongside
  their adjacent section copy ("The Sea Saba Experience", "Dive More. Save
  More."). Update the page hero to `PageHero`.
- **`/dive-sites`** — Convert each of the five area blocks (Pinnacles, Tent
  Reef, Ladder Bay, Wells Bay, Windwardside) into `MediaRow` instances,
  alternating starting with image-left for The Pinnacles. Move each
  "Explore [Area] sites →" link inside its text column. Update the page hero
  to `PageHero`.
- **`/about`** — Wrap "Meet the Owners" (Chad & Katy) and "Our Home in Fort
  Bay Harbor" in `MediaRow`. Build the new `QuoteBanner` component (3.5) for
  "Why Divers Love Saba." Migrate all crew images per Section 4 and apply the
  4:5 portrait crop. Update the page hero to `PageHero`.
- **`/courses`** — Apply `MediaRow` to the standalone `students.jpg` /
  `rental-bcd.jpg` pairing and `diver-in-trim.jpg` hero section. Update the
  page hero to `PageHero`.
- Apply the same pattern to any other standalone full-width image found
  site-wide outside of true hero/banner moments.

---

## 7. Acceptance criteria

- [ ] No standalone full-width image sits between two text blocks anywhere
      on the site except a true hero or `QuoteBanner` moment.
- [ ] All hero treatments use CSS `aspect-ratio`, not `vh`.
- [ ] `MediaRow` alternates sides correctly and stacks cleanly on mobile.
- [ ] No scenic/operational image is cropped to portrait anywhere.
- [ ] All staff portraits share the same 4:5 crop and framing.
- [ ] Every deployed image — including the previously raw staff/operational
      files — is served as WebP from `/images/optimized/` with a kebab-case
      descriptive filename.
- [ ] No image-load layout shift (verify via Lighthouse CLS).
