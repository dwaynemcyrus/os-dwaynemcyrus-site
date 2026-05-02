# Spec Amendment — Commit/Kind Restructure

**Applies to:** `build-spec-v8-capture-processing-overhaul.md` (capture processing feature)
**Type:** Behavioral change to wizard flow + minor schema semantics clarification
**Scope:** Wizard flow only. No table schema changes. No settings page changes.

## Problem

The current flow asks "Commit now?" before "What kind of item?" with the assumption that commitment applies universally. In testing, this creates friction: classifying a bare URL as a reference forces the user to answer "Commit: YES" first, which is conceptually wrong — reference items don't require commitment, they require categorization.

The fix is to recognize that **commitment is meaningful for action and creation, but not for reference**, and that **incubation is a holding pattern, not a classification.**

## Principle

Incubated items remain unclassified. They stay as `kind: capture, status: incubate` and are reprocessed through the wizard fresh when the user reviews the incubation list. The wizard does not classify items into action / reference / creation while incubating them.

## Updated flow (replaces section 5.2 top-level sequence)

Replace the existing Q1 → Q2 → Q3 sequence with:

```
Q1. Keep this?
  YES → Q2
  NO  → terminal: trash

Q2. Commit now?
  YES      → Q3a (commit-yes kind picker)
  NOT YET  → Q3b (commit-not-yet kind picker)

Q3a. What kind of item? (commit branch)
  Action     → action branch (5.2.1, unchanged)
  Creation   → creation branch (5.2.3, unchanged)

Q3b. What kind of item? (no-commit branch)
  Reference  → reference branch (5.2.2, unchanged)
  Maybe      → terminal: incubate
```

## Terminal definitions (clarified)

**Terminal: trash** — unchanged.
- Set `isTrashed: true`, `trashedAt: now()`. Preserve `kind` and `status`.

**Terminal: incubate** — clarified.
- Set `status: incubate`, `incubatedAt: now()`.
- `kind` remains `capture`. Do **not** set kind to action, reference, or creation when reaching this terminal.
- Item appears in the incubation list when the user reviews it; reprocessing through the wizard happens fresh at that time.

## What does not change

- Action branch (5.2.1) — internal logic, terminals, field assignments unchanged.
- Reference branch (5.2.2) — internal logic, type picker, field assignments unchanged.
- Creation branch (5.2.3) — internal logic, terminals, field assignments unchanged.
- Wizard chrome (5.3, 5.4, 5.5) — back, skip, exit, progress indicator unchanged.
- Empty inbox and all-skipped states (5.6) — unchanged.
- Edge cases (5.7) — unchanged.
- Validation (5.8) — unchanged.
- Schema (section 3) — unchanged. The existing `status: incubate` enum value and `kind: capture` default already support this flow without modification.
- Settings page (section 6) — unchanged.
- Seed data (3.3) — unchanged.

## Implementation notes for Codex

1. **Q3 split into two pickers.** The kind picker shown after Q2 depends on Q2's answer. Implement as two distinct picker states with different option sets, not one picker with conditionally hidden options.

2. **The "Maybe" choice in Q3b is a terminal, not a kind selection.** Selecting "Maybe" sets `status: incubate` and advances to the next item. It does not write a value to the `type` field, and `kind` stays `capture`.

3. **Back button behavior** (per 5.4) still applies. Back from Q3a or Q3b returns to Q2. Back from Q2 returns to Q1.

4. **Acceptance criteria addition.** Add to section 9:
   - The "Commit: YES" branch offers Action and Creation as kind options.
   - The "Commit: NOT YET" branch offers Reference and Maybe as options.
   - Selecting "Maybe" produces an item with `kind: capture, status: incubate, incubatedAt` set, and no `type` value.

5. **Existing acceptance criterion 3** lists terminals. The set is unchanged in count — the flow restructure doesn't add or remove terminals, only reroutes which top-level path leads to each.

## Quick sanity tests

After implementation, verify:

- Capturing a URL and processing it as: Keep YES → Commit NOT YET → Reference → Link → produces `kind: reference, type: link, status: later`.
- Capturing an idea and processing it as: Keep YES → Commit NOT YET → Maybe → produces `kind: capture, status: incubate, incubatedAt: <timestamp>`.
- Capturing a task and processing it as: Keep YES → Commit YES → Action → (action branch) → produces an action item per existing spec.
- The "Commit: YES" branch does not show Reference or Maybe as kind options.
- The "Commit: NOT YET" branch does not show Action or Creation as kind options.