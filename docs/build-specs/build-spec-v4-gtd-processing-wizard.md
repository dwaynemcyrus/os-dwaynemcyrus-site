# build-spec-v4-gtd-processing-wizard

## Purpose

Define the next milestone after `build-spec-v3-import-restore.md`.

This build adds a dedicated inbox-processing wizard that follows a simplified
GTD flow while keeping the app single-user, local-first, and intentionally
narrow.

---

## Status

- current
- active
- implementation should follow this file while
  `docs/agents/build-spec.md` points here

---

## Included

- dedicated `/process` route for one-item-at-a-time inbox processing
- inbox defined by `type = 'unknown'`
- simplified GTD branching:
  - `task`
  - `project`
  - `reference`
  - `incubate`
  - trash via existing trash flow
- destination views:
  - `/tasks`
  - `/notes`
  - `/incubate`
- local-first processing writes followed by deferred sync
- backup/export/restore compatibility for the new type values

---

## Excluded

- `gtd_outcome`
- `processing_state`
- waiting-for
- calendar / tickler
- note subtypes
- project planning structure
- backtracking within a processing session

---

## Type Mapping

- `unknown` = inbox / unprocessed
- `task` = next action
- `project` = project
- `reference` = notes
- `incubate` = incubate

Legacy compatibility:

- `someday` is retired
- legacy `someday` rows and backups must be normalized to `incubate`

---

## Route Rules

- `/list` shows inbox only
- `/process` processes oldest inbox items first
- `/tasks` shows `task` and `project`
- `/notes` shows `reference`
- `/incubate` shows `incubate`
- `/trash` remains separate and unchanged as trash

---

## Processing Flow

1. show one inbox item
2. allow clarify/edit of `content`
3. ask if it is actionable
4. if actionable:
   - next action -> `task`
   - project -> `project`
5. if non-actionable:
   - notes -> `reference`
   - incubate -> `incubate`
   - trash -> existing trash path
6. persist locally first
7. sync in background
8. advance to next inbox item automatically

---

## Data Rules

- use `type` as the sole processing result
- do not add GTD-specific state columns
- do not create separate note, task, or project tables
- preserve the existing `status` field unchanged in this build

---

## Risks

- legacy `someday` data must be migrated and normalized correctly
- `/list` changes meaning from generic captured list to inbox
- the wizard must not block capture or degrade local-first guarantees
