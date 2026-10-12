# Guided test plan: {{TITLE}}

_Date: {{DATE}} · Mode: Explore / Build / Harden · Where to test: <preview URL or "local checkout" — never production>_

**How to use this:** work through the scenarios in order. Each one is
self-contained. For each, mark **pass**, **fail**, or
**needs-discussion** and add any reaction in your own words —
"It let me do something it shouldn't" and "I expected something
different" are both valuable results. You do not need to decide whether
something is a bug. If a scenario's expected result says **decision
needed**, the correct behavior is an open question — the outcome is
needs-discussion by definition, and what you observe becomes the
evidence for deciding.

---

### Scenario 1: <name the behavior, e.g. "Assign a participant to a departure">

**Why we are testing this:** <the risk or open question this answers>

**Starting conditions:**
- <exact record/state needed, e.g. "a booking with two participants">
- <role/account needed, e.g. "signed in as staff">

**Actions:**
1. <one literal action per step>
2. <e.g. "Click Save">
3. <e.g. "Observe the result">

**Expected result:** <concrete visible outcome>

**If something else happens:** <what the deviation likely indicates —
bug vs. unconfirmed rule vs. design question>

**Evidence to capture:** <screenshot / URL / error text — optional>

**Outcome:** pass / fail / needs-discussion — <free-text reaction>

---

### Scenario 2: <title>

**Why we are testing this:** <…>

**Starting conditions:**
- <…>

**Actions:**
1. <…>

**Expected result:** <…>

**If something else happens:** <…>

**Evidence to capture:** <…>

**Outcome:** pass / fail / needs-discussion — <…>

<!-- Add scenarios 3–7 as needed. Select by risk: happy path, invalid
input, boundary, conflicting actions, repeated actions, save/reload,
navigation, cancellation, empty states, loading/error, permissions,
mobile/desktop. Three to seven is the usual useful range. -->
