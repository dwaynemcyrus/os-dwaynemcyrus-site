# build-spec-v3-import-restore

## Purpose

Define the next portability milestone after `build-spec-v2-export-backup.md`.

This build is not current yet.

It exists to let the user bring a previously exported PSA backup back into the
system deliberately and safely, without silently merging or overwriting data.

---

## Status

- planned
- not active
- do not implement by default while `docs/agents/build-spec.md` still points to
  `build-spec-v2-account-recovery.md`

---

## Why This Is A Separate Build

The current app proves:

- local-first capture
- authenticated sync
- backup export
- signed-in password management

This next build adds a different guarantee:

- the user can restore from an exported backup intentionally

That is a product-level data-integrity feature, not a small extension of export.

---

## Included

- user-initiated JSON import from the exported PSA backup format
- validation of backup structure before import begins
- explicit restore confirmation UX
- safe import behavior into local storage and canonical Supabase-backed account data
- clear success and failure messaging

---

## Excluded

- automatic background restore
- silent merge behavior
- CSV or secondary import formats
- collaborative or multi-user import behavior
- partial-field conflict resolution UI
- backup scheduling

---

## Product Goals

- the user can recover data from a previously exported backup
- restore behavior is deliberate and understandable
- data loss risk is minimized by explicit confirmation and validation
- the feature remains narrow and single-user in scope

---

## First Release Definition

The first release of this build should provide:

- a visible import/restore entry point in settings
- backup-file selection for the PSA JSON export format
- payload validation before any write happens
- a restore confirmation step
- clear import result messaging

The first release should not include automatic merging heuristics beyond a
single explicit restore strategy.

---

## Restore Direction

The restore model should assume:

- the input file is a PSA JSON export produced by this app
- restore is initiated by the signed-in single user
- validation happens before local or remote writes begin
- the restore strategy must be explicit and documented before implementation

Recommended first strategy:

- import validated items into the signed-in account by item `id`
- last-write-wins by `updatedAt` when the same item already exists
- preserve local-first safety by writing locally first, then syncing
- do not hard-delete existing items that are absent from the backup

---

## Payload Expectations

Minimum expected fields per item:

- `id`
- `userId`
- `content`
- `type`
- `status`
- `createdAt`
- `updatedAt`
- `deviceCreatedAt`
- `deviceUpdatedAt`
- `syncState`
- `lastSyncedAt`
- `isTrashed`
- `trashedAt`

The restore process may ignore export-only wrapper fields that are not needed
for item reconstruction, but it must reject malformed or incomplete item data.

---

## Rules

- restore must only accept the authenticated user's explicit action
- restore must validate file structure before writing any item
- restore must not imply that arbitrary JSON files are supported
- restore must not bypass the local-first data model
- restore messaging must make the chosen merge strategy explicit

---

## Risks

- weak validation could import malformed or partial data
- unclear merge behavior could overwrite newer local or remote rows unexpectedly
- treating restore like a simple file upload could hide significant data effects

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
