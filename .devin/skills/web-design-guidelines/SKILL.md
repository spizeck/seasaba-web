---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the pinned guidelines at `references/web-interface-guidelines.md`
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

The guidelines are vendored at `references/web-interface-guidelines.md`
and pinned to an immutable upstream revision (see Provenance). Always
review against the bundled copy.

Do **not** fetch the guidelines from the network. The upstream document is
mutable (`main` moves), so fetching it would silently replace the pinned
rules and defeat the pin.

## Usage

When a user provides a file or pattern argument:
1. Read `references/web-interface-guidelines.md`
2. Read the specified files
3. Apply all rules from the guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

## Provenance

- Upstream skill: `vercel-labs/agent-skills` → `skills/web-design-guidelines`
  (adapted — upstream fetches `…/main/command.md` at review time, a
  mutable instruction source; this copy removes the runtime fetch)
- Guidelines document: `vercel-labs/web-interface-guidelines` → `command.md`
- Pinned revision: `434b7f91364665f2f733b310ec54809bf8f37937` (2026-10-05)
- Upstream SHA-256 at that revision:
  `d246b026f4f29b5823a9cc857f9edf3d2507002e055e32040cadeaf3b38e0234`

### Local corrections

The bundled reference is **not** byte-identical to upstream — we apply
reviewed corrections on top of the pin:

- Accessibility rule replaced: upstream required explicit keyboard
  handlers (`onKeyDown`/`onKeyUp`) on all interactive elements, which
  would flag native controls that already provide built-in keyboard
  behavior. Now requires role-appropriate keyboard behavior for custom
  widgets.
- Installed content SHA-256:
  `2d13e8a93e8af41b3f7a14e7e1118a6919b7bb0af25caf323663c51b4793a7a9`
  — this is the hash `install-skills.mjs` records in consumer
  `agent-skills-state.json`; it intentionally differs from the upstream
  hash above.

Refreshing the pin is a deliberate change: fetch `command.md` at the new
upstream commit, review the diff, re-apply the corrections above, update
`references/`, the pinned revision + date, and both hashes in an
app-foundations PR, then re-run `scripts/install-skills.mjs` in consumer
repositories.
