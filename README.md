# Sea Saba — Professional Scuba Diving Website

A fast, SEO-first, destination-led marketing website for Sea Saba, a professional scuba diving operation on the island of Saba in the Dutch Caribbean.

This project is a migration from Wix to a custom Next.js stack.

The website is intentionally designed as a **premium, destination-first marketing site**, not a generic dive shop catalog.  
The homepage is a **positioning + routing page**, while inner pages carry the SEO-rich informational depth.

---

## Core Strategy

The site should communicate:

- Why dive **Saba**
- Why choose **Sea Saba**
- What experiences are available
- How to take the next step

### Strategic Principles
- **Destination-first** — sell Saba as a unique diving destination
- **Experience-led** — emphasize boat diving, signature sites, and trip planning
- **Trust-first** — calm, professional, safety-forward
- **SEO-first** — semantic, indexable, stable content architecture
- **Conversion-ready** — clear routing and strong Checkfront booking paths

This is **not** intended to be a retail-heavy or generic dive shop template.

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Content:** MDX for marketing / informational / dive site pages
- **Dynamic Data:** Firestore (testimonials, reviews, staff profiles, operational data)
- **Booking:** Checkfront (deep links, embedded widgets, availability API)
- **Deployment:** Vercel

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## Layout Rules (Critical)

There are exactly **two** layouts in this project:

### 1. Homepage Layout
- Static hero image at top
- One homepage video background section (3rd major section)
- Minimal copy
- Destination positioning + routing
- Strong but restrained CTA hierarchy

### 2. Standard Content Layout
- Used for all non-home pages
- No video backgrounds
- Text-first, SEO-focused
- Breadcrumbs encouraged
- Semantic, content-rich, stable

Do not introduce additional layouts unless explicitly requested.

---

## Homepage Rules (Critical)

The homepage must follow this high-level structure:

1. **Hero (Static Image)**
2. **Supporting Static Section**
3. **Single Video Section + CTA**
4. **Static Routing Sections**
5. **Final CTA**

### Homepage Intent
The homepage should answer:

1. Why dive Saba?
2. Why Sea Saba?
3. What can I choose?
4. Where do I go next?

### Important Notes
- The homepage is **not** a content dump
- The homepage is **not** the primary SEO text page for every topic
- Detailed content belongs on inner pages
- Motion is minimal and only used on the homepage
- Mobile video must degrade to a poster image

---

## Project Structure

```text
app/
├── layout.tsx                     # Root layout (header, footer, fonts, SEO, JSON-LD)
├── page.tsx                       # Homepage (5-section destination-first layout)
├── not-found.tsx                  # Custom 404 page
├── book/page.tsx                  # Booking page (Checkfront widget + fallback)
├── (content)/                     # Standard content layout group
│   ├── layout.tsx                 # Content layout (breadcrumbs, prose, SEO-first)
│   ├── about/
│   ├── diving/
│   ├── dive-sites/
│   ├── courses/
│   ├── plan-your-trip/
│   └── contact/
components/
├── ui/                            # shadcn/ui components
├── header.tsx                     # Sticky header (transparent over hero, solid on scroll)
├── footer.tsx                     # Site footer
├── hero.tsx                       # Homepage hero (full-screen, behind navbar)
├── video-section.tsx              # Homepage video background section + CTA
├── breadcrumbs.tsx                # Breadcrumb navigation
├── booking-cta.tsx                # Reusable booking call-to-action
├── booking-widget.tsx             # Checkfront embedded widget with graceful fallback
├── routing-card-grid.tsx          # Homepage routing section(s)
└── structured-data.tsx            # JSON-LD LocalBusiness structured data
content/                           # MDX content files
lib/
├── metadata.ts                    # SEO metadata helpers
├── constants.ts                   # Site-wide constants (URLs, nav items)
└── site-map.ts                    # Nav/content architecture helpers (optional)
public/
├── images/                        # Site images (hero, OG, posters, content)
└── video/                         # Homepage video assets
```

---

## Roadmap

### Phase 1 — Foundation (Complete)
- [x] Project scaffolding (Next.js, Tailwind, TypeScript)
- [x] shadcn/ui setup and design system
- [x] Root layout with Header and Footer
- [x] Homepage layout with hero section (hero image may extend under navbar; no full-image color filter overlay by default)
- [x] Standard content layout with breadcrumbs
- [x] Global SEO setup (metadata helper, sitemap, robots.txt)

### Phase 2 — Core Pages (In Progress / Evolving)
- [x] MDX pipeline for content pages
- [x] About page
- [x] Diving pages
- [x] Courses / certifications page
- [x] Contact page
- [ ] **Refine homepage to answer the four key questions:**
  - Why dive Saba?
  - Why Sea Saba?
  - What can I choose?
  - Where do I go next?
- [ ] **Build /dive-sites section (critical SEO asset)**
  - Dive sites index page
  - Individual dive site pages (Third Encounter, Tent Reef Wall, Diamond Rock, etc.)
  - Rich content: depth, topography, marine life, skill level, real imagery
  - These are primary organic search landing pages
- [ ] **Build /plan-your-trip content cluster (critical SEO + conversion asset)**
  - Getting to Saba
  - Where to Stay
  - When to Visit / Best Time to Dive
  - What to Expect
  - FAQ
  - Pre-booking informational content
- [ ] Refine homepage routing destinations to match destination-first strategy

### Phase 3 — Booking Integration (Complete / Ongoing Refinement)
- [x] Reusable BookingCTA component
- [x] Embedded booking widget with graceful fallback
- [x] Dedicated /book page
- [x] Checkfront deep link CTAs on relevant pages
- [ ] Audit all pages for widget-failure fallback CTAs

### Phase 4 — Dynamic Content
- [ ] Firestore integration
- [ ] Testimonials / reviews section
- [ ] Staff profiles
- [ ] Dynamic operational data (conditions, schedules)

### Phase 5 — Polish & Launch (In Progress)
- [x] Custom 404 page
- [x] Skip-to-content accessibility link
- [x] 301 redirect scaffold in next.config.ts
- [x] Structured data (JSON-LD LocalBusiness)
- [x] Open Graph / Twitter Card metadata
- [ ] Add real OG image to public/images/og-image.jpg
- [ ] Image optimization pass (Next/Image everywhere)
- [ ] Implement homepage video section as the **3rd major section** with mobile poster fallback
- [ ] Performance audit (Core Web Vitals)
- [ ] Accessibility audit (contrast, semantics, keyboard nav)
- [ ] Populate 301 redirects from old Wix URLs
- [ ] Final SEO review and launch

---

## Design Principles

- **Clarity over flash** — text-first, SEO-focused content pages
- **Trust over hype** — calm, professional, conservation-minded tone
- **Speed over spectacle** — static generation, minimal JS, optimized assets
- **Motion is minimal** — only on homepage, degrades gracefully on mobile
- **Destination over catalog** — sell Saba and the Sea Saba experience first
- **Understated sophistication** — premium without being flashy

---

## Booking Rules

- Checkfront is the system of record
- Use:
  - Deep links
  - Embedded widgets
  - Optional availability previews
- Do **not** move checkout logic into the website
- The website must still convert even if widgets fail

---

## Content Rules

### MDX is preferred for:
- Core marketing pages
- Diving overview pages
- Dive site pages
- Trip planning content
- FAQs and informational content

### Firestore is preferred for:
- Testimonials
- Reviews
- Staff profiles
- Dynamic operational / timely data

---

## Visual Rules

- Homepage hero uses a **static full-bleed image**
- No full-image color filter overlay by default
- Text readability should come from:
  - image selection
  - typography
  - subtle local gradient behind text only
  - light text-shadow
- Homepage may have **one** video background section only
- Inner pages should remain calm, stable, and text-first

---

## Design North Star

The site should feel like:

**Premium expedition diving on a special island.**

And the brand message should feel like:

**Experienced. Deliberate. Professional.**
