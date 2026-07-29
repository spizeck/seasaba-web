# Cookiebot Consent Management — Setup, GTM Configuration & Testing

This document is the single source of truth for deploying Cookiebot CMP on
`seasaba.com`, wiring it into GTM container `GTM-5PFMJFN`, and validating
consent behavior for every tag currently running through GTM (GA4, Google
Ads, Microsoft Ads UET, Microsoft Clarity, Meta Pixel, Vercel Analytics,
custom events, Checkfront).

**Scope of code changes made in this repo** (see "Code Changes" section) vs.
**work that must be done manually in the Cookiebot and GTM dashboards** (see
"Manual Dashboard Configuration"). Most of this task is dashboard
configuration — it cannot be expressed as application source code, since the
Cookiebot script itself is deployed through GTM, not through Next.js.

---

## 1. Code Changes Made in This Repo

| File | Change |
|---|---|
| `.env.example` | Added `NEXT_PUBLIC_COOKIEBOT_CBID` placeholder (documented, **not** guessed). |
| `next.config.ts` | Added Cookiebot domains (`consent.cookiebot.com`, `consentcdn.cookiebot.com`) to `script-src`, `script-src-elem`, `connect-src`, and `style-src`. All existing directives/domains preserved. |
| `components/cookie-settings-button.tsx` | New shared button component that calls `window.Cookiebot.renew()` to reopen the preference dialog. Guards against `Cookiebot` being undefined. |
| `components/footer.tsx` | Added a "Cookie Settings" button (bottom bar) and a "Cookie Policy" link (Resources column), both using the new component/route. |
| `app/(content)/cookie-policy/page.tsx` | New `/cookie-policy` page: explains categories, embeds Cookiebot's auto-generated cookie declaration script (`https://consent.cookiebot.com/{CBID}/cd.js`), links to `/privacy`, and includes the Cookie Settings button. |
| `app/(content)/privacy/page.tsx` | Added a link from the existing "Cookies and Analytics" section to `/cookie-policy`. |

**No changes were made to:** `components/analytics-loader.tsx`, `lib/analytics.ts`,
or any other tracking code. GTM remains the single source of truth for GA4,
Google Ads, Microsoft UET, Clarity, and Meta Pixel — nothing was duplicated
into Next.js.

### Why the Cookiebot script is NOT added via `next/script`

Per the task requirements, Cookiebot must be deployed through the official
**Cookiebot CMP** GTM community template so its Consent Initialization
trigger can guarantee it runs before every other tag, and so GTM's built-in
Consent Mode signals are respected. Adding a second copy via Next.js would
create a race condition and risk duplicate/undefined consent state. The only
Cookiebot script loaded directly by Next.js is the **cookie declaration
script** on `/cookie-policy` (informational widget only, not the CMP itself).

---

## 2. Manual Dashboard Configuration Required

### 2.1 Cookiebot Account Setup

1. Create/access the Cookiebot account.
2. Add `seasaba.com` to the domain group.
3. Add `www.seasaba.com` as well if Cookiebot's domain scan does not
   automatically treat it as the same domain group.
4. Set the banner language to English.
5. Enable **explicit consent** (opt-in, not implied).
6. Confirm the banner displays equally accessible **Accept All** and
   **Reject All** buttons (not just "Accept" + a buried "Settings" link).
7. Enable granular category toggles: Necessary, Preferences, Statistics,
   Marketing.
8. Enable **Google Consent Mode** in Cookiebot's settings (Data Processing /
   Consent Mode section).
9. If Cookiebot's regional/geo behavior is enabled, verify it does **not**
   auto-grant `ad_storage`/`analytics_storage` for any region unless that is a
   deliberate, documented decision. Default should remain "opt-in everywhere"
   unless legal guidance says otherwise.
10. Copy the **Domain Group ID (CBID)** from Cookiebot → Settings → Your
    Scripts, and set it as `NEXT_PUBLIC_COOKIEBOT_CBID` in Vercel's
    Environment Variables (Production, Preview, and Development).

> Do not guess this ID. The `/cookie-policy` page and the footer button will
> not fully work until a real CBID is set — the cookie declaration script
> shows an explanatory fallback message, and `Cookiebot.renew()` silently
> no-ops, until the real Cookiebot CMP tag is live in GTM.

### 2.2 GTM Tag: Cookiebot CMP - Consent Initialization

In GTM:

1. **Tags → New**
   - Name: `Cookiebot CMP - Consent Initialization`
   - Tag type: search the Community Template Gallery for the official
     **Cookiebot CMP** template (published by Cybot).
   - Configuration:
     - Cookiebot Domain Group ID: paste the real CBID.
     - Enable Google Consent Mode: **Yes**.
     - Use default consent initialization behavior (do not override the
       template's built-in `gtag('consent', 'default', ...)` push).
     - Enable URL passthrough: **Yes**, if your Google Ads/GA4 setup relies
       on click IDs (`gclid`) for conversion matching under denied consent.
     - Enable ads data redaction: **Yes**, if available in the template —
       this is Google's recommended default when `ad_storage` is denied but
       traffic still needs to reach Google Ads with reduced data.
   - Trigger: **Consent Initialization - All Pages** (create this trigger
     type if it does not already exist; it is a distinct trigger category
     from a normal Page View trigger, and GTM requires it for tags that must
     run before consent-gated tags).

2. **Do not** use a Page View or "All Pages" DOM Ready/Initialization trigger
   for this tag. Consent Initialization triggers run in GTM's dedicated
   consent phase, before any other trigger type fires.

### 2.3 Google Consent Mode v2 — Defaults

Confirm the Cookiebot template sets these defaults automatically (it does, by
design, when "Enable Google Consent Mode" is on):

```
ad_storage: denied
analytics_storage: denied
ad_user_data: denied
ad_personalization: denied
```

Mapping after user choice (handled natively by the Cookiebot template — do
**not** duplicate with manual `gtag('consent', 'update', ...)` pushes unless
testing shows the template isn't covering a specific tag):

| Cookiebot category | Consent Mode signal |
|---|---|
| Statistics accepted | `analytics_storage: granted` |
| Marketing accepted | `ad_storage: granted`, `ad_user_data: granted`, `ad_personalization: granted` |
| Preferences rejected | `functionality_storage` stays denied (no justified necessity case identified for this site) |
| Necessary | always available (booking/session cookies only) |

### 2.4 Audit of Existing GTM Tags — Consent Checks

For each tag, open **Tag → Advanced Settings → Consent Settings** and confirm
(or add) the following. Prefer each tag's **built-in consent check** (GA4 and
Google Ads tags auto-detect `analytics_storage`/`ad_storage` when Consent
Mode is present) over an **Additional Consent Check**, which should only be
added when a tag has no native awareness of Consent Mode.

| Tag | Built-in check (verify) | Additional Consent Check to add if missing |
|---|---|---|
| GA4 Configuration / GA4 Event tags | `analytics_storage` | — |
| Google Ads Conversion | `ad_storage`, `ad_user_data`, `ad_personalization` | — |
| Google Ads Remarketing | `ad_storage`, `ad_user_data`, `ad_personalization` | — |
| Microsoft UET Base tag | none natively | See Section 2.5 (Advanced Consent Mode pattern) |
| Microsoft UET Custom Purchase Conversion | none natively | `ad_storage` |
| Microsoft Clarity | none natively | `analytics_storage` (documented choice — see note below) |
| Meta Pixel | none natively (unless using Meta's official GTM template with consent support) | `ad_storage` |
| Custom click/form event tags (dataLayer-based) | N/A — these fire regardless of marketing/statistics consent since they only push to `dataLayer`, they do not themselves set third-party cookies | No consent check needed on the *push*; the check belongs on whichever downstream tag consumes the event |
| Checkfront booking tracking (native Checkfront GTM beta) | N/A — necessary functional tracking | Do not gate; see Section 2.7 |

**Clarity category decision:** Clarity is session-replay/heatmap analytics,
not advertising. This document treats it as **Statistics** (`analytics_storage`)
for consistency with GA4. If you decide Clarity should instead be treated as
Marketing, use `ad_storage` everywhere below and update this table — do not
mix both.

### 2.5 Microsoft UET — Advanced Consent Mode

Microsoft's dashboard currently reports **"UET Consent Mode Status: Need
attention."** Fix with three GTM tags:

**Tag 1 — `Microsoft UET - Consent Default`**
```js
window.uetq = window.uetq || [];
window.uetq.push("consent", "default", {
  ad_storage: "denied"
});
```
- Trigger: **Consent Initialization - All Pages**
- Must fire before the UET base tag.

**Tag 2 — `Microsoft UET - Consent Granted`**
```js
window.uetq = window.uetq || [];
window.uetq.push("consent", "update", {
  ad_storage: "granted"
});
```
- Trigger: Cookiebot marketing-consent-granted trigger (the Cookiebot
  template exposes a consent-update event/variable — use it rather than
  polling the DOM or banner text).

**Tag 3 — `Microsoft UET - Consent Denied`**
```js
window.uetq = window.uetq || [];
window.uetq.push("consent", "update", {
  ad_storage: "denied"
});
```
- Trigger: Cookiebot consent-update event where marketing = false (covers
  both an explicit "Reject" and a later withdrawal via "Cookie Settings").

**Important:** Per Microsoft's Advanced Consent Mode model, the **UET base
tag itself should still load** (it does not need to be blocked by a
marketing-consent trigger) — it just needs to receive the `denied` default
from Tag 1 before it initializes, so it can still send cookieless
conversion-modeling signals. Blocking the base tag entirely would prevent
Microsoft from receiving any consent-state signal at all, which is what
triggers "Need attention" in the first place.

**Existing Microsoft purchase tag:** do not change unless testing in Section
4 reveals a problem. It should continue to fire with:
- `EventAction: purchase`
- Revenue: Checkfront revenue variable
- Currency: `USD`
- Transaction ID: Checkfront booking ID

Add the `ad_storage` Additional Consent Check from the table in 2.4 to this
tag so it respects denied consent, but leave its trigger and other fields
untouched.

### 2.6 Microsoft Clarity Consent

Preferred: if the currently installed Clarity tag/snippet version supports
consuming Google Consent Mode natively, no separate Clarity API calls are
needed beyond the `analytics_storage` Additional Consent Check in 2.4 —
verify this against the exact Clarity snippet version installed before
adding anything else.

If the installed Clarity tag does **not** honor Consent Mode automatically
and Clarity Consent API v2 calls are required, add tags with triggers on
Cookiebot's statistics/marketing consent-update events:

```js
// Statistics granted only
clarity("consentv2", {
  ad_Storage: "denied",
  analytics_Storage: "granted"
});

// Statistics + Marketing granted
clarity("consentv2", {
  ad_Storage: "granted",
  analytics_Storage: "granted"
});

// Denied / withdrawn
clarity("consentv2", {
  ad_Storage: "denied",
  analytics_Storage: "denied"
});
```

Verify exact casing (`ad_Storage`, `analytics_Storage`) and method name
against Clarity's current documentation before shipping — Microsoft has
changed this API's shape between versions. **Do not** ship both the Consent
Mode integration and duplicate manual `clarity("consentv2", ...)` calls
unless testing shows Consent Mode alone isn't reaching Clarity (i.e., pick
one method, not both).

### 2.7 Meta Pixel Consent

Treat as **Marketing**.

- Add the `ad_storage` Additional Consent Check to the Meta Pixel base tag
  (table in 2.4) if using a GTM template that supports Consent Mode.
- If using Meta's own consent API instead, add:
  - `Meta Pixel - Consent Revoke` tag: `fbq("consent", "revoke");` on
    **Consent Initialization - All Pages**.
  - `Meta Pixel - Consent Grant` tag: `fbq("consent", "grant");` on the
    Cookiebot marketing-consent-granted trigger.
- Ensure the Pixel's `PageView` event fires exactly once, gated behind the
  marketing consent check — not once unconditionally at page load and again
  after consent updates. If the base tag currently fires on every page view
  regardless of consent, add the `ad_storage` check to that same tag rather
  than creating a second, consent-gated `PageView` tag.

### 2.8 Do Not Gate Checkfront

Checkfront's native GTM beta integration and the booking iframe itself
should **not** receive consent requirements — booking functionality is
necessary, not optional. Leave those tags/triggers unchanged.

---

## 3. Content Security Policy — What Was Added

Confirmed via Cookiebot's official documentation (script hosts:
`consent.cookiebot.com` for the CMP loader and consent-logging endpoint,
`consentcdn.cookiebot.com` for CDN-hosted banner assets/styles):

| Directive | Domains added |
|---|---|
| `script-src` | `https://consent.cookiebot.com`, `https://consentcdn.cookiebot.com` |
| `script-src-elem` | same two, kept identical to `script-src` |
| `connect-src` | same two (consent state is logged back to Cookiebot) |
| `style-src` | `https://consentcdn.cookiebot.com` (banner CSS) |
| `img-src` | no change needed — already `'self' data: https:'`, which covers any Cookiebot image assets |
| `frame-src` | no change made — the official Cookiebot CMP does not require an iframe for the banner itself; if the Cookiebot cookie-declaration widget ever needs an iframe embed, add `https://consent.cookiebot.com` here and re-verify in the network log first |

No existing directive, domain, or `unsafe-inline`/`unsafe-eval` entry was
removed. **Before final production sign-off, open DevTools → Network on a
fresh profile, load the site with the real Cookiebot CMP tag live in GTM, and
confirm no CSP violations appear for any Cookiebot-related request** — if a
host is missing from the table above, add only that specific host, not a
wildcard.

---

## 4. Required Vercel Environment Variables

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_COOKIEBOT_CBID` | Real Domain Group ID from Cookiebot | Do not commit a real value to `.env.example`; set it in Vercel Project Settings → Environment Variables for Production, Preview, and Development. |

All other existing env vars (`NEXT_PUBLIC_GTM_ID`, Firebase, etc.) are
unchanged.

---

## 5. Checkfront Iframe Consent Limitation

The Checkfront booking widget is embedded from `seasaba.checkfront.com` — a
**cross-origin iframe**. Browser security (Same-Origin Policy) means the
parent page's `Cookiebot` object, `dataLayer`, and Google/Microsoft Consent
Mode state are **not** automatically accessible inside that iframe's own
`window`, and the parent cannot read or write the iframe's cookies/storage
directly.

**What this means in practice:**
- Checkfront's own GTM container (running inside the iframe via Checkfront's
  GTM beta integration) has **no direct access** to the parent site's
  Cookiebot consent decision unless Checkfront explicitly supports one of the
  safe integration paths below.
- The Microsoft UET purchase event that fires inside the Checkfront iframe is
  therefore controlled by whatever consent state exists **inside Checkfront's
  own GTM container**, not by the parent page's Cookiebot banner.

**Safest supported options, in order of preference:**

1. **Ask Checkfront support** whether their GTM beta integration has a
   documented way to accept an externally-provided consent state (e.g., a
   Checkfront setting, a supported query parameter, or a documented
   `postMessage` contract). This is the only fully safe path, since it is
   sanctioned by the entity that controls the iframe's origin.
2. **Mirror the consent setup inside Checkfront's own GTM container**: if
   Checkfront's GTM container can itself run a Cookiebot CMP tag (pointed at
   the same Cookiebot domain group, since Cookiebot's consent record can be
   domain-group-scoped rather than strictly single-origin, depending on your
   Cookiebot plan), it can independently reach the same consent decision
   without needing cross-origin access. **Verify with Cookiebot support**
   whether your plan/domain-group configuration supports this before
   implementing.
3. **Do not** implement a generic `window.postMessage` listener with an
   unrestricted/wildcard origin check to relay consent into the iframe. That
   pattern is explicitly excluded by this task's requirements as insecure,
   and no supported, documented Checkfront listener for this exists at the
   time of writing.

**Current status:** Consent propagation into the Checkfront iframe could
**not** be verified as safely solvable from the parent Next.js codebase
alone — it depends on Checkfront's own GTM container configuration and/or
official support confirmation. The parent-site implementation (Sections 1–4)
is complete and functions independently of this limitation. **This must be
followed up directly with Checkfront support before assuming their purchase
event is consent-aware.**

---

## 6. Testing Checklist

Test with a fresh browser profile, clearing cookies/local storage/session
storage/prior Cookiebot consent before each case. Fill in Pass/Fail after
running each case against the live GTM Preview + production deployment.

| Case | Scenario | Expected result | Result |
|---|---|---|---|
| A | No interaction with banner | Necessary functions work; all four consent signals denied; UET reports denied; no Meta marketing cookies; no persistent Clarity cookies; no non-essential analytics cookies | ☐ |
| B | Reject all | Denied state persists; GA4/ad tags behave as denied; Microsoft consent denied; Meta revoked; Clarity denied/no-cookie; booking still works | ☐ |
| C | Accept statistics only | `analytics_storage` granted; `ad_storage`/`ad_user_data`/`ad_personalization` denied; GA4 permitted; ad tags denied; Clarity matches chosen category; Meta denied | ☐ |
| D | Accept all | All four signals granted; UET granted; Meta receives consent; Clarity granted; GA4/ad tags operate normally | ☐ |
| E | Withdraw consent (via Cookie Settings button) | Update fires immediately; future behavior denied; no duplicate PageView/conversion; Cookiebot records new choice | ☐ |
| F | Returning visitor (saved consent) | Saved consent applies before tags execute; banner does not reappear unnecessarily; no race condition creates marketing cookies before restore | ☐ |

**Pre-completion sanity checks** (run once, in addition to the table above):
- ☐ Ordinary page navigation works, no hydration errors, no console errors
- ☐ Checkfront booking flow completes successfully
- ☐ Existing Microsoft purchase tag still fires with correct fields
- ☐ Consent values change correctly across all four signals
- ☐ No tag fires twice for the same user action
- ☐ No new CSP violations in DevTools console
- ☐ Cookie Settings button works after client-side route changes (no duplicate Cookiebot script, no stale reference)
- ☐ Keyboard focus reaches Accept/Reject/Customize controls; banner usable without a mouse

---

## 7. Validation Tools

1. **GTM Preview / Tag Assistant** — Consent tab: confirm defaults at Consent
   Initialization and updates after each user choice; confirm each tag's
   listed consent state matches Section 2.4.
2. **Browser DevTools → Application → Cookies** — inspect before/after each
   consent choice in the table above.
3. **Microsoft UET Tag Helper** — confirm `consent mode set: true`, denied
   default before marketing consent, granted update after, and that the
   purchase event still sends `EventAction = purchase`.
4. **Microsoft Ads dashboard** — re-check "UET Consent Mode Status" after
   Microsoft has processed sufficient live traffic post-deployment.
5. **Cookiebot scan + Consent Mode checker** — run a fresh scan after
   deployment to confirm the declaration and Consent Mode wiring.
6. **Clarity dashboard** — confirm consent signals are received and no
   persistent cookies are created pre-consent.
7. **Meta Pixel Helper** — confirm `PageView`/custom events do not fire
   before marketing consent and are not duplicated after.

---

## 8. Rollback Plan

If the Cookiebot CMP tag causes a regression (e.g., blocks booking, breaks
GTM Preview, or breaks an existing conversion tag):

1. **In GTM:** pause/disable the `Cookiebot CMP - Consent Initialization`
   tag and the three Microsoft UET consent tags. Do **not** delete them —
   disabling preserves configuration for a retry.
2. **Publish a new GTM version** with those tags paused. This immediately
   restores the pre-Cookiebot tag behavior (GA4/Ads/UET/Clarity/Meta continue
   running exactly as before, ungated) without any Next.js deployment.
3. **In Vercel:** the code changes in this repo (CSP additions, footer
   button, `/cookie-policy` page) are safe to leave deployed even with
   Cookiebot paused in GTM — the footer button simply no-ops (guarded against
   `Cookiebot` being undefined), and `/cookie-policy` shows the "not yet
   configured" fallback message instead of the live declaration script.
4. If a full code rollback is also desired, revert the commit(s) that
   introduced `.env.example`'s `NEXT_PUBLIC_COOKIEBOT_CBID` entry, the CSP
   additions in `next.config.ts`, `components/cookie-settings-button.tsx`,
   `app/(content)/cookie-policy/page.tsx`, and the footer/privacy-page links.
   None of these changes touch `analytics-loader.tsx` or `lib/analytics.ts`,
   so existing tracking is unaffected either way.
5. Re-enable the paused GTM tags only after the root cause is fixed and
   Section 6's test cases pass again in GTM Preview.

---

## 9. Deliverables Summary (cross-reference to task requirements)

1. **Source-code changes** — Section 1.
2. **GTM tags/triggers/variables to create manually** — Sections 2.2, 2.5,
   2.6, 2.7.
3. **Exact trigger conditions** — inline with each tag in Sections 2.2–2.7.
4. **Exact consent checks per existing tag** — Section 2.4 table.
5. **Required Vercel environment variables** — Section 4.
6. **CSP changes** — Section 3 (also directly in `next.config.ts`).
7. **Cookiebot dashboard configuration steps** — Section 2.1.
8. **Testing checklist with pass/fail** — Section 6 (fill in `Result` column
   during actual testing; screenshots/evidence from GTM Preview should be
   attached separately since this is a Markdown file).
9. **GTM Preview screenshots** — not included in this file; capture during
   Section 6 testing and store alongside this document or attach to the
   deployment ticket.
10. **Rollback plan** — Section 8.
11. **Checkfront iframe limitation** — Section 5.

**Not done automatically:** the GTM container has **not** been published as
part of this work. Publishing requires explicit authorization per the task
instructions — do so only after Section 6's checklist passes in Preview
mode.
