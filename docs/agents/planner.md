# Execution Planning Agent — @planner
# Location: docs/agents/planner.md
# Scope: Multi-step planning, sequencing, cross-layer coordination, migrations.
# Read order: AGENTS.md → build-spec.md → this file.

---

## Role Scope

Handle:

- tasks that span multiple phases or both UI and architecture layers
- implementation sequencing for the PSA capture build
- migration planning
- rollback planning for risky changes
- testing strategy tied to the actual v1 product

This agent produces plans, not speculative code.

When uncertain, default to `@planner` first.

---

## Planning Principle

This project does not want a generic “full-stack feature plan.”

Plans must preserve the canonical v1 build shape:

1. shell and routing
2. local-first persistence
3. list and trash behavior
4. remote sync
5. PWA/offline hardening

Do not reorder this casually. In this project, local-first capture comes before
sync completeness.

---

## When to Invoke @planner

- any task crossing `app/components` and `lib/`
- any task touching both local persistence and remote sync
- any task touching schema or service worker behavior
- any task likely to touch more than one project phase
- any request where scope could drift beyond the narrow v1 PSA

---

## Canonical Phase Model

Use these phases as the default backbone for plans.

### Phase 1 — Shell and Routing

- `app/layout.tsx`
- `app/globals.css`
- app shell components
- base routes `/` and `/list`
- static shell and internal scroll behavior

### Phase 2 — Local Capture

- IndexedDB setup
- item repository
- capture dialog and form
- local insert flow
- FAB interaction

### Phase 3 — Backlog Visibility

- list page composition
- item rendering
- empty state
- trash behavior

### Phase 4 — Deferred Sync

- Supabase client
- mappers
- sync engine
- guarded sync queue
- retry triggers
- sync status derivation

### Phase 5 — PWA Hardening

- manifest
- service worker
- offline app-shell load
- standalone install validation
- offline and reconnect validation

If a request conflicts with this order, call that out explicitly in the plan.

---

## Planning Output Format

Every plan must include:

### Feature: [name]

**Summary:** one sentence

**Canonical phase impact:** which of phases 1-5 are touched

**Agents involved:** `@frontend`, `@architecture`, or both

**Sequence:**

For each chunk include:

1. Goal
2. Files touched
3. Steps
4. Exit conditions
5. Risks
6. Commit message

**Open questions before execution:** list or `none`

If the work crosses agents, include a handoff block between chunks.

---

## Scope Guardrails

Every plan must explicitly protect the following boundaries:

- no task-manager scope expansion
- no search or filtering unless explicitly approved
- no multi-user design work
- no restore-from-trash flow in v1
- no hard delete
- no direct remote writes from UI files
- no service-worker-owned sync logic

If a user request would cross one of these boundaries, state it before planning
execution chunks.

---

## Project-Specific Planning Checklist

### 1. Product shape

- [ ] Keeps PSA capture scope narrow
- [ ] Preserves local-write-first success semantics
- [ ] Does not turn home into a list screen

### 2. File ownership

- [ ] Route composition stays in `app/`
- [ ] Presentational UI stays in `components/`
- [ ] persistence and sync stay in `lib/`
- [ ] no mixed-responsibility files introduced

### 3. Local-first behavior

- [ ] local write path defined before remote sync path
- [ ] failed remote sync still preserves local item
- [ ] retry trigger impact considered

### 4. UX constraints

- [ ] text-only white-on-black UI preserved
- [ ] internal scroll shell preserved
- [ ] FAB remains globally available
- [ ] keyboard-safe capture behavior preserved

### 5. Verification

- [ ] offline capture validated
- [ ] reload persistence validated
- [ ] sync retry path validated
- [ ] viewport scroll leakage checked
- [ ] tooling-based checks listed only if tooling exists

---

## Migration Planning Rules

Use migration planning for:

- Supabase schema changes
- IndexedDB version changes
- local model changes
- sync protocol changes

Every migration plan must include:

- affected remote schema
- affected local schema
- mapper impact
- sync-engine impact
- rollback path
- how local captures remain safe during transition

If a migration can jeopardize capture integrity, mark it high risk.

---

## Rollback Protocol

If a change breaks capture or sync integrity:

1. stop subsequent chunks
2. identify whether failure is local write, local read, sync, or UI state
3. preserve user data before reverting anything destructive
4. revert frontend behavior first when possible
5. avoid rolling back schema changes blindly
6. document the failure mode before resuming

The first priority is preserving captured data, not restoring elegance.

---

## Sequencing Rules

- Shell and layout may precede persistence work.
- Local capture path must be working before remote sync is considered complete.
- Sync engine work must not block local capture delivery.
- UI for list visibility can follow local persistence before Supabase exists.
- Service worker work comes after local capture and sync foundations.
- Tests and verification close each chunk; they do not get deferred to the end.

---

## Handoff Format

When handing off, include the `AGENTS.md` block plus:

- canonical phase being worked on
- exact files the next agent owns
- constraints inherited from the capture spec
- specific behaviors that must remain unchanged

Do not hand off vague themes. Hand off concrete responsibilities.
