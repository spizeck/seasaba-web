---
name: pr-workflow
description: Our pull-request workflow — issue to branch to implementation to tests to PR to automated review (CI + CodeRabbit) to remediation to approval to merge. Use when starting issue work, preparing a PR, addressing review findings, or reporting completion. Repository-specific branching, routing, and merge policies always take precedence.
---

# PR workflow

The standard lifecycle for code changes in this ecosystem.
**Repo-specific rules win**: the repository's CONTRIBUTING.md,
AGENTS.md, PR template, branch protection, and merge policy override
anything here.

## Lifecycle

issue → branch → implement → verify → PR → automated review →
remediate → human approval → merge (by the authorized person, not the
agent).

## Before branching

- Read the issue and its acceptance criteria. If scope is ambiguous or
  the issue constrains future work, surface options rather than
  guessing.
- **Fetch and branch from current `main`**; record the base SHA.
  Re-fetch remote state before acting on it — branches, PRs, and
  issues may have moved.
- One issue per branch and PR. If the work reveals a second problem,
  document it as a follow-up issue; do not fold it in.

## While implementing

- Minimal, reviewable diffs. No broad rewrites, drive-by refactors,
  unrelated dependency upgrades, formatting churn, or `audit fix`
  sweeps.
- Reuse the repo's existing boundaries (auth, validation, logging,
  data access, email) — never build a parallel mechanism.
- Tests proportional to risk — required for security-sensitive changes
  (auth, rules, claims, payment logic, migration guards), failing if
  the control were removed.
- Update docs when behavior, configuration, operations, or
  architecture changes.

## Before opening the PR

- Run the repo's own check gate — the same commands CI enforces —
  locally and keep the exact output. Never claim a check passed
  without having run or observed it.
- **Review your own complete diff as a reviewer would**: unintended
  files, formatting churn, leaked placeholders, stray artifacts,
  accidental secrets (`git grep` for credential patterns before every
  PR).
- Fill in the PR template. Include: what changed and why, the base
  SHA, exact verification results, remaining concerns, and explicit
  "not done" items (deploys, migrations, production steps deferred).

## Automated review and remediation

- CI and automated reviewers (CodeRabbit and similar) are gates, not
  noise. Treat every finding as a question: fix real issues, or reply
  with a technically precise reason the finding doesn't apply — never
  silently ignore.
- Remediate in focused commits on the same branch; do not rewrite
  history on a PR under review unless the repo's policy says to.
- Resolve review threads honestly — a thread is resolved when the
  finding is actually addressed or rebutted, not when it is
  inconvenient.
- Dependabot PRs go through the same CI and review; do not auto-merge
  or batch them into feature work.

## Reporting completion

- Report **verified facts, not expectations**: "I ran X and observed
  Y" is different from "X should pass".
- Report residual risk explicitly: untested paths, assumptions made,
  environment-specific behavior, and anything deferred.
- Do not merge your own PR unless explicitly instructed. Do not
  deploy, run migrations, rotate credentials, or touch production as
  part of PR work without authorization.

## Anti-patterns (reject these in your own work)

- "Tests pass" without a command and output.
- Scope creep presented as the fix.
- Force-pushing over review comments.
- Claiming review findings are addressed when they were reworded away.
- Committing a follow-up's work into the current PR because it was
  convenient.
