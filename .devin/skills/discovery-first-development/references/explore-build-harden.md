# Explore / Build / Harden

Three modes for product work. The point of separating them is honesty
about what exists: a hypothesis, working software, or a production
candidate. State the active mode in the PR or session so the owner knows
what they are looking at.

## Mode A — Explore

**Purpose:** give the owner something concrete to evaluate.

Typical activities:

- Read the current implementation and walk the real user journey.
- Identify friction, inconsistencies, and unstated assumptions.
- Present two or three meaningfully different directions — different
  enough that choosing between them is a real product decision, not a
  style preference. If there is only one sane approach, say so instead
  of manufacturing alternatives.
- Produce mockups, annotated screenshots, a lightweight prototype
  branch, or a preview with representative sample data.
- List assumptions and unanswered questions explicitly.

**Done when:** the owner has something concrete to react to and a
guided test plan to react through. Not production-ready — say so.

Do not in Explore: build the "real" version of an unchosen direction,
write speculative edge-case handling, or expand scope beyond the
question at hand.

## Mode B — Build

**Purpose:** implement the direction the owner chose.

Typical activities:

- Convert accepted discoveries into written requirements — the
  discovery record's decision section is the source.
- Implement actual functionality on the repo's existing architecture
  (`engineering-standards`): real services, real data paths, domain
  invariants preserved.
- Add automated tests for *accepted* behavior only — each test names
  the confirmed rule it encodes.
- Produce a working preview and a guided test plan for hands-on
  evaluation.
- Document remaining questions as open items, not buried TODOs.

**Done when:** the feature works well enough for realistic hands-on
evaluation — the owner can use it the way staff or customers would,
not just admire a mockup.

## Mode C — Harden

**Purpose:** turn an accepted feature into a production candidate.

Typical activities (select by risk, run all that apply):

- Security and authorization: server-enforced checks on every
  privileged path; rules/claims changes get control-removal tests.
- Edge cases and failure handling the prototype skipped.
- Accessibility and interaction states per `ui-ux-standards`:
  keyboard paths, focus management, loading/error/empty states.
- Responsive behavior across the product's real viewport range.
- Data integrity: constraints, transactions, migration safety per
  `database-safety`.
- Payment paths per `payment-safety` — idempotency, webhook
  verification, no autonomously-initiated money movement.
- Production configuration and rollout/rollback notes per
  `production-readiness`.
- Regression coverage: the accepted behaviors from Explore/Build are
  now encoded as durable tests.
- Full review path per `pr-workflow`: CI green, CodeRabbit findings
  addressed, own diff reviewed.

**Done when:** the feature is ready for a deliberate merge-and-deploy
decision by a human. "Ready" is still not "shipped."

## Boundaries that do not flex with mode

- Prototypes and previews never run against production data, payment
  providers in live mode, or real user accounts.
- Authorization is server-enforced in every mode — a prototype may be
  rough visually but must not create an unguarded privileged path.
- Schema changes follow `database-safety` even during exploration;
  migrate disposable/preview databases, never production.
- Exploration does not skip code review. Explore-mode code that will
  not ship still goes through the PR process if it lands on a branch
  anyone will run.

## Mode transitions

- Explore → Build: the owner has picked a direction (explicitly, or
  by unambiguous reaction). Record the decision first.
- Build → Harden: the owner has accepted the behavior in hands-on
  evaluation. Acceptance is a product judgment, not "tests pass."
- Any → Explore: a surprising observation, a rejected approach, or
  evidence the problem was misunderstood. Regressing a mode is normal
  and cheap; shipping an unexamined guess is not.
- Skip Explore entirely when the request was specific to begin with.
  Modes exist to serve the work, not to tax it.
