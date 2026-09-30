# Community Support Integration (seasaba-web#189)

How `/donate` connects to the Community Support module in
`spizeck/contract-builder` (issue #143, implemented by PR #148).

## Architecture

```
Visitor
  -> seasaba.com/donate form (client validation only)
  -> POST /api/support-requests            (this repo, first-party boundary)
  -> POST {COMMUNITY_SUPPORT_API_BASE_URL}/api/community-support/requests
       (server-to-server, Bearer shared secret)
  -> Community Support backend -> Firestore -> CSR-YYYY-NNNN reference
```

The browser **never** calls the backend directly and never sees the ingest
key. Both env vars are unprefixed server-only values read by
`lib/community-support/server.ts`, which is guarded by `server-only` so a
client-bundle import fails the build.

Recipient reads are similar but unauthenticated:

```
donate page (server component, ISR)
  -> getDonationRecipients()
  -> GET {base}/api/public/community-support/recipients  (public DTO only)
  -> fallback: DONATION_RECIPIENTS in data/donations.ts
```

## Environment variables

| Variable | Purpose | Required |
|---|---|---|
| `COMMUNITY_SUPPORT_API_BASE_URL` | Backend deployment origin (e.g. `https://seasaba.app`; `http://localhost:<port>` for local dev against contract-builder) | For live integration; unset fails closed |
| `COMMUNITY_SUPPORT_INGEST_KEY` | Shared secret for POST .../requests (>= 16 chars; generate >= 32 bytes, `openssl rand -base64 48`) | For submissions; unset fails closed |

Rotation: update both deployments together. Submissions during the gap
fail closed (503 -> "unavailable") and the form can be retried. Preview
deployments should use a non-production backend + key (or stay unset).

## Submission contract

Browser -> `POST /api/support-requests`:

```json
{ "request": <SupportRequestDraft>, "idempotencyKey": "...", "submittedAt": "ISO-8601", "website": "" }
```

- `request` — the form draft verbatim. Every field present; optional
  strings sent as `""`. Field names/enums/limits are the backend's shared
  contract (`lib/community-support/contract.ts`, mirroring
  `src/shared/communitySupport/` @ contract-builder `bd3badb`).
- `idempotencyKey` — generated client-side per **distinct draft**
  (fingerprinted by content, not attempts). Retrying an unchanged draft
  replays safely; any edit mints a new key so a follow-up is a new record.
  The route sanitizes it (8-128 chars of `[\w:.-]`) or replaces it with a
  server-side UUID.
- `website` — honeypot. Any value => rejected before the draft is read.
- Body cap: 16 KB (a full draft is < 4 KB).

Boundary -> backend `POST {base}/api/community-support/requests`:

```json
{ "schemaVersion": 1, "idempotencyKey": "...", "source": "seasaba-web", "submittedAt": "...", "request": <draft> }
```

Backend responses: `201` accepted / `200` idempotent replay — both
`{ requestId, reference, duplicate }`; `4xx/5xx { error, fields? }`.

## Failure model

The route maps every backend outcome onto a small safe vocabulary —
`{ ok: true, reference }` or `{ ok: false, kind, fields? }`:

| kind | HTTP | When | Form behavior |
|---|---|---|---|
| `validation` | 400 | Local draft checks, honeypot, bad wire shape, or backend `invalid_payload`/`validation_failed` (field map passed through — names/messages only, never values) | Highlighted fields + retry |
| `rate_limited` | 429 | Backend fixed-window limit (30/min across the endpoint) | Wait-and-retry message; entries kept |
| `unavailable` | 503 | Transport failure, timeout (10 s), backend 5xx/`internal`/`not_configured`, 401/403 credential problems, 409 idempotency conflict | Retryable message + email/WhatsApp fallback links carrying the same draft |

Success is shown **only** after the backend returns a reference. Logging
anywhere in this path is limited to status/error codes and the reference —
never request bodies or applicant PII.

## Recipients read path

- Backend orders by `sortOrder`, then `name`; only `published` +
  review-`approved` records appear, projected through the
  `PublicDonationRecipient` allowlist (internal notes/review metadata can
  never reach the browser).
- `parsePublicRecipients` re-validates the DTO server-side and drops
  malformed records (e.g. `image` without `imageAlt`).
- `toDonationRecipient` maps nulls to optional fields and keeps images
  same-origin only (`/images/...`) — matching the no-hotlink registry
  policy and the absence of `next/image` remotePatterns.
- Cache: `fetch` with `next: { revalidate: 300 }` + page `revalidate =
  300`. ISR serves the last good payload during transient backend trouble;
  the backend's own headers (`s-maxage=300, stale-while-revalidate=600`)
  add a second stale layer at the CDN.
- Fallback: unconfigured / transport failure / non-2xx / malformed or
  empty response -> `DONATION_RECIPIENTS` (Sea & Learn Foundation, Saba
  Conservation Foundation) so verified content cannot disappear while the
  backend is being seeded and proven. Revisit once the backend registry is
  authoritative in production — at that point an *empty* published list
  may become meaningful rather than a fallback trigger, and
  `data/donations.ts` can be retired.

## Privacy / analytics

- The form now transmits directly to Sea Saba and requests persist in the
  Community Support system — the Privacy Policy reflects this
  (`/privacy`).
- Analytics fire only generic funnel events:
  `donation_request_started` / `submitted` / `succeeded` / `failed`
  (`reason` in `validation|rate_limited|unavailable`). No field values,
  names, amounts, or references ever enter GA4/GTM/Vercel Analytics.
- Sentry server config strips request bodies/headers already; nothing in
  the boundary adds PII to error reports.

## Relationship to issue #135

#135 proposed a separate `/sponsorship` page with Resend email delivery
and "no database by default". Superseded: the page is `/donate`; delivery
is the Community Support backend; the persistence question #135 deferred
is answered by contract-builder#143. Still honored here: non-PII funnel
analytics, accessible validation/status messaging, abuse controls
(honeypot + body cap + backend rate limit + idempotency), no false
success, privacy documentation, and an unmerged review PR.
