# Sea Saba Site Architecture Plan

## Purpose
This document defines the recommended information architecture, homepage routing strategy, and page priorities for the modern Sea Saba website.

It exists to make implementation decisions consistent across:
- homepage design
- navigation
- MDX content structure
- SEO planning
- future Windsurf implementation prompts

The goal is to keep the site:
- destination-first
- SEO-friendly
- easy to navigate
- calm and professional
- conversion-oriented without feeling pushy

---

## Core Strategy
Sea Saba should not be presented as a generic dive shop catalog.

The website should present Sea Saba as:
- the expert guide to diving Saba
- a premium, small-group operator
- a safety-first professional marine operation
- the clearest path for planning a dive trip to Saba

The architecture should support four core user questions:

1. Why dive Saba?
2. Why Sea Saba?
3. What can I do with Sea Saba?
4. How do I plan and book my trip?

---

## Primary Navigation
Recommended primary navigation:

- Diving
- Dive Sites
- Courses
- Plan Your Trip
- About
- Book

Optional utility links:
- Contact
- FAQ

Navigation rules:
- Keep the top-level navigation simple
- Avoid deep nested menus unless clearly needed
- Avoid retail-style “everything in nav” structures
- Users should reach key content within two clicks

---

## Recommended Route Structure

### Top-Level Routes
- `/`
- `/diving`
- `/dive-sites`
- `/courses`
- `/plan-your-trip`
- `/about`
- `/book`
- `/contact`
- `/faq`

---

## Section-by-Section Architecture

### 1. Home `/`
**Role:** Positioning + routing page

The homepage should:
- establish visual trust
- communicate why Saba is special
- communicate Sea Saba’s professionalism
- route users to deeper pages
- present a clear next step

#### Homepage Section Order
1. Hero (static image)
2. Supporting value section
3. Video section + single CTA
4. Routing cards / featured paths
5. Final CTA

#### Homepage Routing Targets
Recommended homepage cards or featured links:
- Recreational Diving
- Dive Sites
- Courses
- Technical Diving
- Private Charters
- Plan Your Trip

The homepage should remain concise.
Detailed educational or SEO-heavy content belongs on inner pages.

---

### 2. Diving `/diving`
**Role:** Primary overview page for recreational diving products and expectations

This page should explain:
- what recreational diving with Sea Saba looks like
- who it is for
- experience expectations
- boat diving format
- what a dive day may look like
- where to go next

#### Recommended Child Pages
- `/diving/recreational-boat-diving`
- `/diving/dive-packages`
- `/diving/private-guide`
- `/diving/what-to-expect`

If simplicity is preferred at launch, some of these can start as sections on `/diving` and be split later.

---

### 3. Dive Sites `/dive-sites`
**Role:** High-value SEO and inspiration hub

This is one of the most important content clusters on the site.

The dive sites section should:
- help users understand what makes Saba diving special
- provide SEO-rich destination content
- create excitement and differentiation
- route users toward booking or trip planning

#### Dive Sites Index Page
Should include:
- intro to Saba’s underwater topography
- grouped or filtered dive site list if useful
- short summaries of featured sites
- links to individual pages

#### Individual Dive Site Pages
Recommended route pattern:
- `/dive-sites/[slug]`

Each page should include:
- site overview
- typical depth / profile
- what makes it special
- who it suits
- marine life / terrain notes
- operational notes if appropriate
- CTA to explore diving or book

Suggested early priority dive sites:
- Third Encounter / Eye of the Needle
- Twilight Zone
- Shark Shoals
- Ladder Labyrinth
- Man O’ War Shoals

---

### 4. Courses `/courses`
**Role:** Education and training entry point

This page should explain:
- learning options
- who beginner options are for
- refresher or continuing education pathways
- technical training paths if included

#### Recommended Child Pages
- `/courses/discover-scuba`
- `/courses/certifications`
- `/courses/refresher`
- `/courses/technical-courses` (optional, if needed)

This section should feel reassuring and professional, not like a massive certification catalog.

---

### 5. Plan Your Trip `/plan-your-trip`
**Role:** High-intent conversion support hub

This is another critical section.

Many users need help understanding the logistics of visiting Saba.
This content improves both SEO and conversion.

#### Recommended Child Pages
- `/plan-your-trip/getting-to-saba`
- `/plan-your-trip/where-to-stay`
- `/plan-your-trip/what-to-expect`
- `/plan-your-trip/faq`
- `/plan-your-trip/travel-information`

This section should answer practical planning questions clearly and calmly.

---

### 6. About `/about`
**Role:** Trust and brand credibility

This page should explain:
- who Sea Saba is
- company history
- safety and professionalism
- marine park context
- team / boats / approach

#### Recommended Child Pages
- `/about/team`
- `/about/boats`
- `/about/safety`
- `/about/conservation`

If needed, these may begin as sections on the main About page and be split later.

---

### 7. Book `/book`
**Role:** Booking conversion page

This page should:
- provide the strongest booking CTA path
- include embedded Checkfront widget if desired
- always provide a direct fallback booking link
- keep copy minimal and practical

Booking must remain in Checkfront.

---

### 8. Contact `/contact`
**Role:** Secondary conversion / trust page

This page should provide:
- contact form or contact methods
- WhatsApp / email if used
- location and business details
- practical reassurance

---

### 9. FAQ `/faq`
**Role:** Search support + user reassurance

May live under `/faq` or under `/plan-your-trip/faq` depending on implementation preference.

Good FAQ topics include:
- experience requirements
- gear questions
- certification questions
- trip planning basics
- booking questions
- travel timing

---

## Secondary Experience Areas
These may exist as standalone pages or nested pages depending on volume.

### Technical Diving
Recommended options:
- `/technical-diving`
or
- `/diving/technical-diving`

Use whichever fits the final navigation best.

This section should support:
- technical diver confidence
- CCR / rebreather or advanced capability messaging
- operational professionalism

### Private Charters
Recommended options:
- `/private-charters`
or
- `/activities/private-charters`

### Snorkeling / Sunset Cruises / Fishing
Recommended options:
- grouped under an activities section, or
- selectively surfaced only if strategically important

Do not clutter the primary navigation if these are secondary conversion paths.

---

## Homepage-to-Inner-Page Routing Logic

### Homepage should route primarily to:
- `/diving`
- `/dive-sites`
- `/courses`
- `/plan-your-trip`
- `/book`

Optional featured routes:
- technical diving page
- private charters page

Rules:
- keep homepage cards selective
- do not replicate the full sitemap on the homepage
- each card should represent a meaningful user path

---

## MDX vs Component-Driven Content

### Use MDX for:
- about pages
- diving overview pages
- dive site pages
- trip planning pages
- FAQs
- informational landing pages

### Use components / dynamic data for:
- testimonials
- reviews
- staff profile feeds
- dynamic operational updates
- booking widgets and booking support UI

Keep SEO-rich informational pages mostly static and indexable.

---

## MVP Build Order

### Phase 1 — Core Routing Pages
1. Home
2. Diving
3. Dive Sites index
4. Courses
5. Plan Your Trip
6. About
7. Book
8. Contact

### Phase 2 — High-Value Content Expansion
1. Individual dive site pages
2. Getting to Saba
3. Where to Stay
4. What to Expect
5. FAQ
6. Private Charters
7. Technical Diving

### Phase 3 — Trust / Dynamic Enhancements
1. Testimonials
2. Staff profiles
3. Reviews
4. Dynamic operational content

---

## SEO Priorities
Highest-value SEO sections should be:
1. Dive Sites
2. Plan Your Trip
3. Diving overview pages
4. Course pages

Homepage SEO should remain meaningful but restrained.
Do not turn the homepage into a long SEO text wall.

---

## UX Rules for Architecture
- One clear purpose per page
- One clear H1 per page
- Strong internal linking between related content
- Every page should have an obvious next action
- Avoid dead-end pages
- Avoid thin pages that exist only to hold a button or widget

---

## Design/Content North Star
The structure should make the site feel like:
- premium expedition diving
- destination-specific expertise
- calm professional guidance
- a clear, trustworthy path to booking a Saba dive trip

Final test:
If a page feels like a generic dive shop page that could belong to any island, it should be revised.
