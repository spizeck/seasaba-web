# Windsurf AI Project Instructions

## Project Purpose
Build a fast, SEO-first marketing website for a professional scuba diving operation.
Primary goals:
- Speed and performance
- SEO stability and improvement
- Clarity and accessibility
- Maintainable codebase
- High-quality booking conversion

This project is a migration from Wix to a custom Next.js stack. Feature parity must be preserved.

---

## Technology Stack (Fixed)
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- MDX for core marketing/content pages
- Firestore for dynamic or data-driven content only
- Vercel for deployment

Do not introduce alternative frameworks or CSS systems unless explicitly instructed.

---

## Layout Rules (Strict)
There are exactly **two** page layouts:

1. **Homepage Layout**
   - Static hero image at top
   - One scroll-based video background section
   - Minimal copy
   - Homepage acts as a router to deeper pages

2. **Standard Content Layout**
   - Used for all other pages
   - No video backgrounds
   - Text-first, SEO-focused
   - Breadcrumbs allowed and recommended

Do not create additional layouts unless explicitly requested.


## Homepage Section Order (Strict)
The homepage must follow this high-level order of major sections:

1. **Hero (Static Image)**
   - No full-image color filter overlay by default
   - May extend behind the navbar/header
   - Primary headline + short subline + primary CTA

2. **Supporting Section (Static)**
   - One concise value section (e.g., “Why Sea Saba” or “Why Saba”)
   - No video backgrounds

3. **Video Section + CTA (Single Video Background)**
   - One looping/cinematic video background (no audio)
   - One clear CTA (e.g., “Explore Dive Sites” or “Book Now”)
   - Keep copy minimal (1–2 short lines)

4. **Routing Sections (Static)**
   - Brief cards/links to: Diving, Dive Sites, How It Works, Boats, etc.

5. **Final CTA (Static)**
   - Strong, simple booking CTA

Notes:
- Do not add additional video sections.
- On mobile, the video section must degrade to a static poster image.

---

## Motion & Animation Rules
- Motion is allowed **only on the homepage**
- Allowed:
  - One video background section used as the **3rd homepage section**, with a single, clear CTA
  - Subtle fade-in transitions
- Not allowed:
  - Parallax effects
  - Scroll hijacking
  - Autoplay audio
  - Motion-heavy UI components
- Mobile must degrade gracefully to static imagery (poster image)

---

## SEO Rules (Non-Negotiable)
- Pages must render meaningful HTML without client-side JavaScript
- Every page must define:
  - Title
  - Meta description
  - Canonical URL
- Use semantic HTML elements
- One clear H1 per page
- Do not hide critical content behind JavaScript-only interactions
- Preserve existing URLs or provide 301 redirects
- Sitemap and robots.txt must be implemented

---

## Content Rules
- Homepage is a routing and positioning page, not a content dump
- Detailed explanations live on subpages
- Avoid marketing fluff
- Tone must remain calm, confident, and professional
- Content should support trust and clarity over hype

---

## Booking System Rules
- Checkfront is the system of record for all bookings
- Allowed integrations:
  - Deep links into Checkfront
  - Embedded widgets
  - Availability previews via API
- Checkout, payments, and booking confirmation must remain in Checkfront
- Site must function fully even if booking widgets fail to load

---

## Data & Content Sources
- MDX:
  - Core marketing pages
  - Diving pages
  - Informational content
- Firestore:
  - Testimonials
  - Reviews
  - Staff profiles
  - Dynamic operational data

---

## Accessibility & Performance
- Use Next/Image for all images
- Optimize video aggressively
- Ensure sufficient color contrast
- Avoid unnecessary JavaScript
- Favor static generation where possible

---

## Guiding Principle
Build for clarity, speed, and trust.
Do not over-design.
Do not over-animate.


---

## Hero Image Rules
- No color filter overlay on the hero image by default.
- Maintain text readability via typography, subtle text-shadow, or a very light local gradient behind text only (do not apply a full-image tint/filter).
- The hero can extend behind the homepage navbar; ensure navbar contrast via background blur/opacity and scroll state.
