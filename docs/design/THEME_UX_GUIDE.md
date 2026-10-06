# Theme & UX Guide

> **Status: Canonical design reference** — brand colors, typography, spacing,
> imagery, and interaction rules. Two notes where this guide diverges from
> the shipped site: the 12-part homepage section order below was the design
> spec; the implemented homepage is simpler (see `app/(en)/page.tsx` and
> `README.md`), and the homepage video section was removed for performance
> in September 2026 (video rules apply only if video is reintroduced).
> Performance targets are now enforced mechanically by `perf/budgets.json`
> (see `docs/TESTING.md`).

## Brand Personality
- Professional
- Calm
- Confident
- Conservation-minded
- Non-touristy
- Experienced, not flashy
- Premium, but understated
- Expedition-forward rather than resort-forward

The site should feel composed, deliberate, and premium.

Sea Saba should feel like:
- A serious marine operation
- A trusted local expert
- A refined adventure brand
- Professional expedition diving rather than a tourist activity

---

## Experience Positioning (Critical)
This website should not feel like a generic dive shop template.

It should feel like:
- A destination-first diving experience
- A premium, small-group operator
- A calm, highly competent marine business
- A place where experienced people take you somewhere special

The emotional arc should be:

1. This place is special
2. These people are professional
3. I understand what they offer
4. I know what to do next

---

## UX Foundations

The site follows modern usability principles derived from established UX research.

Key guidelines include:
- Nielsen usability heuristics
- WCAG accessibility standards
- Mobile-first responsive design
- Clear visual hierarchy
- Recognition over recall
- Minimal decision complexity (Hick’s Law)
- Progressive disclosure of detail

Primary UX goals:
1. Immediate trust and credibility
2. Clear understanding of what Sea Saba offers
3. Clear understanding of why Saba is unique
4. Easy navigation to diving information
5. Clear path to booking or trip planning
6. High perceived professionalism

Users should never have to search for what to do next.

---

## Brand Colors

### Primary Brand Colors
- **Sea Saba Blue:** `#171C8F` (PMS 2746 C) — headers, primary buttons, key accents
- **Sea Saba Red:** `#9D2235` (PMS 201 C) — sparingly for emphasis, warnings, or a single standout CTA

### Deep Tones
- **Abyss Navy:** `#0B0F3B` — dark backgrounds, footer, dark bands, deep-water atmosphere
- **Volcanic Slate:** `#2C3E50` — secondary text, subtle UI elements, references Saba’s volcanic identity

### Neutral Foundation
- **Drift White:** `#F5F6FA` — primary page background, slightly cool-toned
- **Pure White:** `#FFFFFF` — cards, content areas, contrast panels
- **Sand:** `#E8E0D5` — restrained warm accent backgrounds, subtle dividers, soft contrast

### Text Colors
- **Primary Text:** `#1A1A2E` — near-black with a cool undertone
- **Secondary Text:** `#6B7280` — captions, metadata, supporting copy
- **Inverse Text:** `#FFFFFF` — on dark backgrounds

### Functional Colors
- **Success / Conservation Green:** `#2E7D6F` — conservation messaging, confirmations, availability indicators
- **Warning:** `#D4A843` — muted gold, for attention without alarm
- **Error:** Sea Saba Red `#9D2235`

### Color Usage Principles
- Sea Saba Blue is the dominant brand color
- Sea Saba Red is a restrained accent, not a theme color
- Do not overuse either primary brand color as a large fill background
- Prefer deep neutrals and clean whites as the structural base
- Use Sand sparingly to warm up the interface
- Avoid bright tropical palettes
- Avoid over-saturated cyan/teal-heavy dive clichés
- Maintain high contrast pairings for readability

---

## Visual Tone
- Ocean-inspired palette grounded by brand blue
- Deep blues, slate tones, neutral sands
- High contrast for readability
- Editorial, documentary, and composed
- More premium marine expedition than tropical tourism

The brand red should feel like deliberate punctuation, not a decorative theme color.

---

## Typography

> **Canonical (Issue #112, implemented):** the scale below is the shipped
> system as measured in the browser — documentation and implementation
> agree. `docs/design/TYPOGRAPHY_AUDIT.md` records the full audit and the
> history of how this system arrived.

### Font Stack
- **Headings:** **Jost** — loaded via `next/font/google` (`lib/fonts.ts`),
  `display: swap` with a size-adjusted fallback face, so rendering is
  deterministic on every device with no meaningful CLS. Jost is the OFL
  geometric-sans stand-in for Century Gothic; `"Century Gothic"` remains in
  the stack only as a last-resort local fallback if the webfont is blocked.
- **Body / Copy / UI:** **Open Sans** — loaded via `next/font/google`.
- Do not add font files or stacks without checking licensing; Century Gothic
  itself is a paid Monotype webfont and must not be self-hosted.

### Heading Style
- Confident and spacious
- Clean hierarchy (H1 → H2 → H3 with distinct sizing)
- The geometric heading face should feel modern, structured, and composed

### Body Style
- Highly readable at all screen sizes
- Short paragraphs (2–4 lines max)
- Open Sans should carry most of the reading load cleanly and quietly

### General Rules
- Avoid novelty or decorative fonts
- Typography should do most of the visual work
- Use font weight and size for hierarchy, not excessive color or decoration
- Headlines should feel intentional and restrained, not loud

### Callout Boxes
- Title: `font-semibold` at body-or-larger size (`text-base`+), body:
  `text-sm font-medium`
- Inverse white text on brand-colored backgrounds (`bg-destructive` for warnings, `bg-primary` for positive/upsell)

### Canonical Typographic Scale (rendered)

| Role | Mobile | Desktop | Weight | Implementation |
|---|---|---|---|---|
| Display (homepage hero H1) | 30px | 60px | 400 italic | `text-3xl sm:text-5xl lg:text-6xl` |
| Page H1 (`PageHero`) | 30px | 48px | 700 | `text-3xl sm:text-4xl lg:text-5xl` |
| Page H1 (utility pages) | 30px | 36px | 700 | `text-3xl sm:text-4xl` |
| Section H2 (homepage) | 24px | 30px | 600 | `text-2xl sm:text-3xl` |
| Content H2 (`prose` pages) | 20px | 20px | 600 | `text-xl` |
| Card / callout title (H3) | 16–18px | 16–18px | 600 | `text-base` / `text-lg` |
| Micro-label (H3/H4/badges) | 12–14px | 12–14px | 600 | `text-xs`/`text-sm`, often uppercase |
| Lede / intro | 16px | 18px | 400 | `text-base sm:text-lg` |
| **Body** | **16px** | **16px** | 400 | `text-base`; also `body` base size |
| Supporting (card copy, spec lists, dense sections) | 14px | 14px | 400 | `text-sm` — deliberate compact style |
| Caption / meta / fine print | 12px | 12px | 400 | `text-xs` |
| Nav link | 16px (drawer) | 14px (bar) | 500 | |
| Button | 14–16px | 14–16px | 500–600 | per `Button` size variant |
| Form label | 14px | 14px | 500 | |
| Form input / select | **16px** | 14px | 400 | 16px below `lg` prevents iOS Safari focus zoom — do not reduce |

Line height:
- `leading-relaxed` (1.625) for prose; ~1.2–1.3 for headings (`leading-tight`
  / `--leading-heading`)

Maximum readable line width:
- 65–80 characters; content-page lede paragraphs are capped at `max-w-3xl`
  (~75ch) by the shared `(content)` layout

Where new text is added, prefer the roles above: `text-base` for primary
prose, `text-sm` for supporting detail inside cards/specs/badges,
`text-xs` for captions and metadata.

Avoid large blocks of dense text.

---

## Layout Philosophy
- Generous white space
- Clear vertical rhythm
- Predictable structure
- Strong grid alignment
- Consistent spacing and widths
- Calm visual pacing

Consistency signals professionalism and trust.

---

## Homepage UX (Critical)
The homepage is a **positioning and routing page**, not a content dump.

The homepage should prioritize:
- Emotion first
- Destination differentiation second
- Routing third
- Conversion last

It should answer:
1. Why dive Saba?
2. Why Sea Saba?
3. What can I choose?
4. Where do I go next?

### Homepage Hero
- Use a **full-bleed static hero image**
- **No full-image color filter overlay** by default
- The hero image may extend **behind the navbar**
- Ensure readability by:
  - Placing copy in an area with clean negative space, and/or
  - Using a **subtle local gradient behind text only**, and/or
  - Using a light text-shadow
- Navbar on hero should stay premium:
  - Use translucent background + blur
  - Transition to subtle solid background on scroll
  - Keep contrast high for nav links and the “Book” CTA

Hero content should be:
- Minimal
- Strong
- Place-specific
- Calm and premium

Avoid:
- Multiple stacked CTAs
- Long paragraphs
- Overcrowded hero layouts
- Busy overlays

### Homepage Motion Section
- The homepage may include **one** video background section as the **3rd major section**
- The video section should include **one clear CTA**
- No autoplay audio
- No fast cuts
- No aggressive motion
- Mobile must use a static poster image fallback

### Homepage Section Order
1. Hero (static image, behind navbar allowed) — with trust indicators and primary Book CTA
2. Why Saba — destination differentiation with key themes
3. Dive Saba's World Famous Pinnacles — featured pinnacle sites
4. Marine Life — image-driven, key species
5. Featured Dive Sites — cards with skill level, depth, marine life, photography
6. Why Dive With Sea Saba — credentials and differentiators
7. Reviews and Social Proof — TripAdvisor / Google / testimonials
8. Group Travel — dive clubs, shops, tour operators
9. Plan Your Trip — travel hub introduction
10. Where to Stay — accommodation introduction
11. FAQ — common visitor concerns
12. Final CTA

The homepage is a full destination and conversion page. It should answer all four core user questions before the footer.

---

## Inner Page UX
- Clarity first
- Reassurance second
- Conversion where appropriate
- Breadcrumbs encouraged
- Clear section headings
- Strong semantic hierarchy
- One clear purpose per page

Users should always know:
- Where they are
- What this page is about
- What to do next

---

## Content Presentation Rules

### Progressive Disclosure
- Use progressive disclosure to manage complexity
- Show high-level information first, details on demand
- Do not overwhelm users with everything at once
- Guide users deeper into content naturally

### Content Structure
- Keep sections focused on one topic
- Do not bury important information in tabs if it matters for SEO or trust
- Avoid giant walls of text
- Use supporting images with purpose, not decoration
- Prefer 2–4 paragraph sections over long uninterrupted blocks
- Every page should have a clear CTA or next-step pathway
- Use headings, lists, and visual breaks to improve scannability

### Information Hierarchy
- Most important information first
- Details and edge cases later
- FAQs and policies in dedicated sections, not scattered
- Trust signals (safety, certifications, experience) should be visible but not overwhelming

---

## Imagery Guidelines

### Core Principles
- Prefer **real Sea Saba / Saba diving imagery** whenever possible
- Favor wide blue water, walls, pinnacles, silhouettes, reef scale
- Divers in frame for scale are strongly preferred
- Use imagery that communicates:
  - Depth
  - Scale
  - Open ocean
  - Exploration
  - Professional operation
- Images must support content, not decorate it

### Visual Tone
Photography should feel:
- **Editorial** — composed, intentional, documentary-style
- **Authentic** — real Saba diving, not stock imagery
- **Cinematic** — wide compositions, natural light, depth
- **Premium** — high-quality, well-exposed, professional

### Strongly Avoid
- Stock-style smiling diver photos
- Generic tropical tourism imagery
- Overly staged "resort brochure" visuals
- Busy fish-ID style images as hero/support imagery
- Heavy color filters or over-saturated tropical palettes
- Tropical clichés (palm trees, sunset cocktails, "fun in the sun" compositions)
- Cartoonish or overly playful dive imagery

---

## Photography Standards
Photography drives the emotional impact of the site and reinforces the destination-first positioning.

### Image Style Emphasis
- **Wide blue water** — open ocean, depth, scale
- **Healthy reefs and pinnacles** — Saba's signature topography
- **Divers in frame for scale** — human element shows adventure and professionalism
- **Natural lighting** — no artificial over-processing
- **Cinematic composition** — editorial framing, intentional negative space
- **Documentary authenticity** — real diving, real Saba, real Sea Saba operations

### Strongly Avoid
- Dark muddy images
- Heavy color filters or over-saturated tropical palettes
- Stock imagery
- Busy fish-ID style shots as primary imagery
- Overly "fun vacation" compositions that undermine the premium tone
- Generic Caribbean resort photography
- Tropical tourism clichés

### Guiding Principle
Images should feel **editorial and documentary** rather than promotional.

They should communicate:
- **This place is special**
- **These people are professional**
- **This is serious, high-quality diving**

---

## Motion Guidelines
- Minimal and purposeful
- Subtle fades preferred
- Motion should never distract from content
- Motion should reinforce calm professionalism

Allowed:
- Button hover states
- Very subtle image hover zoom
- Soft fade-in on viewport entry
- Light header state transitions
- One homepage video background section

Avoid:
- Parallax scrolling
- Large motion effects
- Animated decorative backgrounds
- Complex transitions
- Motion-heavy section choreography
- Repeated animated patterns

---

## Components Philosophy
- Simple, reusable components
- Minimal UI chrome
- Strong hierarchy through spacing and typography
- Cards should feel clean and intentional, not generic
- Buttons are clear and consistent
- CTAs are selective, not everywhere

Reusable components should feel:
- Quiet
- Precise
- Stable
- Professional

### Loading, Empty & Error States

Transient and exceptional states are part of the Sea Saba experience —
calm, clear, and useful, never generic framework fallbacks.

- **Loading:** use `BubbleLoader` (paired with visible text inside a
  `role="status"` container) only where waiting is real and visible —
  data fetches, the booking widget. Reserve panel dimensions so content
  doesn't jump. Never for interactions that resolve instantly.
- **Empty vs filtered-empty vs unavailable are different states.** Truly
  empty ("No dives logged yet") gets a next action; filtered-empty
  ("No dives match your filters") gets a reset action; unavailable gets a
  retry or alternate path. Never share one generic message across them.
- **Errors:** plain language, no stack traces, codes, or provider details.
  Distinguish user-fixable problems from service failures, preserve
  entered data, and offer a retry or next step. Async failures use
  `role="alert"` so they're announced.
- **Success:** unmistakable — a `role="status"` panel that says what
  happened, what happens next, and whether it's safe to leave. Never
  just a subtle color change.
- **Copy tone:** capable and concise. No "Oops!", no cute scuba jokes in
  failure states.
- **Shared primitive:** `components/state-panel.tsx` (`StatePanel`)
  renders the bordered centered panel — title, description, optional
  leading visual, optional actions — used for dive-log loading, error,
  and empty states. Reach for it before hand-rolling a new one-off panel.

---

## Links
- Links do not use underlines by default.
- Clickability should be communicated through color, hover state, and context rather than text decoration.
- Underlines may be reserved for rare exceptions where the surrounding context makes a link indistinguishable from static text.

---

## Conversion Hierarchy

Calls to action should follow a clear priority.

### Primary CTA
- Book Diving
or
- Plan Your Dive Trip

### Secondary CTAs
- Explore Dive Sites
- View Dive Packages
- Learn About Saba
- View Courses

Rules:
- Only one primary CTA should dominate each page
- Avoid multiple competing CTAs
- Do not create “CTA clutter”
- Conversion should feel guided, not pushy

---

## Interaction Design
Interactions should be subtle and refined.

Allowed:
- Button hover states
- Very subtle image hover zoom
- Smooth page transitions (lightweight only)
- Fade-in content when entering viewport

Avoid:
- Parallax scrolling
- Large motion effects
- Animated decorative backgrounds
- Complex UI transitions
- Hover gimmicks

Motion should reinforce quality and calm professionalism.

### Micro-Interaction System

One small motion vocabulary, shared by every control, card, and overlay.
The site should feel responsive and tactile — never "animated."

#### Timing scale

| Layer | Duration | Used for |
|---|---|---|
| Controls | `~150ms ease-out` | buttons, pills, chips, toggles |
| Surfaces | `~200ms ease-out` | card border/shadow/lift, sticky-nav state changes |
| Overlays | `150–200ms ease-out` | dialog backdrop fade (`animate-overlay-in`), panel entrance (`animate-rise-in`) |
| Imagery | `~500ms` | photo hover zoom |

Prefer the shared utilities over one-off values:

- **`pressable`** — the standard control transition (transform, scale,
  color, background, border, shadow, fill/stroke, opacity at 150ms) plus a
  restrained
  tactile press (`scale: 0.97` while `:active`). Skipped automatically for
  disabled controls, `variant="link"` buttons, and reduced-motion users.
  Use it on any hand-rolled button that should feel like a Button.
- **`transition-card`** — the standard interactive-card transition
  (transform + border + shadow, 200ms). Pair with
  `motion-safe:hover:-translate-y-0.5` for explorable cards.
- **`animate-overlay-in` / `animate-rise-in`** — the shared dialog
  entrance: backdrop fades, panel fades + rises ~6px and settles at
  ~200ms. Apply both with `motion-reduce:animate-none`.
- **`focus-ring` / `focus-ring-light`** — the standard `:focus-visible`
  treatment for controls built outside the shared Button/Pill (issue
  #215). `focus-ring` paints a background-gap ring in brand blue for
  light surfaces; `focus-ring-light` paints a white ring with a soft dark
  edge for controls on photography or dark overlays. Focus is never
  suppressed for aesthetics — every interactive control needs one of the
  shared focus treatments (Button/Pill carry their own).

#### Button press

Buttons and button-styled CTAs get a ~3% `scale` on `:active` — enough to
feel tactile on mouse and touch, too small to read as bounce. The press
uses the independent CSS `scale` property so it composes with translate/
rotate utilities already on the element. Text-link-style buttons
(`variant="link"`), nav links, and inline prose links do **not** press.

#### Card categories

- **Static informational cards** (course cards, dive-log entries): border
  or emphasis change only; no movement.
- **Explorable cards** (partner cards, accommodation cards):
  `transition-card` + `motion-safe:hover:-translate-y-0.5` +
  `hover:border-primary/30 hover:shadow-sm`.
- **Image-led cards** (`ImageCard`): restrained `motion-safe:` image zoom
  inside a static container — the card itself never moves.
- **Form containers**: `focus-within` border/shadow, no lift.

#### Dialogs

All dialogs share the same visual language: `animate-overlay-in` backdrop
+ `animate-rise-in` panel, instant exit, existing focus trap / Escape /
backdrop-click / focus-restore semantics preserved. Do not add spring,
large scale, or slide-in entrances.

#### Reduced motion

Every nonessential or continuous animation must opt out via
`motion-reduce:animate-none` or `motion-safe:` variants: bubble loader,
image zoom, card lifts, pin ping/float, carousel track, mobile menu,
skeleton pulses, dialog entrances. State changes must remain clear with
motion removed — reduced motion means instant, not absent.

#### When not to animate

- tiny inline text links (color change only)
- disabled or unavailable controls
- anything behind long-form prose or forms
- state feedback that reads better instantly (validation, counters)
- anything that would delay perceived responsiveness

---

## Navigation Structure

Primary navigation should remain simple and consistent.

Recommended structure:
- Diving
- Dive Sites
- Courses
- Plan Your Trip
- About
- Book

Optional utility links (if needed in header or footer only):
- Contact
- FAQ

Avoid:
- Deep navigation trees
- Large mega menus unless explicitly needed
- Too many first-level options
- Retail-style nav patterns

Users should reach key content within two clicks.

---

## Spacing System

Use consistent spacing increments to maintain rhythm.

Spacing scale:
- 4px
- 8px
- 16px
- 24px
- 32px
- 48px
- 64px
- 96px

Common layout spacing:

Section padding:
- 80–120px vertical

Card padding:
- 24–32px

Component spacing:
- 16–24px

Avoid inconsistent spacing values.

---

## Performance Targets

The site should meet modern performance standards.

Largest Contentful Paint:
- < 2.5 seconds

Interaction latency:
- < 200ms

Cumulative Layout Shift:
- < 0.1

Optimize images and video aggressively.
Prefer static rendering where possible.
Do not sacrifice clarity for visual effects.

---

## Design North Star
The site should communicate:

**“We are experienced, deliberate, and confident enough to slow down.”**

And visually:

**“Premium expedition diving on a special island.”**