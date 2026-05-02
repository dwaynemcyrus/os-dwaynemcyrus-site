# Build Spec — Capture Processing Feature

**Status:** current / active
**Audience:** Solo developer + Codex CLI agent
**Companion docs:** `AGENTS.md` (implementation conventions, library choices, stack-specific patterns)

## 1. Overview

This spec defines the capture processing feature for the personal OS PWA. Users submit free-text captures into an inbox; a wizard walks them through structured prompts to classify each item as an action, reference, or creation, with appropriate metadata. Items not worth keeping are trashed; items not yet ready for commitment are incubated.

The feature has five components:

1. **Items schema** — a single table holding all captures and their downstream classifications
2. **Type registry schema** — user-defined types per kind (reference, creation, log)
3. **Capture input** — UI surface where text is submitted into the inbox
4. **Capture processing wizard** — the decision flow that classifies items
5. **Types settings page** — CRUD UI for user-defined types

The feature is local-first: writes go to IndexedDB and sync to Supabase in the background. The wizard works fully offline.

## 2. Stack assumptions

- **Frontend:** Next.js (PWA)
- **Local store:** IndexedDB
- **Remote store:** Supabase (Postgres)
- **Sync model:** local-first, last-write-wins on conflict
- **IDs:** UUID v4

Library-specific choices (IndexedDB wrapper, validation, component library) are governed by `AGENTS.md`.

## 3. Data model

### 3.1 `items` table

Single table for all item kinds. Discriminated by the `kind` field.

| Field | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | UUID | no | — | Primary key |
| `parentId` | UUID | yes | null | Self-reference to `items.id`. Used for project → task hierarchy. |
| `kind` | enum | no | `capture` | One of: `capture`, `action`, `reference`, `creation` |
| `type` | string | yes | null | System-defined for `kind: action` (`task`, `project`, `habit`); references `type_registry.name` for reference/creation. Null for unclassified captures. |
| `content` | text | no | — | The captured text. Required and non-empty on insert. |
| `status` | enum | no | `later` | One of: `later`, `active`, `waiting`, `paused`, `complete`, `incubate` |
| `isTrashed` | boolean | no | false | Soft-delete flag |
| `isArchived` | boolean | no | false | Archive flag (orthogonal to trash) |
| `waitingReason` | text | yes | null | Free text — why blocked |
| `delegatedTo` | text | yes | null | Free text — who it's delegated to |
| `startAt` | timestamp | yes | null | When the item should start |
| `endAt` | timestamp | yes | null | When the item is due |
| `metadata` | JSONB | no | `{}` | Subtype-specific data, frontmatter-style |
| `createdAt` | timestamp | no | now() | |
| `updatedAt` | timestamp | no | now() | Updated on every write |
| `completedAt` | timestamp | yes | null | Set when status transitions to `complete` |
| `trashedAt` | timestamp | yes | null | Set when `isTrashed` flips to true |
| `archivedAt` | timestamp | yes | null | Set when `isArchived` flips to true |
| `incubatedAt` | timestamp | yes | null | Set when status transitions to `incubate` |

**Constraints:**
- `content` must be non-empty on insert (server-side validation)
- `kind: action` items must have `type` in (`task`, `project`, `habit`)
- `kind: reference`, `kind: creation` items must have `type` matching a row in `type_registry` for that kind

**Indices (recommended):**
- `(kind, isTrashed, isArchived)` for inbox and active-list queries
- `(parentId)` for fetching project children
- `(type, kind)` for type-based filtering and item counts

### 3.2 `type_registry` table

Holds user-defined type names per kind. `kind: action` types are system-defined and not stored in this table.

| Field | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | UUID | no | — | Primary key |
| `kind` | enum | no | — | One of: `reference`, `creation`, `log` |
| `name` | string | no | — | Type name |
| `createdAt` | timestamp | no | now() | |
| `updatedAt` | timestamp | no | now() | |

**Constraints:**
- Unique `(kind, name)` — case-insensitive
- `name` must be non-empty, no leading/trailing whitespace

### 3.3 Seed data on first install

Insert into `type_registry`:

| kind | name |
|---|---|
| reference | contact |
| reference | link |
| reference | literature |
| reference | quote |
| reference | slip |
| creation | essay |
| log | interaction |

## 4. Capture input

A persistent text input UI where the user submits captures. On submit:

1. Insert a row into `items` with:
   - `kind: capture`
   - `status: later`
   - `content: <user text>`
   - All other fields default
2. Clear the input
3. Item appears in the capture inbox

Validation: reject empty or whitespace-only submissions silently (no error message; just no-op).

The capture input itself is not in scope for this spec beyond this contract. Implementation details (placement, keyboard shortcut, multi-line behavior) are governed by `AGENTS.md` or a separate spec.

## 5. Capture processing wizard

### 5.1 Entry

The user opens the wizard from a UI entry point (e.g., a button labeled "Process inbox").

**On open:**
- Query `items` where `kind = 'capture'` AND `isTrashed = false`, ordered by `createdAt` ascending
- If empty: show empty state (see 5.6)
- If non-empty: load the earliest item and show the first question

### 5.2 Decision flow

The wizard advances through a tree of questions. Each terminal sets fields on the current item and advances to the next item in the queue.

**Top-level sequence:**

```
Q1. Keep this?
  YES → Q2
  NO  → terminal: trash

Q2. Commit now?
  YES → Q3
  NOT YET → terminal: incubate

Q3. What kind of item?
  Action     → action branch (5.2.1)
  Reference  → reference branch (5.2.2)
  Creation   → creation branch (5.2.3)
```

**Terminal: trash**
- Set `isTrashed: true`, `trashedAt: now()`
- `kind` and `status` are preserved (not modified)
- Advance to next item

**Terminal: incubate**
- Set `status: incubate`, `incubatedAt: now()`
- `kind` remains `capture`
- Advance to next item

#### 5.2.1 Action branch

```
Q4. Recurring?
  YES → Q5 (habit path)
  NO  → Q6

Q5. Fill habit details. → Confirm. → terminal: habit
  Then: Q-date

Q6. Multi-step project?
  YES → Q7 (project path)
  NO  → Q8

Q7. Fill project details. → Confirm. → terminal: project
  Then: Q-waiting-project, Q-date-project

Q8. Under 2 minutes?
  YES → Q8a (do-now path)
  NO  → Q9

Q8a. "Go do it now."
  DONE     → terminal: completed task
  NOT DONE → Q9

Q9. Delegate?
  YES → Q9a → terminal: delegated task
  NO  → Q10

Q9a. Fill in who you are delegating to.

Q10. Blocked / waiting?
  YES → Q10a → terminal: waiting task
  NO  → Q11

Q10a. Fill in reason for the wait.

Q11. Has a date?
  YES → Q11a → terminal: dated task
  NO  → terminal: task
```

**Terminal: habit**
- Set `kind: action`, `type: habit`, `status: later`
- Then proceed to date question (Q-date below)

**Q-date (habit only):**
- "Has a date?"
- YES → set `startAt` and/or `endAt` → advance
- NO  → advance

**Terminal: project**
- Set `kind: action`, `type: project`, `status: later`
- Then proceed to waiting and date questions (Q-waiting-project, Q-date-project)

**Q-waiting-project:**
- "Blocked / waiting?"
- YES → fill `waitingReason`, set `status: waiting` → continue to Q-date-project
- NO  → continue to Q-date-project

**Q-date-project:**
- "Has a date?"
- YES → set `startAt` and/or `endAt` → advance
- NO  → advance

**Terminal: completed task**
- Set `kind: action`, `type: task`, `status: complete`, `completedAt: now()`
- Advance

**Terminal: delegated task**
- Set `kind: action`, `type: task`, `status: waiting`, `delegatedTo: <input>`
- Advance

**Terminal: waiting task**
- Set `kind: action`, `type: task`, `status: waiting`, `waitingReason: <input>`
- Advance

**Terminal: dated task**
- Set `kind: action`, `type: task`, `status: later`, `startAt` and/or `endAt`
- Advance

**Terminal: task**
- Set `kind: action`, `type: task`, `status: later`
- Advance

#### 5.2.2 Reference branch

```
Q12. Pick reference type. (user-defined list, required)
  → terminal: reference
```

**Terminal: reference**
- Set `kind: reference`, `type: <selected>`, `status: later`
- Advance

The picker shows all rows from `type_registry` where `kind: reference`, alphabetically.

#### 5.2.3 Creation branch

```
Q13. Pick creation type. (user-defined list, required)
  → Q14

Q14. Blocked / waiting?
  YES → Q14a → continue
  NO  → continue

Q14a. Fill in reason for the wait. → set status: waiting

Q15. Has a date?
  YES → Q15a → terminal: creation
  NO  → terminal: creation

Q15a. Set startAt and/or endAt timestamps.
```

**Terminal: creation**
- Set `kind: creation`, `type: <selected>`
- Status:
  - If Q14 was YES: `status: waiting`, `waitingReason: <input>`
  - Otherwise: `status: later`
- If Q15 was YES: set `startAt` and/or `endAt`
- Advance

### 5.3 Wizard chrome

Persistent UI elements present on every wizard screen.

**Top bar:**
- **Back button** — left side
- **Exit button** — right side
- **Progress indicator** — center or alongside, format "N of M" where M is unprocessed item count

**Persistent header (below top bar):**
- Captured text of the current item, displayed as editable inline (tap to edit). Editing updates `items.content` and `updatedAt`. Wizard progress is **not** reset on edit.

**Near answer buttons:**
- **Skip button** — visually distinct from primary answer buttons (smaller, secondary styling)

### 5.4 Back button behavior

- Rewinds one decision step on the current item.
- Sub-flows like "fill habit details → confirm" are atomic — back from anywhere inside returns to the decision *before* the sub-flow began, discarding entered data.
- **Disabled** when no prior decision exists for the current item (i.e., on Q1).
- Cannot cross item boundaries — once an item terminates, it is sealed.

**Implementation:** the wizard maintains an in-memory stack of decisions for the current item only. Cleared when item terminates.

### 5.5 Skip and exit behavior

**Skip:**
- Discards all in-progress wizard answers for the current item.
- Item retains its original state: `kind: capture, status: later`.
- Advances to the next item in the queue.
- Skipped items are tracked in **session-scoped** memory (cleared on wizard close).
- No confirmation dialog.

**Exit:**
- Closes the wizard immediately.
- Current item's in-progress answers are discarded.
- No confirmation dialog.
- Wizard state cleared (including session skip tracking).

### 5.6 Special states

**Empty inbox:**
- Show: "Inbox clear." with subtitle "Nothing to process right now."
- Single button: **Close**

**All items skipped in session:**
- Triggered when every item in the inbox has been skipped in the current session.
- Show: "All items skipped. Try again later."
- Two buttons: **Restart** (resets session skip tracking, returns to first item) and **Exit** (closes wizard).

### 5.7 Edge cases

| Case | Behavior |
|---|---|
| Capture with empty content | Server-side validation rejects the insert. No wizard handling needed. |
| Item modified externally mid-flow (other tab/device) | On submit, re-check item's `kind` and `isTrashed` state. If changed, show notice ("This item was processed elsewhere") and skip to next. |
| Network loss | Wizard works fully offline against IndexedDB. Sync to Supabase resumes when reconnected. |
| User reopens wizard after exit | Fresh start. Earliest unprocessed item shown. No mid-flow state preserved. Session skip tracking cleared. |
| Multi-device simultaneous wizard | Optimistic — both devices process freely. Check-before-submit handles conflicts gracefully. No locking. |

### 5.8 Validation

Each terminal must produce a valid item state:
- `kind: action` items must have `type` in (`task`, `project`, `habit`)
- `kind: reference`, `kind: creation` items must have a `type` selected from the registry
- `status: complete` requires `completedAt` set
- `status: incubate` requires `incubatedAt` set
- `status: waiting` should have either `waitingReason` or `delegatedTo` set (per the branch that produced it)

Reject submission and surface the violation if any invariant fails.

## 6. Types settings page

A **Types** section within the existing settings page.

### 6.1 Structure

Three subsections, stacked vertically:

1. **Reference Types**
2. **Creation Types**
3. **Log Types**

Each subsection shows:
- Header with kind name and **+ Add type** button
- List of types belonging to that kind, alphabetical (case-insensitive)
- Empty state: "No types yet. Add one to get started."

### 6.2 Row layout

Each type row shows:
- Type name
- Item count: format `47` (active) or `47 (3)` if archived count > 0. Hide parentheses when archived count is zero.
  - Active: `kind = X AND type = Y AND isTrashed = false AND isArchived = false`
  - Archived: `kind = X AND type = Y AND isTrashed = false AND isArchived = true`
  - Trashed items excluded from both counts
- Edit button
- Delete button
- Metadata template placeholder — disabled UI, "Coming soon" or similar (no behavior in v1)

### 6.3 Add type

- Tap **+ Add type**
- Inline input field appears, focused
- User types name, presses enter or taps confirm
- Validation:
  - Non-empty
  - No leading/trailing whitespace
  - Case-insensitive uniqueness within the same kind
- On submit: insert row into `type_registry`
- Cancel via Escape or tap-away

### 6.4 Edit (rename)

- Tap edit on a row
- Row converts to inline input with current name pre-filled
- Same validation as add
- On submit:
  - Update `type_registry.name`
  - **Cascade update:** update `items.type` for every item where `type = <old name>` AND `kind = <subsection kind>`. Silent — no confirmation.
- Implemented as a single transaction.

### 6.5 Delete

- Tap delete on a row
- Two paths based on item count:

**Zero items use this type:**
- Confirmation: "Delete '<name>'? This cannot be undone."
- On confirm: hard-delete the row from `type_registry`

**N items use this type (active + archived):**
- Open reassignment dialog:
  - Title: "Reassign N items"
  - Body: "N items currently use the type '<name>'. Pick where they go:"
  - Picker: list of existing types within the same kind
  - Inline input: "Or create a new type:"
  - Buttons: **Cancel** | **Reassign and delete**
- On confirm:
  - If user picked an existing type: validate it exists
  - If user entered a new type: validate (same as Add) and insert into `type_registry`
  - Update `items.type` for all affected items to the chosen target
  - Hard-delete the source type row
  - All within a single transaction

### 6.6 Reorder

Not supported in v1. Display is alphabetical (case-insensitive).

## 7. Status lifecycle reference

The wizard sets initial status. Subsequent status transitions happen in each kind's own view, outside the wizard.

| Status | Set by | Notes |
|---|---|---|
| `later` | Capture submission; most wizard terminals | Default state |
| `active` | Outside wizard (user starts working on item) | Set in item's view |
| `waiting` | Wizard waiting/delegate branches; outside wizard | Requires `waitingReason` or `delegatedTo` |
| `paused` | Outside wizard (user sets aside actively) | For creations primarily |
| `complete` | Wizard 2-min DONE; outside wizard | Sets `completedAt` |
| `incubate` | Wizard "Commit: NOT YET" | Sets `incubatedAt` |

Statuses are system-locked. Users cannot add custom statuses.

## 8. Open items deferred to later phases

These are intentionally **not** in v1 of this feature. Listed here so they're not lost.

- **Habit recurrence schema.** "Fill habit details" currently has no defined data shape. Habits as a kind need a recurrence model (see RRULE-style or structured object) before habits ship as functional. Likely lives in a separate `habit_schedules` table.
- **Time logging.** Mentioned as adjacent to habits — likely its own table.
- **Log mode.** The capture wizard does not produce log entries. Logs are created in their own mode.
- **Journal mode.** Same — separate creation mode, not in capture wizard.
- **Review mode.** Separate mode for weekly/yearly review workflows.
- **Tags.** Not part of v1. When added, will resolve the "errand / shopping / groceries" use cases without changing action types.
- **Project → task creation flow.** The wizard creates projects but does not create their child tasks. Adding tasks to a project happens in the project's own view.
- **Metadata templates per type.** Placeholder UI exists in settings; no implementation in v1.
- **Wiki-link / backlink resolution.** Mentioned as the linking mechanism between items (e.g., contacts and log entries). Not in scope here.

## 9. Acceptance criteria

The feature is complete when:

1. A user can submit a capture and see it appear in the inbox.
2. Opening the wizard with a non-empty inbox shows the earliest unprocessed item and walks through the question tree.
3. All seven terminal types (trash, incubate, habit, project, completed task, delegated task, waiting task, dated task, plain task, reference, creation) produce items with the correct field values per section 5.2.
4. Back, Skip, and Exit behave as specified in 5.4 and 5.5.
5. Empty inbox and all-skipped states render correctly.
6. Mid-flow text editing works and does not reset wizard progress.
7. Wizard works fully offline; changes sync to Supabase when reconnected.
8. The Types settings page supports add, edit (with cascade), and delete (with reassignment) for reference, creation, and log types.
9. Item counts in settings match the active/archived definitions in 6.2.
10. Seed data is inserted on first install per 3.3.
