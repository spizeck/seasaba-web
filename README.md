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

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Content:** MDX for marketing / informational / dive site pages
- **Dynamic Data:** Firestore (dives, boats, sites, species, guides)
- **Booking:** Checkfront (deep links, embedded widgets)
- **Analytics:** Vercel Analytics
- **PDF Export:** jsPDF (premium card-style dive log export)
- **Deployment:** Vercel

---

## Getting Started

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Firebase values
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
├── page.tsx                       # Homepage (destination-first layout)
├── not-found.tsx                  # Custom 404 page
├── robots.ts                      # robots.txt
├── sitemap.ts                     # sitemap.xml
├── book/page.tsx                  # Booking page (Checkfront widget + fallback)
├── (content)/                     # Standard content layout group
│   ├── layout.tsx                 # Content layout (breadcrumbs, prose, SEO-first)
│   ├── about/
│   ├── contact/
│   ├── courses/
│   ├── dive-log/
│   ├── dive-sites/
│   ├── diving/
│   ├── diving/first-dive/
│   ├── partners/
│   ├── plan-your-trip/
│   ├── privacy/
│   └── terms/
components:
├── ui/                            # shadcn/ui components
├── header.tsx                     # Sticky header
├── footer.tsx                     # Site footer
├── footer-wrapper.tsx             # Footer wrapper
├── hero.tsx                       # Homepage hero
├── breadcrumbs.tsx                # Breadcrumb navigation
├── booking-cta.tsx                # Reusable booking call-to-action
├── booking-widget.tsx             # Checkfront embedded widget
├── dive-log-client.tsx            # Interactive dive log UI
├── find-sea-saba.tsx              # Map / location component
└── structured-data.tsx            # JSON-LD LocalBusiness structured data
content/                           # MDX content files
lib/
├── metadata.ts                    # SEO metadata helpers
├── constants.ts                   # Site-wide constants (URLs, nav items)
├── firebase.ts                    # Firebase client SDK setup
├── firestore/
│   ├── dive-log.ts                # Firestore dive log fetching and normalization
├── dive-log-export.ts             # Premium PDF export for selected dives
└── ...
public/
├── images/                        # Site images (hero, OG, posters, content, logo)
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

### Phase 2 — Core Pages (Complete)
- [x] MDX pipeline for content pages
- [x] About page
- [x] Diving pages (overview + first-dive)
- [x] Courses / certifications page
- [x] Contact page
- [x] Partners page
- [x] Privacy & Terms pages
- [x] Homepage refined to answer the four key questions
- [x] `/dive-sites` section
- [x] `/plan-your-trip` content cluster
- [x] Homepage routing destinations aligned to destination-first strategy

### Phase 3 — Booking Integration (Complete)
- [x] Reusable BookingCTA component
- [x] Embedded booking widget with graceful fallback
- [x] Dedicated /book page
- [x] Checkfront deep link CTAs on relevant pages

### Phase 4 — Dynamic Content (Complete)
- [x] Firestore integration (client-side)
- [x] Live dive log (`/dive-log`) with filtering, selection, and PDF export

### Phase 5 — Polish & Launch (Complete)
- [x] Custom 404 page
- [x] Skip-to-content accessibility link
- [x] 301 redirect scaffold in next.config.ts
- [x] Structured data (JSON-LD LocalBusiness)
- [x] Open Graph / Twitter Card metadata
- [x] Real OG image configured
- [x] Vercel Analytics installed
- [x] Performance and accessibility baseline

## Production Deployment

The site is deployed on **Vercel** from the `master` branch.

### Required Environment Variables

Copy `.env.example` to `.env.local` and fill in the values from your Firebase Console.

**Critical:** the browser-side Firebase SDK requires the public variables to use the `NEXT_PUBLIC_` prefix:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
NEXT_PUBLIC_SITE_URL=https://www.seasaba.com
```

### Firestore Security Rules

Public read access is required for the collections used by the live site:

```
match /dives/{docId} { allow read: if true; }
match /boats/{docId} { allow read: if true; }
match /sites/{docId} { allow read: if true; }
match /species/{docId} { allow read: if true; }
match /guides/{docId} { allow read: if true; }
```

### Deployment Steps

1. Ensure environment variables are set in Vercel (Production + Preview)
2. Merge changes to `master`
3. Vercel builds and deploys automatically
4. Verify `/dive-log` loads dives and `/sitemap.xml` is valid

### Post-Launch Monitoring

- Check Vercel Analytics for Core Web Vitals
- Monitor Search Console for crawl errors and 301 redirect coverage
- Keep 301 redirects in `data/redirects.ts` populated from the old Wix site

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
