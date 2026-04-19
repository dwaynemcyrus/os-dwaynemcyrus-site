# build-spec-v2-export-backup

## Purpose

Define the next portability milestone after `build-spec-v1-capture.md`.

This build is not current yet.

It exists to give the user a durable, user-controlled backup path outside
Supabase without expanding into import or restore work yet.

---

## Status

- implemented
- not active
- keep this file as the prior milestone reference while
  `docs/agents/build-spec.md` points to the next current build

---

## Why This Is A Separate Build

The current build proves:

- local-first capture
- authenticated sync
- multi-device visibility
- installable PWA behavior

This next build adds a different product guarantee:

- user-controlled data portability
- a concrete backup story beyond “it exists in Supabase”

That is a product-level resilience step, not just implementation cleanup.

---

## Included

- authenticated export action
- export of all user-visible items for the signed-in user
- JSON as the first export format
- downloaded backup file from the app
- enough metadata to preserve timestamps, trash state, and sync-relevant fields
- clear success and failure messaging around export generation

---

## Excluded

- import flow
- restore flow
- merge-from-backup behavior
- CSV or secondary export formats
- scheduled backups
- collaborative or multi-user sharing features

---

## Product Goals

- the user can leave the system with their data
- backups are explicit and user-controlled
- the export is trustworthy enough to serve as a durable personal backup
- the feature remains narrow and understandable

---

## First Release Definition

The first release of this build should provide:

- a signed-in export action
- a JSON download containing the user’s items
- a predictable filename and download flow
- export of canonical item content and metadata needed for future restore design

The first release should not include import.

---

## Backup Payload Direction

Minimum acceptable content:

- item `id`
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

Local-only fields that are implementation-specific may be included if they help
future restore planning, but the export should be understandable as user data
first, not internal cache state first.

---

## Rules

- export must only include the authenticated user’s items
- export must not depend on the service worker
- export should prefer the canonical user data shape over opaque internals
- export success and failure must be visible in the UI
- import and restore semantics must not be implied by this build

---

## Risks

- export without a later restore plan can invite overconfidence if not described clearly
- exporting internal-only sync fields carelessly can make the payload harder to understand
- weak filtering by user id would be a severe correctness bug

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
