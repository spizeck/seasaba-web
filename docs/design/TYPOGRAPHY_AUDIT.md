# Typography Audit — Issue #112

> **Status: Audit findings + recommendations. Nothing in this document is an
> approved change.** Section 8 proposes a canonical system and Section 9 a
> heading-font strategy; both require owner review before implementation.
>
> Base SHA audited: `f5425a3` (origin/master). Measurements taken with
> `scripts/audit-typography.mjs` against a production build (`next build` +
> `next start`) in headless Chromium on Windows, September 2026.

---

## 1. Executive summary

Three findings matter more than everything else combined:

1. **Open Sans is loaded but never rendered.** The site downloads the Open Sans
   webfont on every pageview, yet all body/UI text computes to the Tailwind
   default system stack (`Segoe UI` on Windows, `San Francisco` on macOS/iOS,
   `Roboto` on Android). A CSS-variable scoping bug silently disconnects the
   font from the document. See §3.1.
2. **Headings render in four different fonts depending on the visitor's OS.**
   `Century Gothic` is not loaded as a webfont; it resolves only when the
   visitor happens to have it installed locally (Windows or macOS machines
   with Microsoft Office). `Poppins` — the next entry in the stack — is
   neither loaded nor installed anywhere, so it is a dead entry. macOS users
   without Office get `AppleGothic` (a Korean UI font); iOS and Android get
   their generic system sans. See §3.2.
3. **The declared type scale is not the implemented scale.** The design tokens
   (H1 56px, H2 32px, H3 28px, body 18px) describe almost nothing on the live
   site. In practice: H1s are 30/36/48/60px depending on the page, H2s are
   20px on content pages and 24→30px on the homepage, H3s range 12–24px, and
   the dominant body size is 14px — not 18px. See §5.

None of this is broken-looking — the site reads cleanly — but typography is
currently determined by accidents of the visitor's OS and by ~800 scattered
utility classes rather than by the design system.

---

## 2. What is declared

From `app/globals.css` (`@theme`) and `docs/design/THEME_UX_GUIDE.md`:

| Token | Declared value |
|---|---|
| Body/UI font | `--font-sans` → `var(--font-open-sans), "Open Sans", sans-serif` |
| Heading font | `--font-heading` → `"Century Gothic", "CenturyGothic", "AppleGothic", "Poppins", sans-serif` |
| Mono | `--font-mono` → `ui-monospace, "SFMono-Regular", monospace` |
| H1 | 36px mobile / 56px desktop |
| H2 | 32px |
| H3 | 28px |
| Body | 18px, line-height 1.5 |
| Small | 14px |
| Heading line-height | 1.25 |

Base rules apply `--font-heading` + `line-height: 1.25` to `h1–h6` and set
`body` to 18px/1.5. `app/(content)/layout.tsx` additionally wraps every
content page in `prose prose-slate` (Tailwind Typography plugin), which
carries its own independent type scale (see §4.3).

---

## 3. Font delivery — what actually loads and renders

### 3.1 Open Sans is fetched but unused

`app/layout.tsx` loads Open Sans via `next/font/google` (variable, weights
300–800, latin, `display: swap`) and puts the `--font-open-sans` CSS variable
on `<body>`. The font file itself is fetched — the audit's network capture
shows the woff2 downloaded on the homepage, and `document.fonts` (after
`fonts.ready`) reports one `Open Sans 300 800` face `loaded` with ten more
faces declared-but-`unloaded`. So the bytes arrive and the face is usable;
it is simply never applied to body text.

But body text never uses it. The chain:

1. Tailwind v4 emits `--default-font-family: var(--font-open-sans), "Open Sans", sans-serif` on `:root` (derived from our `--font-sans` theme entry).
2. `--font-open-sans` is defined **only on `<body>`** (the next/font variable class is applied to `<body>`, not `<html>`).
3. On the `<html>` element `--font-open-sans` is undefined, so `--default-font-family` becomes *guaranteed-invalid*.
4. Preflight's `html { font-family: var(--default-font-family, <Tailwind default stack>) }` therefore resolves to the fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", Arial, sans-serif, …`.
5. `<body>` inherits that computed value; nothing re-declares `font-family` on body, so `--font-open-sans` sits unused.

Verified by measurement on `/diving`: a 60-char paragraph measured
424.9px in the computed family — identical to `Segoe UI` (424.9px), and
different from `Open Sans` (447.3px). Body text renders in **Segoe UI** on
Windows.

The only places Open Sans actually applies are the three explicit
`font-sans` utilities in `components/experience-selector.tsx`.

**Recommended fix (needs owner approval — changes every page's rendering):**
move `openSans.variable` from `<body>` to `<html>` in `app/layout.tsx`, or
apply `font-sans` on `<body>`. One-line change; makes the declared body font
real. Alternatively, if the system-font body text is judged acceptable, the
Open Sans download should be removed to save bandwidth — but the design
guide explicitly names Open Sans, so the fix is preferred.

### 3.2 The heading stack is non-deterministic

`--font-heading` = `"Century Gothic", "CenturyGothic", "AppleGothic", "Poppins", sans-serif`.
**No heading font is loaded as a webfont.** What renders depends entirely on
locally installed fonts:

| Platform | What renders | Why |
|---|---|---|
| Windows + MS Office | Century Gothic | Century Gothic ships with Microsoft Office; it is **not** a Windows core font |
| Windows, no Office | Generic sans (e.g. Segoe UI) | Stack falls through every named entry |
| macOS + MS Office | Century Gothic | Office installs it on Mac too |
| macOS, no Office | **AppleGothic** | macOS system font (a Korean UI face whose Latin glyphs are a plain grotesque — visually unrelated to Century Gothic's geometric style) |
| iOS | San Francisco | Neither Century Gothic nor AppleGothic ships on iOS |
| Android / Linux | Roboto / system sans | None of the named fonts exist |

`Poppins` is **dead weight**: not loaded anywhere in the codebase, not a
system font on any platform. `CenturyGothic` (the PostScript name) does not
resolve as a family name on Windows.

Verified on the audit machine (Windows + Office): the homepage H1 resolves
to Century Gothic — the same text measures 618.7px in Century Gothic vs
571.3px in the sans-serif fallback (~8% wider, larger x-height). So the same
headline occupies materially different space and carries a different
personality depending on the visitor's OS. There is no webfont swap, hence
no FOIT/FOUT — but also no consistency.

Also worth noting: headings elsewhere in the stack (`font-weight`) are not
guaranteed — Century Gothic has a limited weight set, and italic Century
Gothic (used by the homepage hero H1) does not exist in all copies.

### 3.3 Third-party font usage

- `components/booking-widget.tsx` configures the Checkfront widget with
  `style: "font-family: Inter"`. Inter is not loaded by the site; inside the
  vendor iframe it falls back to the widget's own defaults. Cosmetic,
  third-party surface — low priority.
- Cookiebot / respond-io widgets render their own vendor typography.

### 3.4 Complete font inventory

| Declared | Loaded as webfont? | Actually renders? |
|---|---|---|
| Open Sans (`--font-sans`) | Yes (`next/font`, 300–800 latin + "Open Sans Fallback" size-adjusted fallback) | **No** — except 3 explicit `font-sans` uses |
| Century Gothic | No | Yes, on Office-equipped Windows/macOS only |
| CenturyGothic (PS name) | No | Not on audited platform |
| AppleGothic | No | Yes, on Office-less macOS only |
| Poppins | No | **Never** |
| `sans-serif` | n/a | Headings on iOS/Android/Linux/Office-less Windows |
| System sans stack | n/a | **All body/UI text** (via the §3.1 bug) |
| ui-monospace | n/a | 1 `font-mono` usage |
| Inter (Checkfront config) | No | Vendor iframe fallback |

---

## 4. The two competing type scales

### 4.1 The design-token scale (mostly dead)

The `--font-size-h1-*`/`h2`/`h3`/`body` tokens only apply to un-classed
elements **outside `.prose`** and are overridden by utilities almost
everywhere they could matter. Measured bare-element usage is rare — nearly
every heading and paragraph on the site carries an explicit `text-*` class.

### 4.2 The utility-class scale (what ships)

Usage counts across `app/` + `components/`:

| Utility | Count | Size | De facto role |
|---|---|---|---|
| `text-sm` | 375 | 14px | **Default body prose** on content pages; card copy; nav; buttons; labels; inputs; footer links |
| `text-xs` | 141 | 12px | Captions, metadata, footer column headings (uppercase/tracking-widest), badges, legal fine print |
| `text-xl` | 92 | 20px | **Content-page H2** (the dominant section-heading size) |
| `text-base` | 58 | 16px | Ledes (mobile), misc |
| `text-lg` | 28 | 18px | Ledes (desktop), card titles |
| `text-2xl/3xl/4xl/5xl/6xl` | 41 | 24–60px | H1s and homepage headings |
| `text-[10px]` | 1 | 10px | Dive-log count badge |

Weights: `font-semibold` (256) is the house heading/emphasis weight;
`font-medium` (121) for nav/labels/buttons; `font-bold` (16) mostly page H1s.
The homepage hero H1 renders at weight **400** italic.

Responsive: only `sm:` and `lg:` variants are used (23 total); no `md:` or
`xl:` text utilities. Line-height: `leading-relaxed` (209) dominates;
`tracking-tight` on display headings, `tracking-wide/widest` on uppercase
micro-labels.

### 4.3 The `.prose` scale (a third system)

`app/(content)/layout.tsx` wraps all content pages in `prose prose-slate`.
Inside `.prose`, un-classed elements get the plugin's own scale: body 16px/
1.75, h2 1.5em, h3 1.25em, h4 1em, plus slate-palette colors. Because these
are `em`-based, they **compound with sized ancestors**: a bare `<h3>` inside
a `text-sm` container measures 14 × 1.25 = **17.5px** (found on
`/visiting-yachts`); a bare `<h2>` inside `text-base` yields 24px; bare
`<h4>` inside `text-sm` yields 14px. These accidental off-scale sizes only
exist because `prose` is active — `not-prose` wrappers are already used to
fence card grids off from it.

---

## 5. Measured typography (production build, headless Chromium)

Reproducible via `node scripts/audit-typography.mjs` against `next start`.

### 5.1 H1 — four different treatments

| Surface | Classes | Mobile | Desktop | Weight | Font |
|---|---|---|---|---|---|
| Homepage hero | `font-heading italic text-3xl sm:text-5xl lg:text-6xl` | 30px | **60px** | 400 | heading stack |
| PageHero (`/diving`, `/courses`, `/plan-your-trip`, `/visiting-yachts`, `/about`, `/dive-sites`, `/dive-log`) | `text-3xl sm:text-4xl lg:text-5xl` | 30px | **48px** | 700 | heading stack |
| Utility pages (`/privacy`, `/terms`, `/cookie-policy`, `/book`, `/contact`) | `text-3xl sm:text-4xl` | 30px | **36px** | 700 | heading stack |
| Declared | — | 36px | 56px | — | — |

No page renders the declared 36/56. Homepage italic-vs-bold difference is
presumably intentional (display vs title) but undocumented.

### 5.2 H2 — three different treatments

| Surface | Computed | Weight |
|---|---|---|
| Content pages (all `prose` pages) | **20px** (`text-xl`) | 600 |
| Homepage sections | 24→30px (`text-2xl sm:text-3xl`) | 600 |
| Bare h2 inside `prose`/sized wrappers | 24px or 18px (em-compounding) | 600–700 |
| `/book` sidebar | 16px | 600 |
| `/dive-log` | 14px | 600 |
| Declared | 32px | — |

A 20px H2 over 14px body is a weak but consistent hierarchy on content
pages; it just isn't the documented system.

### 5.3 H3 — six+ different treatments

14px (the most common — card/panel titles on `/diving`, `/plan-your-trip`,
`/partners`), 16px, 17.5px (em-compounding), 18px (option/card titles),
20px, 24–30px (homepage feature headings). Declared: 28px — never used.

### 5.4 Body text — three sizes, none dominant by design

| Size | Where | Share |
|---|---|---|
| 14px (`text-sm`) | Default paragraph/list text on all content pages — 153 of ~176 text elements on `/diving`; all of `/privacy` & `/terms` body prose | **Dominant** |
| 16px | Un-classed `prose` paragraphs; ledes on mobile; `/book` | Minor |
| 18px (`text-lg`) | Desktop ledes only | Rare |

The declared 18px body exists only in `globals.css` and on desktop lede
paragraphs.

### 5.5 UI roles (consistent — the good news)

| Role | Computed | Notes |
|---|---|---|
| Nav links | 14px / 500 | Consistent desktop + mobile drawer |
| Buttons | 14px / 500–600 | `ui/button` + hero CTAs (15px inline in hero) |
| Form labels | 14px / 500 | contact-form |
| Form inputs | 14px / 400 | **<16px → iOS Safari auto-zooms on focus** |
| Footer links | 14px / 400 | |
| Footer column headings | 12px / 600 uppercase `tracking-widest` | `<p>`, not heading elements — fine |
| Captions/legal lines | 12px / 400 | |

### 5.6 Responsive behavior

H1s scale at `sm`/`lg`; nothing else does — all body and H2 text is flat
across 320→1440px. No clipped text at zoomed-equivalent widths (reflow OK).
One layout defect found: **`/about` overflows the viewport by ~4px at
mobile widths** (320–430px; clean from 768px up) — the testimonial
carousel's absolutely-positioned next-arrow uses `translate-x-5` and pokes
past the right edge (the only un-clipped offender; the 100vw PageHero is
safely clipped by its `overflow-hidden` shell). Minor — a few px of
horizontal scroll on one page — but worth a follow-up fix outside this
issue.

---

## 6. UX & accessibility findings

1. **Body prose at 14px is small for a premium content site.** It is the
   de facto standard here, consistent, and sits on good contrast
   (`--muted-foreground` was already darkened to ~5.4:1), so it is not an
   accessibility failure — WCAG sets no minimum size. But long pages
   (`/diving`, `/plan-your-trip`, `/privacy`, `/terms`) are dense at 14px;
   15–16px would measurably improve long-form reading, especially at arm's
   length on desktop. Legitimate exceptions: captions, metadata, legal
   fine-print, badges — small text there is correct and should stay.
   Recommendation: primary prose 16px, supporting 14px, caption 12–13px —
   see §8.
2. **Form inputs at 14px trigger iOS Safari's focus zoom** (<16px). Either
   accept the zoom (it is functional, mildly annoying) or set inputs to
   16px. Recommend 16px on inputs; labels can stay 14px.
3. **Heading hierarchy flattens on content pages.** H2 20px / H3 14–18px /
   body 14px means some H3s are the same size as the body copy under them,
   differentiated only by weight+color. Scannability suffers on long pages.
4. **Italic weight-400 hero H1** at 30px mobile is a deliberate-looking
   display choice; at 60px desktop it works. Keep, but document it as a
   "display" role.
5. **Font-fallback layout shift:** no webfont swap means no CLS from
   headings — but a Windows+Office visitor and an iOS visitor see
   materially different wordmarks in headings (~8% width delta measured).
   Open Sans's `next/font` "Open Sans Fallback" is size-adjusted, so when
   §3.1 is fixed, body swap CLS should be minimal.
6. **200% zoom / reflow:** no text failures — no fixed-height text
   clipping. Only truncation points are intentional (`dive-log` site names,
   modal prev/next labels), all with adjacent context. One non-typography
   layout defect: `/about` has ~4px of horizontal overflow at mobile widths
   from a carousel arrow's `translate-x-5` (see §5.6).
7. **Text-spacing (WCAG 1.4.12):** no containers clip enlarged
   letter/line-spacing in normal prose; `prose` margins are safe.
8. **Links:** underline-less by design (documented in the guide); legal
   pages do use `underline` for in-prose links — acceptable.
9. **Reading measure:** content column is `max-w-6xl` with `prose
   max-w-none` — most prose sits inside card grids of reasonable width, but
   full-width sections on `/plan-your-trip` already self-limit with
   `max-w-prose`. Consistent enough.
10. **Semantic HTML:** H-tags are used for visual hierarchy correctly
    (h1→h2→h3 order holds); footer's visual "headings" are `<p>` with an
    uppercase style, which is fine since they label nav landmarks, not
    document sections.

---

## 7. Deliberate vs accidental

**Looks intentional (keep, but name it):**
- 14px UI chrome (nav, buttons, labels, footer) — a coherent choice.
- 12px uppercase micro-labels — consistent pattern.
- Content-page H2 at 20px — consistent across all `prose` pages.
- `leading-relaxed` on prose — consistent.
- Italic display H1 on the homepage.

**Accidental drift (should be fixed in implementation):**
- Open Sans not rendering at all (§3.1) — a bug, not a choice.
- Poppins in the heading stack — dead entry.
- 17.5px/24px/14px headings from `prose` em-compounding inside sized
  wrappers (e.g. `/visiting-yachts` 17.5px H3, `/courses` 12px H4).
- H3 sizes ranging 12–30px; `/dive-log` H2s at 14px; `/book` sidebar H2 at
  16px — same tag, unrelated roles.
- Homepage H3 at five different sizes.
- Privacy/Terms main prose at 14px while every other page's *lede* is
  16–18px — probably fine for legal, but it happened by copy-paste, not
  policy.
- Declared tokens (56/32/28/18) describing nothing.

---

## 8. Proposed canonical system (recommendation — needs approval)

Semantic roles instead of scattered sizes. Sizes chosen to be close to what
the site *already does well* (minimal visual churn) while restoring real
hierarchy:

| Role | Family | Size (mobile → desktop) | Weight | Line-height |
|---|---|---|---|---|
| Display (hero) | heading | 30 → 48–60 | 400–600, italic allowed | 1.1–1.25 |
| H1 | heading | 30 → 40 | 700 | 1.2 |
| H2 | heading | 22 → 28 | 600 | 1.25 |
| H3 | heading | 18 | 600 | 1.3 |
| H4 / card title | heading or sans | 16 | 600 | 1.35 |
| Body | Open Sans | 16 | 400 | 1.6 |
| Lede | Open Sans | 16 → 18 | 400 | 1.6 |
| Supporting/secondary | Open Sans | 14 | 400 | 1.5 |
| Caption / legal fine-print | Open Sans | 12–13 | 400 | 1.45 |
| Nav link | Open Sans | 14 | 500 | — |
| Button | Open Sans | 14 | 600 | — |
| Form label | Open Sans | 14 | 500 | — |
| Form input | Open Sans | 16 | 400 | — |
| Overline (uppercase micro-label) | Open Sans | 12 | 600 | —, `tracking-widest`, uppercase |

Notes on the choices:

- **Body 16px, not 18px.** The declared 18px never shipped; the site's real
  content density is built around 14–16px. 16px splits the difference,
  matches `prose`'s default, and is the accessibility-comfortable norm.
- **H2 22→28px** restores hierarchy over 16px body without the declared
  32px jump that the design clearly moved away from.
- **Legal/main-policy prose** may legitimately stay at 14px *as a stated
  policy* ("legal pages use supporting size"), or move to 16px — owner
  call. Either is defensible; the audit only asks that it be deliberate.
- Implement as a small set of utilities/components (e.g. `.text-lede`,
  `.text-supporting`, `.text-caption`, heading classes or a `prose` config)
  rather than per-element `text-*` picks.

### Where to implement (sketch, not done)

1. Fix `--font-sans`/`--default-font-family` wiring (§3.1 one-liner).
2. Replace `prose prose-slate` global wrapper usage with either a
   configured `prose` matching the canonical scale, or drop the plugin and
   let base rules + semantic utilities handle it — the plugin is currently
   the source of every accidental size (em-compounding) and duplicates the
   token scale.
3. Codify the role table as utilities; sweep the ~800 `text-*` usages into
   roles. Biggest wins: content-page H2s (`text-xl`→H2 role), card H3s,
   prose `text-sm`→body/supporting roles.
4. Inputs → 16px.

---

## 9. Heading-font decision (recommendation — needs approval)

**Recommended: Option B — load a geometric webfont deterministically,
placed first in the stack.**

| Option | Verdict |
|---|---|
| **A. Keep Century Gothic, deliver it deterministically** | Requires buying a Monotype webfont license and self-hosting. Real cost + license management; largest CLS/perf surface of the three; still needs a fallback stack for non-licensed delivery. Only if the owner considers literal Century Gothic core to the brand. |
| **B. Load a similar free webfont (recommended)** | `next/font/google`, zero license cost, deterministic everywhere, subsettable, size-adjusted fallback for ~0 CLS. |
| **C. System-font headings** | Free and fast but throws away heading personality; headings would render in the same family as body. Weakens the premium/editorial feel. Not recommended. |

Candidate webfonts (all OFL, all on Google Fonts / `next/font`):

- **Jost** — closest visual match: a Futura-derived geometric like Century
  Gothic, light and spacious. Best preserves the current look on
  Office-equipped machines. Slightly less common → marginally less
  battle-tested hinting.
- **Poppins** — already named in the stack (suggesting prior intent),
  geometric, extremely well-hinted and popular. Reads a bit heavier/sturdier
  than Century Gothic at the same weight.
- Montserrat, Questrial — viable but further from CG's proportions.

**Suggested stack:** `var(--font-jost-or-poppins), "Century Gothic", sans-serif`
— webfont first so *every* visitor sees the same heading font (determinism
is the point); Century Gothic kept only as a graceful fallback if the
webfont fails. My pick is **Jost** for fidelity, with **Poppins** as the
safe alternative. Owner decision: Jost vs Poppins, and whether Option A
(licensed real Century Gothic) is worth the cost.

Licensing note: bundling actual Century Gothic requires a paid Monotype
webfont license — it cannot legally be self-hosted from an Office
installation. Both recommended candidates are OFL-free.

### Follow-up work proposal (post-approval)

1. **Fix the Open Sans wiring** (move `openSans.variable` to `<html>`). Tiny
   PR, biggest single visual change.
2. **Heading webfont PR** — add chosen font via `next/font`, update
   `--font-heading`, drop Poppins/CenturyGothic/AppleGothic dead entries
   (keep "Century Gothic" as last resort before sans-serif).
3. **Canonical-scale PR** — utilities/components per §8, sweep `text-*`
   usages, resolve `prose` conflict (configure or remove the plugin),
   inputs →16px.
4. Update `THEME_UX_GUIDE.md` to match the *approved* system.

---

## 10. Re-running this audit

```bash
npm run build
node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100 &
node scripts/audit-typography.mjs        # JSON → stdout
```

The script covers all 14 public routes × six widths and reports:

- per-element computed family/size/weight/line-height for canonical roles
  (h1/h2/h3, first body paragraph, nav link, CTA, form label/input, footer
  link, footer column heading, copyright caption)
- per-page histograms of `main` text-element and heading sizes at 375px and
  1440px (reproduces the distributions in §5)
- local availability of each heading-stack name (machine-dependent — on
  Linux CI all entries should report unavailable, which is itself the
  demonstration of non-determinism)
- which font files were actually fetched over the network, and the
  `document.fonts` face list split into `loaded` vs declared-but-unloaded
  (after `fonts.ready`) — loaded evidence is never inferred from a face
  merely existing
- the `--font-open-sans`/`--default-font-family` variable resolution on
  `<html>` vs `<body>` (reproduces the §3.1 mechanism)
- which heading-stack entry a rendered H1 actually resolves to
- horizontal-overflow detection at 320px per route

Exit code is 1 if the server is unreachable or any route/probe fails
(failures are also recorded under `errors` in the JSON); 0 only on a clean
run.
