# Dependency Maintenance Policy

How this repository keeps dependencies current without drowning in bot
noise. The mechanics live in `.github/dependabot.yml`; this document is the
policy behind it and the workflow for the parts Dependabot deliberately does
not automate.

## Routine updates (version updates)

Dependabot checks npm and GitHub Actions **weekly, Monday 09:00
America/Puerto_Rico** (Saba local time, UTC-4 year-round). Minor and patch
updates arrive as grouped PRs rather than one catch-all bucket:

| Group | Contains | Why |
| --- | --- | --- |
| `next-react` | `next`, `eslint-config-next`, `react`, `react-dom`, `@types/react`, `@types/react-dom` | Compatibility family: `eslint-config-next` versions in lockstep with `next` (same repo, same numbers), `react`/`react-dom` must move together, and the React types track the React release |
| `vitest` | `vitest`, `@vitest/*` | `vitest` and `@vitest/coverage-v8` release in lockstep and must share a major — updating one without the other breaks coverage |
| `firebase` | `firebase` | Runtime dependency behind the public Dive Log; SDK changes can alter live data behavior, so it gets its own review instead of hiding in a mixed batch |
| `runtime` | all other production dependencies | Ships to visitors — grouped once so runtime bumps get one deliberate review pass |
| `dev-tooling` | all development dependencies | Linters, test harness, types, build tooling — cannot break the site at runtime, so one low-risk PR is enough |

An update is assigned to the **first** group whose rules match, so the
specific families always win over the `runtime`/`dev-tooling` catch-alls.
Ungrouped leftovers (rare — e.g. a dep that fits neither dependency-type
filter) still arrive as individual PRs within the open-PR limit.

Keep groups few and justified. Add a new group only for a real compatibility
family or a concrete review-safety benefit — not to mirror the package list.

## Major versions

Dependabot does **not** open major-version update PRs (`ignore` +
`version-update:semver-major` for both ecosystems). Majors are deliberate
migration work:

1. Review available majors periodically — `npm outdated` (and the Actions
   versions in `.github/workflows/`) during routine maintenance, at least
   quarterly.
2. File a dedicated issue per migration. Check for a breaking-change notes
   review, a CI pass, and related-family alignment before starting.
3. Families migrate together: Vitest with `@vitest/coverage-v8`; Next with
   `eslint-config-next` and compatible React/types; `typescript` only after
   the Next.js and ESLint toolchain supports it.
   `@types/node` tracks the Node major in `.nvmrc` (currently 24), not the
   latest published major.
4. Action majors (e.g. `actions/checkout` v5→v7) get the same treatment —
   review the release notes for behavioral changes, and preserve
   `persist-credentials: false` on every checkout step.

## Security updates

Security updates are configured in repository settings, not this file, and
follow different rules than version updates:

- They are **not** affected by the major-version `ignore` — a fix that
  requires crossing a major boundary still produces a PR.
- They are not grouped by default and do not count toward
  `open-pull-requests-limit`.
- Treat them as prompt, merge-soon work, not weekly maintenance. See
  `SECURITY.md` for reporting.

## Security audit residuals

As of the October 2026 audit cleanup, `npm audit` reports **11 high-severity
findings, all rooted at `braces` (GHSA-vfj7-8cjw-p6xm, stack-exhaustion DoS via
deeply nested glob patterns)**. Every released version of `braces` is affected —
there is no patched release to upgrade to yet, so the chain is flagged through
`micromatch` → `fast-glob` into `shadcn`, `ts-morph`, `@ts-morph/common`,
`@shadcn/registry`, `@next/eslint-plugin-next` (and therefore
`eslint-config-next`), and `find-yarn-workspace-root` → `patch-package`.

Why this is accepted:

- **Dev-tooling only.** Every affected consumer lives in `devDependencies`
  (`shadcn`, `patch-package`, `eslint-config-next`). None of these packages are
  bundled into or executed by the production site.
- **Trigger requires attacker-controlled glob input** fed to the CLI/ESLint
  tooling at develop or build time — not reachable from site traffic.
- `npm audit fix --force` proposes breaking downgrades
  (`patch-package@6.0.7`, `eslint-config-next@14.2.35`, `shadcn@1.0.0`,
  `@tailwindcss/typography@0.5.4`) — rejected per policy; they do not fix
  `braces` anyway, they only cut the dependency paths.

Remediation path: upgrade `braces` when a patched release ships, then let the
`micromatch`/`fast-glob` ranges re-resolve. Re-check on each dependency
maintenance pass.

### Active `overrides` and why they exist

| Override | Reason | Verification |
| --- | --- | --- |
| `postcss` | Pre-existing — pins a known-good PostCSS for Tailwind v4 toolchain | unchanged |
| `@grpc/grpc-js@^1.14.5` | `@firebase/firestore@4.17.1` pins `~1.9.0`. Patched releases are `1.13.6` and `1.14.5` — `1.14.0`–`1.14.4` remain affected (GHSA-m9gg-hp2v-232j, GHSA-f596-whhp-79r4), so the floor is `1.14.5`. Both advisories are server-side code paths; this app only uses Firestore via the browser webchannel transport, but the override removes the vulnerable version from the tree entirely. | Smoke-tested: `getFirestore` + `getDoc` opened a real gRPC `Listen` stream against the Firestore backend on `1.14.5` |
| `postcss-selector-parser@^7.1.6` | `@tailwindcss/typography@0.5.20` pins `6.0.10` exactly; `>=7.1.6` is the only fixed line (GHSA-rj75-hqrm-r3gf). | `prose` classes used on production pages; `next build` compiles the typography plugin cleanly on 7.1.6 |

## Queue hygiene

A Dependabot PR that sits open unmerged is noise. When a routine PR stalls,
either review and merge it or close it — the next weekly run recreates the
group fresh. Closing a grouped PR does not blacklist its packages; closing
an individual PR with `@dependabot ignore this major/minor version` does —
prefer closing over ignoring so nothing silently falls out of maintenance.
