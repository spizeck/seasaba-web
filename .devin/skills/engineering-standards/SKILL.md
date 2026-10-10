---
name: engineering-standards
description: Organizational architecture and engineering standards for our Next.js/React/TypeScript applications — Firebase Auth + server-side authorization, Prisma/Postgres persistence, UI/domain/persistence separation, environment configuration. Use when making architectural decisions, adding features that touch auth/data/env layers, or evaluating whether a pattern matches house style. Not needed for narrow bug fixes inside an existing pattern.
---

# Engineering standards

Shared architecture doctrine for the applications in this ecosystem
(extracted from production code across the portfolio). **This is shared
guidance — the repository's own AGENTS.md, ADRs, and existing
implementation always take precedence.** Where this skill and the repo
disagree, follow the repo and report the discrepancy.

## Stack baseline

- **Next.js (App Router) + React + TypeScript strict mode.** Prefer
  Server Components and static rendering; client components only where
  interactivity requires them.
- **npm + one lockfile + `.nvmrc`.** Do not introduce a second package
  manager or float dependency specs.
- **No new frameworks, state libraries, or parallel abstractions** —
  reuse the repo's existing auth, validation, logging, data-access,
  and email boundaries.

## Layering

- **UI (components/routes) → domain logic (`lib/` or equivalent) →
  persistence (Prisma/Firestore).** Routes and components orchestrate;
  they do not carry business rules.
- One canonical data-access path per store. Do not create a second
  Prisma client, a second Firebase app, or ad-hoc fetchers beside the
  established abstraction.
- Shared logic used by both client and server must not transitively
  import server-only or client-only SDKs (e.g. no `firebase-admin` in a
  module a client component can reach; no Firebase *client* SDK shipped
  to routes that don't need it).

## AuthN/AuthZ

- **Firebase Authentication** for identity; **authorization is enforced
  server-side, always.** Hiding a control in the UI is not
  authorization. Every privileged API action re-verifies the actor:
  ID-token verification via Admin SDK plus claims and/or a role record
  — whatever the repo's enforcement module already does.
- Custom claims, role boundaries, invitation/bootstrap lifecycle, and
  rules files (`firestore.rules`, `storage.rules`) are
  security-sensitive: changes require tests that fail if the control
  is removed.
- Firestore/Storage security rules are code — reviewed like
  application code and covered by emulator tests where the repo has
  them.

## Data

- **Prisma + PostgreSQL (Neon)** is the managed-SQL stack; **Firestore**
  is the document store in Firebase-centric apps. Do not add a second
  database/ORM to a repo that already has one.
- Model invariants that must survive bugs, concurrency, and future code
  paths as **database constraints**, not application checks.
- Expand/contract migrations only (see the `database-safety` skill).

## Multi-tenant / multi-entity isolation

- Tenant or entity scoping is a server-enforced filter on every query —
  never a client-supplied parameter trusted as-is.
- Cross-tenant reads require explicit authorization, not "the id was
  knowable." If the repo has a tenant model, locate its enforcement
  point before writing queries.

## Environment configuration

- **Validated, lazy, per-concern env parsing** — nothing reads
  `process.env` at module load; `next build` evaluates no service
  clients (CI runs with zero secrets and must keep working that way).
- `NEXT_PUBLIC_*` is public by design; everything without the prefix is
  a secret. Never add dummy or real values to make CI pass.
- `.env*` is gitignored; committed example files carry names and
  comments only.

## Tests and verification

- Tests proportional to risk: pure unit tests for logic, integration
  tests against real-but-disposable infrastructure (Docker Postgres,
  Firebase emulators), thin browser smoke tests against the production
  build.
- Run the repo's own check gate before reporting completion — the same
  commands CI enforces — and report exact results.

## Scope discipline

- One issue per branch/PR; minimal diffs; no drive-by refactors,
  unrelated dependency upgrades, or formatting churn.
- Prefer extraction from proven implementations over invented
  boilerplate. Document discovered tech debt as follow-ups rather than
  silently expanding scope.
