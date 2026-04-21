# Windsurf AI Project Instructions

## Project Purpose
Build a fast, SEO-first, **destination-led marketing website** for Sea Saba, a professional scuba diving operation on the island of Saba in the Dutch Caribbean.

This is **not** a generic dive shop services catalog.

This is a **premium, destination-first, experience-led marketing site** that positions Saba as a world-class dive destination and Sea Saba as the trusted local expert.

Primary goals:
- Speed and performance
- SEO stability and improvement (dive sites and trip planning are key SEO assets)
- Clear booking conversion paths
- Strong destination storytelling
- High trust and professionalism
- Maintainable, scalable codebase

This project is a migration from Wix to a custom Next.js stack.
Feature parity must be preserved where appropriate, but **do not blindly reproduce Wix structure** if a cleaner, more SEO-friendly, higher-converting implementation is possible.

The site should position Sea Saba as:
- A premium, safety-first dive operator
- A destination-specific expert on diving Saba
- A calm, confident, professional guide
- A small-group, high-quality marine adventure company
- An expedition-forward operator for both recreational and technical divers
- A conservation-minded, professional marine operation

---

## Core Strategic Principle (Critical)
This is **not** a generic “dive shop services catalog” website.

Sea Saba should be built as a **destination-first, experience-led marketing website**.

Meaning:
- The homepage should sell **why dive Saba** and **why choose Sea Saba**
- Inner pages should explain specific activities, logistics, dive options, and trip planning
- The site should feel more like a premium expedition/travel experience than a retail-heavy dive center

Do not overemphasize:
- Retail
- Air packages
- Generic training catalog structures
- Busy “everything on the homepage” layouts

Emphasize:
- Saba as a unique dive destination
- Pinnacles / seamounts / dramatic topography
- Small-group professionalism
- Safety and operational competence
- Trip planning clarity
- Signature experiences
- Technical credibility without intimidating recreational divers

---

## Technology Stack (Fixed)
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- MDX for core marketing/content pages
- Firestore for dynamic or data-driven content only
- Vercel for deployment

Do not introduce alternative frameworks, CMSs, or CSS systems unless explicitly instructed.

---

## Layout Rules (Strict)
There are exactly **two** page layouts:

1. **Homepage Layout**
   - Static hero image at top
   - One scroll-based or cinematic video background section
   - Minimal copy
   - Homepage acts as a **positioning + routing page**
   - Homepage should inspire confidence, explain the destination briefly, and route users into deeper pages

2. **Standard Content Layout**
   - Used for all other pages
   - No video backgrounds
   - Text-first, SEO-focused
   - Breadcrumbs allowed and recommended
   - Strong semantic structure and clear content hierarchy

Do not create additional layouts unless explicitly requested.

---

## Homepage Strategy (Critical)
The homepage is **not** a content dump and **not** a generic services grid.

The homepage is a **positioning + routing page**.

The homepage must answer these four questions in sequence:

1. **Why dive Saba?** (destination differentiation)
2. **Why Sea Saba?** (operator credibility and trust)
3. **What can I choose?** (clear experience options)
4. **Where do I go next?** (routing to deeper pages)

The homepage should feel:
- Premium
- Calm
- Visual
- Focused
- Destination-led
- Minimal but semantically meaningful
- Confident and understated

The homepage should **not** try to fully explain:
- Every course
- Every policy
- Every package
- Every FAQ
- Every dive site
- Every logistical detail

Detailed content belongs on inner pages.

The homepage should be concise but still provide enough semantic content for search engines to understand the site's purpose and value proposition.

---

## Homepage Section Order (Strict)
The homepage must follow this high-level order of major sections:

1. **Hero (Static Image)**
   - No color filter overlay on the hero image by default
   - May extend behind the navbar/header
   - Primary headline + short subline + primary CTA
   - Should immediately communicate premium destination diving

2. **Supporting Section (Static)**
   - One concise value section
   - Prefer “Why Dive Saba” or “Why Sea Saba”
   - Keep copy restrained and high-impact
   - No video backgrounds

3. **Video Section + CTA (Single Video Background)**
   - One looping/cinematic video background (no audio)
   - One clear CTA (e.g., “Explore Dive Sites” or “Plan Your Dive Trip”)
   - Keep copy minimal (1–2 short lines)
   - This is the only video section on the homepage

4. **Routing Sections (Static)**
   - Brief cards/links to deeper sections such as:
     - Diving
     - Dive Sites
     - Courses / Learn
     - Technical Diving
     - Private Charters
     - Plan Your Trip
   - These should be selective and intentional, not a giant sitemap

5. **Final CTA (Static)**
   - Strong, simple booking or trip-planning CTA
   - Clear next step, not cluttered

Notes:
- Do not add additional video sections.
- On mobile, the video section must degrade to a static poster image.
- Homepage copy should remain concise and not become an SEO content wall.

---

## Motion & Animation Rules
Motion is allowed **only on the homepage**.

Allowed:
- One video background section used as the **3rd homepage section**
- Subtle fade-in transitions
- Very restrained reveal animations
- Very subtle image hover treatments

Not allowed:
- Parallax effects
- Scroll hijacking
- Autoplay audio
- Motion-heavy UI components
- Complex animated hero systems
- Multiple animated background sections

Mobile must degrade gracefully to static imagery (poster image).

Motion must reinforce calm professionalism, not spectacle.

---

## Sea Saba Positioning Rules (Critical)
All design and content decisions should support this positioning:

Sea Saba is:
- Experienced
- Professional
- Safety-first
- Conservation-minded
- Small-group
- Calm and competent
- Premium but not luxury-flashy
- Adventure-forward, not touristy

The visual and UX tone should suggest:
- Expedition diving
- Confident marine operations
- Local expertise
- Understated sophistication

Avoid:
- Resort clichés
- Tropical tourism clichés
- Overly playful design
- Generic “fun in the sun” messaging
- Cartoonish or overly bright dive branding

---

## Content Rules
- Homepage is a routing and positioning page, not a content dump
- Detailed explanations live on subpages
- Avoid marketing fluff
- Tone must remain calm, confident, and professional
- Content should support trust and clarity over hype
- Use short paragraphs and clean scannable sections
- Every page should have a clear next step

Prioritize content themes such as:
- Why dive Saba
- What to expect
- Dive experience levels
- Signature sites
- Boat diving logistics
- Safety expectations
- Trip planning
- Technical diving credibility
- Conservation / marine park context

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
- Prefer static generation where possible
- Content pages should be indexable and rich in useful text
- Homepage should remain concise, but still semantically meaningful

### Critical SEO Assets
The following page types are **high-value SEO assets** and should be treated as such:

1. **Dive Site Pages**
   - Individual dive site pages (e.g., Third Encounter, Tent Reef Wall, Diamond Rock)
   - Rich, descriptive content about depth, topography, marine life, skill level
   - Real imagery from each site
   - Clear semantic structure
   - These pages are primary organic search landing pages

2. **Plan Your Trip / Trip Planning Pages**
   - Getting to Saba
   - Where to Stay
   - When to Visit
   - What to Expect
   - FAQ
   - These pages support conversion and answer pre-booking questions
   - They should be informational, helpful, and SEO-rich

3. **Diving Overview Pages**
   - Recreational diving overview
   - Technical diving overview
   - Boat diving logistics
   - These pages establish topical authority

Avoid:
- Building pages that exist only as thin wrappers around widgets
- Hiding important informational content in tabs or accordions if it matters for SEO
- Creating duplicate or near-duplicate content across pages

---

## Site Architecture Rules (Preferred)
Use a clean, scalable information architecture that supports both SEO and conversion.

Recommended primary navigation:
- Diving
- Dive Sites
- Courses
- Plan Your Trip
- About
- Book

Recommended deeper structure:
- Diving
  - Recreational Boat Diving
  - Dive Packages / Pricing
  - Private Guide (if used)
- Dive Sites
  - Dive site index
  - Individual dive site pages
- Courses
  - Discover Scuba / Intro options
  - Certifications / continuing education
  - Refresher
- Technical Diving
  - Technical diving overview
  - Rebreather / CCR
  - Technical courses (if included)
- Charters / Activities
  - Private Charters
  - Snorkeling
  - Sunset Cruises
  - Fishing
- Plan Your Trip
  - Getting to Saba
  - Where to Stay
  - FAQ
  - Travel / arrival information
- About
  - About Sea Saba
  - Team / boats / safety / conservation

Do not create overly deep navigation trees.

---

## Booking System Rules
- Checkfront is the system of record for all bookings
- Allowed integrations:
  - Deep links into Checkfront
  - Embedded widgets
  - Availability previews via API
- Checkout, payments, and booking confirmation must remain in Checkfront
- Site must function fully even if booking widgets fail to load
- Booking widgets should never be the only path to conversion
- Always provide a fallback CTA or deep link if a widget fails

---

## Data & Content Sources
- MDX:
  - Core marketing pages
  - Diving pages
  - Dive site pages
  - Informational / trip planning pages
- Firestore:
  - Testimonials
  - Reviews
  - Staff profiles
  - Dynamic operational data

Do not overcomplicate content that belongs in static MDX.

---

## Accessibility & Performance
- Use Next/Image for all images
- Optimize video aggressively
- Ensure sufficient color contrast
- Avoid unnecessary JavaScript
- Favor static generation where possible
- Keep layout shift low
- Ensure keyboard accessibility
- Use semantic landmarks and heading hierarchy
- Homepage motion must not reduce accessibility or clarity

---

## Hero Image Rules
- No color filter overlay on the hero image by default
- Maintain text readability via typography, subtle text-shadow, or a very light local gradient behind text only (do not apply a full-image tint/filter)
- The hero can extend behind the homepage navbar
- Ensure navbar contrast via background blur/opacity and scroll state
- Hero copy should feel premium, minimal, and confident
- Do not overcrowd the hero with multiple competing actions

---

## Visual Benchmark Guidance
External inspiration may be used for:
- Clean hierarchy
- Spacious composition
- Premium visual rhythm
- Clear service grouping

However, do **not** clone or closely imitate other dive shop websites.

For Sea Saba:
- Favor destination storytelling over service sprawl
- Favor editorial composition over template-like service blocks
- Favor selective, high-value routing over giant grids
- Favor trust, clarity, and place-specific differentiation

---

## Guiding Principle
Build for clarity, speed, trust, and destination-specific differentiation.

Do not over-design.
Do not over-animate.
Do not make it feel like a generic dive center template.

**Understated sophistication. Premium expedition diving.**