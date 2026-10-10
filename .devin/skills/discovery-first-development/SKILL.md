---
name: discovery-first-development
description: Discovery-first product development for ambiguous, exploratory, or evolving requests — Explore/Build/Harden modes, guided test scenarios for a non-developer product owner, feedback capture, and discovery records. Use when a request is a problem, frustration, idea, or desired outcome rather than a specification ("I have an idea", "this doesn't feel right", "can we make this easier", "I'm not sure what I want", "show me some options", "let's try something", "I don't like how this works", "something is missing", "I need to see it first", "what should we build", "I found something weird while testing") — or whenever requirements are genuinely incomplete or a substantial UX change would benefit from a prototype. Not for clearly-specified bug fixes or engineering tasks with complete acceptance criteria.
---

# Discovery-first development

The product owner has strong operational judgment and recognizes good
or bad behavior on contact — but is not expected to write complete
specifications. **Discovery precedes commitment; experience informs
requirements.** On an ambiguous request, produce something concrete the
owner can react to — do not extract a spec, and do not guess at a large
implementation.

## When this applies — and when it does not

Use this skill when the request is a problem, frustration, idea, or
desired outcome rather than an implementation directive, or when the
stated requirements cannot support the work without invention.

Do not use it for clearly-specified bugs, tasks with acceptance
criteria, or internal engineering with no product surface — those go
through the repo's normal workflow (`pr-workflow`, `implement-issue`
where present). If a "straightforward" task surfaces a product question
mid-flight, switch into this mode for that question instead of
guessing.

## The loop

1. **Understand the problem.** Inspect the current experience before
   proposing anything — what happens today, where the friction is.
   Separate known constraints (code, docs, prior decisions) from
   assumptions.
2. **Offer concrete alternatives.** When direction is open, present
   two or three meaningfully different approaches with tradeoffs in
   plain language. Mockups, screenshots, and sample-data prototypes
   beat prose descriptions.
3. **Recommend the smallest useful prototype** — the cheapest thing
   the owner can actually interact with. State assumptions explicitly
   and keep them reversible.
4. **Guide the reaction.** Hand over a short guided test plan, never
   "please test this." Format: `references/guided-testing.md`.
5. **Convert observations into work.** Reactions are product evidence.
   Capture, classify, and turn confirmed behavior into requirements,
   acceptance criteria, and regression tests:
   `references/feedback-and-decisions.md`.

## Three modes

Work is in exactly one mode at a time. Say which one you are in.

| Mode | Purpose | Produces | Explicitly not required |
| --- | --- | --- | --- |
| **Explore** | Discover desired behavior | Alternatives, mockups, lightweight prototype, assumptions list | Tests, polish, edge-case coverage |
| **Build** | Implement the chosen direction | Working preview, focused tests for accepted behavior, documented open questions | Production hardening |
| **Harden** | Prepare an accepted feature | Security/edge-case/accessibility review, regression coverage, green CI | Anything — done means mergeable |

Entry/exit criteria and detail: `references/explore-build-harden.md`.

**Safety floors apply in every mode.** Authentication, authorization,
payments, privacy, and data integrity are never exploratory: a
prototype must never touch production data or payment systems, and
security-sensitive paths keep their normal controls even in Explore.
`payment-safety`, `database-safety`, `privacy-consent`, and
`production-readiness` apply in all three modes.

## Required behaviors

- **Name the underlying problem before naming a solution.**
- **Show, don't ask.** An example the owner can react to beats a
  requirements questionnaire. Ask focused questions only when an
  assumption is expensive to reverse.
- **Record assumptions where the owner can see them** — reply, PR
  description, or discovery record. Never silently.
- **"Doesn't feel right" is a hypothesis hunt**: inspect the flow,
  present two or three candidate causes, propose the smallest testable
  change.
- **Never invent business rules.** When a rule is unconfirmed, present
  the options and mark it *decision needed* — do not pick one quietly.
- **Check for settled rules before calling a question undecided.** Code,
  tests, docs, and accepted decisions may already answer it — discovery
  does not reopen confirmed constraints without evidence. And while a
  rule is unresolved, do not operationalize the questionable action
  (a prototype demonstrates the conflict and its explanation; it does
  not make a possibly-invalid action work).
- **A test encodes confirmed behavior.** A test written from an
  unverified assumption calcifies a guess — worse than no test.
- **Accepted behavior is a regression boundary.** Preserve it unless
  the owner deliberately changes it.
- **Keep exploration, working software, and production readiness
  visibly distinct.** A preview is not proof of readiness; product
  acceptance is not security validation; a design change must not
  silently change business logic.

## Proportionality

Scale the machinery to the decision at stake. A button adjustment may
be one change, a screenshot, and two scenarios — no record needed. A
new booking flow may warrant the full loop. When in doubt, do less;
the owner can ask for more.

## Artifacts

Copy-ready formats in `templates/`; usage guidance in `references/`.

| Artifact | When | Template |
| --- | --- | --- |
| Guided test plan | Every handoff of something the owner should try | `templates/guided-test-plan.md` |
| Feedback log | While exploring — accumulate reactions before converting | `templates/feedback-log.md` |
| Discovery record | Decisions worth remembering — why this design exists | `templates/discovery-record.md` |
| Morning review | After a long autonomous work session | `templates/morning-review.md` |

Store durable records in the consumer repo under `docs/discovery/`
(`YYYY-MM-DD-<slug>.md`); small items can live on the PR instead.
Markdown and GitHub-native — no new tools. Scaffold helper in
app-foundations:
`node scripts/new-discovery.mjs --repo <path> --kind <record|test-plan|feedback|morning-review> --title "…"`

## Relationship to other skills

- `pr-workflow` governs branches, PRs, and review in every mode —
  exploration is not a bypass.
- `ui-ux-standards` applies to anything user-facing, prototypes
  included — a prototype that breaks accessibility teaches the wrong
  lesson.
- `engineering-standards`, `payment-safety`, `database-safety`,
  `privacy-consent`, `production-readiness` are the safety floors above.
- Repo-local walkthrough skills (e.g. `guided-user-testing`) run a
  live, interactive validation with the user. Complementary, not
  duplicate: this skill produces asynchronous scenario documents; a
  walkthrough skill drives them step-by-step when available.
- ChatGPT-class collaborators share this philosophy (exploring ideas,
  tradeoffs, interpreting feedback) but have no repo access — the
  templates are plain copy-paste Markdown for that reason.
