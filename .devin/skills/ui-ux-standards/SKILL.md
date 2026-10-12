---
name: ui-ux-standards
description: Shared UI/UX engineering standards — responsive layouts, accessibility (WCAG), keyboard interaction, loading/error/empty states, motion and prefers-reduced-motion, design-token discipline, and visual regression awareness. Use when building or modifying user-facing components, pages, forms, or interactive flows. Each product has its own visual identity — this governs quality, not appearance.
---

# UI/UX standards

Engineering-quality rules for user-facing work. **These govern craft,
not brand** — every product has its own visual identity, theme, and
component library; follow the repo's design tokens, primitives, and
existing patterns. Never impose one product's look on another.

## Layout and responsiveness

- Design for the viewport range the product actually serves — verify at
  narrow mobile, typical desktop, and in-between breakpoints, not just
  the one you developed on.
- Use the repo's established layout primitives and spacing scale.
  One-off pixel values that bypass the token system are a smell.
- Content must remain usable when it grows: long names, empty lists,
  missing images, extreme counts. Design the empty and overflow cases,
  not just the happy path.

## Accessibility (encodable requirements)

- Every form control has a **programmatic label** (`<label>`,
  `aria-label`, `aria-labelledby`) — placeholder is not a label.
- **Never remove the global `:focus-visible` outline**; custom
  interactive controls need a visible focus style.
- Dynamic status and error text uses `role="status"` / `role="alert"`
  so it is announced.
- Decorative imagery: `alt=""` / `aria-hidden`. Meaningful imagery:
  real alt text.
- **Prefer native HTML semantics over ARIA** — a `<button>` beats a
  div with handlers; reach for ARIA only to fill gaps.
- Keyboard paths work: focus order is sane, modals/menus trap and
  restore focus appropriately, Esc dismisses where the pattern
  expects it.
- Where the repo runs axe checks in smoke tests, new/changed routes
  keep them at zero violations.

## Interaction states

- Every async action exposes its state: loading/busy (with the control
  protected against double-submit), success, error (recoverable, with
  a path forward), and empty.
- Errors are actionable: what happened and what the user can do — not
  raw exception text.
- Busy states don't break native behavior: a dialog or form closing
  mid-flight is handled deliberately (disable, confirm, or wait — per
  the repo's interaction primitives).

## Motion

- Honor `prefers-reduced-motion` for non-essential animation —
  functional motion can stay, decorative motion yields.
- Micro-interactions serve comprehension (feedback, continuity), not
  decoration. Keep them short and interruptible.
- Test suites may force reduced motion; don't depend on animation
  timing for test assertions.

## Consistency

- Reuse the repo's component primitives (shadcn/ui, Chakra, custom —
  whatever exists). Do not introduce a second component library or a
  parallel styling approach.
- Design tokens (color, spacing, type scale, radii) come from the
  repo's theme — no hardcoded palette clones.
- Match the existing patterns for a given kind of UI (forms, tables,
  dialogs, toasts) before inventing a new one.

## Verification

- For UI changes: exercise the change in a real browser where
  possible — screenshots for visible diffs are worth including in the
  PR.
- Keyboard-walk new interactive surfaces.
- Check loading, error, and empty states — not just the populated
  happy path.
- Run the repo's smoke/accessibility tests where they exist; if the
  repo has visual regression tooling, respect its baselines and call
  out intentional visual changes in the PR.
