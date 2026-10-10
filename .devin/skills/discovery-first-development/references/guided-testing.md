# Guided testing

"Please test this" produces no signal. A guided test plan gives a
non-developer exact, realistic scenarios they can run unassisted —
and tells you both what happened *and* what it means.

Template: `../templates/guided-test-plan.md`

## Scenario anatomy

Every scenario has all eight fields. Omitting any of them pushes work
back onto the tester.

| Field | Purpose |
| --- | --- |
| **Scenario title** | Names the behavior, not the feature ("Overlapping departure assignment") |
| **Why we are testing this** | The risk or question it answers — motivates careful testing |
| **Starting conditions** | Exact state needed before step 1: records, roles, data. Make it creatable — "a booking with two participants", not "a complex booking" |
| **Actions** | Numbered, literal steps. "Click X", "type Y", "navigate to Z". No interpretation required |
| **Expected result** | What should happen, concretely — visible outcome, not internal state |
| **If something else happens** | What the deviation indicates: likely bug vs. unconfirmed rule vs. design question |
| **Evidence to capture** (optional) | Screenshot, URL, error text, rough time |
| **Outcome** | Tester marks **pass / fail / needs-discussion** plus free-text reaction |

**Needs-discussion is a first-class result**, not a soft fail. A lot of
the value of guided testing is discovering that the "expected" behavior
was never actually decided. When the expected outcome is itself the
open question, write **decision needed** in the expected-result field
and mark the outcome `needs-discussion` — never write a vague
expectation and grade it pass/fail. (Before assuming undecided, check
code, tests, docs, and accepted decisions — the rule may already be
settled.)

## Choosing scenarios

Pick categories by risk and relevance — not every feature needs every
row. Three to seven scenarios is the usual useful range.

| Category | Use when |
| --- | --- |
| Happy path | Always — one realistic end-to-end run of the change |
| Invalid input | Forms, imports, anything typed or pasted |
| Boundary conditions | Counts, dates, capacities, first/last item in a list |
| Conflicting actions | Two things that can collide (assign + overlap, edit + concurrent edit) |
| Repeated actions | Double-click, resubmit, reapply — idempotency questions |
| Save and reload | Any draft, multi-step, or editable state |
| Navigation / state preservation | Losing work on back-button or refresh is a real risk |
| Cancellation / reversal | Undo, cancel, refund-adjacent, opt-out paths |
| Empty states | First use, deleted content, filters that match nothing |
| Loading / error states | Slow network, failed save, expired session |
| Permission differences | Feature behaves differently per role — test each role |
| Mobile / desktop | Anything layout- or gesture-dependent |

## Writing for a non-developer

- Use the product's own vocabulary (the words on the buttons), not the
  code's ("departure", not "ActivityInstance").
- One action per numbered step. Never "set up X and then also Y."
- Seed data instructions must be executable by the tester — or seed it
  yourself and say what exists.
- Put the plan where the tester will see it: PR body, session reply,
  or `docs/discovery/`. Three to seven scenarios, ordered by importance.
- Never claim a scenario passed without an observed result — yours
  (automated) or theirs (reported).

## Interpreting conversational feedback

Owners react naturally. Your job is to translate, not to ask them to
classify:

| Owner says | Likely meaning | Your move |
| --- | --- | --- |
| "That worked." | Accepted behavior | Record it; protect it with a regression test in Build/Harden |
| "It let me do something it shouldn't." | Bug *or* unconfirmed rule | Check whether the rule was ever decided; if not, present options — do not silently invent the restriction |
| "I don't like this." | Design/UX dissatisfaction | Ask what about it, concretely; propose an alternative rather than defending the current one |
| "I expected something different." | Missing/wrong requirement | Capture expected vs. actual verbatim; that delta is the requirement |
| "I can't find the button." | Discoverability problem | Treat as UX evidence, not user error |
| "I don't know what should happen here." | Undecided product question | Mark *decision needed*; present the options with tradeoffs |

Full capture format: `../templates/feedback-log.md`; classification and
conversion rules: `feedback-and-decisions.md`.

## Worked example (Sea Saba booking platform)

Grounded in the real model: departures (`ActivityInstance`s) pin
concrete resources to capability slots, and ineligible options already
surface machine-readable reasons in the assignment panel. The product
question below — whether *participant* assignment to overlapping
departures is constrained the same way — is exactly the kind of rule
this workflow surfaces rather than invents.

```markdown
### Scenario: Overlapping participant assignments

**Why we are testing this:** whether *one participant* may be assigned
to overlapping departures is an unconfirmed business rule — this test
shows what the system does today so the rule can be decided on
evidence. (Different participants of one booking on simultaneous trips
is a normal group booking — not the question here.)

**Starting conditions:**
- A booking with two participants (e.g. Alice and Bob).
- At least two departures on the same day whose times overlap
  (e.g. a morning 2-tank and a late-morning snorkel trip).

**Actions:**
1. Open the booking's itinerary.
2. Assign Alice to the first departure.
3. Attempt to assign Alice to the overlapping departure.
4. Observe what happens — allowed, warned, or blocked.
5. Control: assign Bob to the overlapping departure — a legitimate
   group booking that should keep working either way.

**Expected result:** **decision needed** — the rule is unconfirmed, so
there is no pass/fail expectation; the observed behavior feeds the
decision.

**What the observation means:**
- Silently allowed → enforcement gap to decide on.
- Blocked with a clear reason → the stricter rule may already exist —
  verify before changing anything.
- Any error, or Bob's legitimate assignment being rejected → confirmed
  bug.

**Evidence:** screenshot of the result, plus the booking reference.

**Outcome:** needs-discussion — <observed behavior + owner's judgment>
```
