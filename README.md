# Sea Saba — Professional Scuba Diving Website

A fast, SEO-first marketing website for a professional scuba diving operation, migrated from Wix to a custom Next.js stack.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Content:** MDX for marketing/informational pages
- **Dynamic Data:** Firestore (testimonials, reviews, staff profiles)
- **Booking:** Checkfront (deep links, embedded widgets, availability API)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
app/
├── layout.tsx              # Root layout (header, footer, fonts, SEO, JSON-LD)
├── page.tsx                # Homepage (5-section layout)
├── not-found.tsx           # Custom 404 page
├── book/page.tsx           # Booking page (Checkfront widget)
├── (content)/              # Standard content layout group
│   ├── layout.tsx          # Content layout (breadcrumbs, prose)
│   ├── about/
│   ├── diving/
│   ├── courses/
│   └── contact/
components/
├── ui/                     # shadcn/ui components
├── header.tsx              # Sticky header (transparent on homepage hero, solid on scroll)
├── footer.tsx              # Site footer
├── hero.tsx                # Homepage hero (full-screen, behind navbar)
├── video-section.tsx       # Homepage video background section + CTA
├── breadcrumbs.tsx         # Breadcrumb navigation
├── booking-cta.tsx         # Reusable booking call-to-action
├── booking-widget.tsx      # Checkfront embedded widget with fallback
└── structured-data.tsx     # JSON-LD LocalBusiness structured data
content/                    # MDX content files
lib/
├── metadata.ts             # SEO metadata helpers
└── constants.ts            # Site-wide constants (URLs, nav items)
public/
├── images/                 # Site images (hero, OG)
└── video/                  # Homepage video assets
```

## Roadmap

### Phase 1 — Foundation (Complete)
- [x] Project scaffolding (Next.js, Tailwind, TypeScript)
- [x] shadcn/ui setup and design system (ocean palette, typography)
- [x] Root layout with Header and Footer
- [x] Homepage layout with hero section (hero image can extend under navbar; no full-image color filter overlay by default)
- [x] Standard content layout with breadcrumbs
- [x] Global SEO setup (metadata helper, sitemap, robots.txt)

### Phase 2 — Core Pages (Complete)
- [x] MDX pipeline for content pages
- [x] About page
- [x] Diving pages (dive sites, conditions, what to expect)
- [x] Courses / certifications page
- [x] Contact page

### Phase 3 — Booking Integration (Complete)
- [x] Reusable BookingCTA component
- [x] Embedded booking widget with graceful fallback
- [x] Dedicated /book page
- [x] Checkfront deep link CTAs on all relevant pages

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
- [x] Open Graph / Twitter Card image metadata
- [ ] Add real OG image to public/images/og-image.jpg
- [ ] Image optimization pass (Next/Image everywhere)
- [ ] Homepage video section as the **3rd major section** (scroll-based or pinned feel, mobile poster fallback) with a clear CTA
- [ ] Performance audit (Core Web Vitals)
- [ ] Accessibility audit (contrast, semantics, keyboard nav)
- [ ] Populate 301 redirects from old Wix URLs
- [ ] Final SEO review and launch

## Design Principles

- **Clarity over flash** — text-first, SEO-focused content pages
- **Trust over hype** — calm, professional, conservation-minded tone
- **Speed over spectacle** — static generation, minimal JS, optimized assets
- **Motion is minimal** — only on homepage, degrades gracefully on mobile

See [THEME_UX_GUIDE.md](./THEME_UX_GUIDE.md) and [AI_INSTRUCTIONS.md](./AI_INSTRUCTIONS.md) for full design and development guidelines.
