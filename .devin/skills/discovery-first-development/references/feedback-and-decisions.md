# Feedback capture and decisions

Owner observations during exploration are raw material. Capture them
cheaply, classify them when it helps, and promote them to GitHub issues
only when a decision is actually clear. Do not open an issue for every
casual remark — a noisy tracker is worse than a short feedback log.

## Capture first, classify second

During an Explore/Build session, accumulate reactions in a feedback log
(`../templates/feedback-log.md`) — on the PR, in the session reply, or
in the repo's `docs/discovery/` file. Verbatim wording is valuable:
"I expected the total to update" is a better requirement than any
paraphrase.

Each captured item preserves:

- What the owner attempted
- What actually happened
- What they expected or disliked (their words where possible)
- Evidence: screenshot, URL, error text
- Context: what was being tested, on which build/preview
- Whether the expected behavior is confirmed or still open
- Suggested next action, and rough priority/risk

## Classifications

Use these when an item is ready to become work. One item can carry two
labels (a UX improvement that is also a business-rule clarification).

| Class | Meaning | Typical next action |
| --- | --- | --- |
| Confirmed bug | Behavior contradicts confirmed intent | Issue with repro; fix in Build/Harden |
| Missing requirement | Real need nobody wrote down | Add to acceptance criteria; owner confirms |
| UX improvement | Works as specified but feels wrong | Alternative proposal; small experiment |
| Business-rule clarification | The rule was never decided | **First verify it is actually undecided** — search code, tests, docs, accepted decisions; then present options → owner decision → record it |
| Edge case | Rare-but-real path surfaced | Decide handling; test if accepted |
| Regression | Previously accepted behavior broke | Fix + regression test, same PR if small |
| New feature idea | Beyond current scope | Deferred list or its own issue |
| Deferred enhancement | Worth doing, not now | Park in the discovery record's deferred list |

## Converting to issues

Promote an item to a GitHub issue when *all* of these hold:

1. The desired behavior is confirmed (or the item IS the question —
   then the issue asks for the decision, it doesn't guess the answer).
2. It is not a duplicate — search open issues first; reference related
   issues and PRs.
3. It survives this session — not already fixed, not a one-off remark.

Otherwise leave it in the log. The log is the low-friction layer; the
issue tracker is the commitment layer.

## The discovery record

When a change involved real exploration — alternatives weighed,
assumptions made, rules decided — leave a record
(`../templates/discovery-record.md`) at `docs/discovery/YYYY-MM-DD-<slug>.md`
in the consumer repo. It answers, for a future session or human, "why
does it work this way?"

Keep it to what it lists: problem, alternatives considered, prototype
references, observations, decisions + reasons, confirmed rules, open
questions, deferred ideas, acceptance criteria, related tests/issues/PRs.
A page, not a dossier. If nothing was genuinely discovered — the work
was straight implementation — skip the record entirely; the PR says
enough.
