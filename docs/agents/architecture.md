# Architecture Agent — @architecture
# Location: docs/agents/architecture.md
# Scope: IndexedDB, Supabase schema, sync model, domain logic, migrations.
# Read order: AGENTS.md → build-spec.md → this file.

---

## Role Scope

Handle tasks involving:

- Supabase schema and policies
- IndexedDB schema and storage setup
- local item repository logic
- item commands and query logic
- local/remote mapping
- sync orchestration and retry behavior
- architecture and responsibility boundaries in `lib/`

Do not handle:

- page layout
- component markup
- visual styling

If a task spans data and UI, coordinate through `@planner`.

---

## Product Lens

The architecture exists to guarantee capture integrity.

Order of truth:

1. local write success
2. UI reflects local state
3. remote sync happens later

Any architecture that can lose captured input is wrong, even if it looks clean.

---

## Canonical Remote Schema

Primary table: `public.items`

Required fields:

- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null`
- `content text not null`
- `type text not null default 'unknown'`
- `status text not null default 'backlog'`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `device_created_at timestamptz`
- `device_updated_at timestamptz`
- `sync_state text not null default 'synced'`
- `last_synced_at timestamptz`
- `is_trashed boolean not null default false`
- `trashed_at timestamptz`

Required constraints:

- `type` limited to canonical values
- `status` limited to `backlog`
- `sync_state` limited to `pending_sync | synced | sync_error`

Required indexes:

- `items_user_idx`
- `items_created_idx`
- `items_sync_idx`
- `items_trashed_idx`

Required support:

- `set_updated_at()` trigger function
- `set_items_updated_at` trigger
- RLS enabled
- own-row select, insert, and update policies

---

## Canonical Local Model

Local persistence uses IndexedDB.

The local model intentionally includes fields that do not exist remotely.

Required local fields:

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
- `needsRemoteCreate`
- `needsRemoteUpdate`
- `syncErrorMessage`

### Important rule

Do not force the local model to mirror Supabase 1:1.

Local-only sync bookkeeping is part of the design, not accidental drift.

---

## Required File Ownership

### `lib/db/indexedDb.ts`

Owns:

- database name and version
- object store creation
- upgrade path for local schema
- low-level IndexedDB access

Does not own:

- item business commands
- sync orchestration

### `lib/db/itemRepository.ts`

Owns:

- local item persistence methods
- local reads and updates used by domain logic

Expected methods include:

- `getAllItems`
- `getVisibleItems`
- `createItem`
- `updateItem`
- `markItemTrashed`
- `getPendingSyncItems`
- `getFailedSyncItems`
- `setItemSynced`
- `setItemSyncError`

### `lib/items/itemCommands.ts`

Owns:

- `createCapturedItem(content)`
- `trashItem(id)`
- `retryFailedSync()`

Commands call repository methods and trigger sync scheduling when appropriate.

### `lib/items/itemQueries.ts`

Owns:

- visible backlog reads
- newest-first ordering
- hidden-trashed filtering
- app-level sync counts

### `lib/items/itemMappers.ts`

Owns:

- local-to-remote mapping
- remote-to-local mapping
- field-name translation

### `lib/sync/syncEngine.ts`

Owns:

- actual remote write workflow
- reading pending or failed items from local storage
- updating local sync state after remote results

### `lib/sync/syncQueue.ts`

Owns:

- guarding against overlapping sync runs
- sequential or otherwise safe sync execution

Keep it thin in v1. Do not build a queue framework.

### `lib/sync/networkState.ts`

Owns:

- browser online/offline wrappers only

It does not own React state or sync orchestration.

---

## Sync Rules

### Capture flow

On submit:

1. validate input
2. write locally first
3. mark pending sync
4. return success to UI immediately
5. attempt remote sync in background

### Remote success

- keep the item locally
- set local sync state to synced
- set `lastSyncedAt`
- clear sync error details

### Remote failure

- keep the item locally
- set sync state to sync error
- store failure context when useful
- never delete or hide the item because remote write failed

### Retry triggers

- app launch
- network reconnect
- app foreground/resume

### UI boundary rule

UI code must never await remote sync to decide whether capture succeeded.

---

## Trash Rules

- no hard delete
- trash is a local update first
- set `isTrashed`
- set `trashedAt`
- mark pending sync
- hide trashed items from visible list queries
- no restore flow in v1
- no trash screen in v1

If a proposed change introduces hard delete, stop and escalate.

---

## Service Worker Boundary

Service worker responsibilities are narrow:

- cache app shell
- support offline app load

Service worker must not:

- own data sync logic
- become the source of truth for item data
- replace IndexedDB as the canonical local store

---

## Schema Change Protocol

Before any remote schema change, stop and list:

- tables affected
- columns and types
- constraints
- indexes
- RLS policies
- migration strategy
- effect on local model
- effect on sync behavior

Do not execute schema changes until approved.

### Migration rule

When modifying an existing remote schema:

1. add fields safely
2. preserve local capture behavior
3. update local schema and migration path
4. update mappers and sync engine
5. update UI only after persistence contracts are stable

---

## Type Rules

- use explicit types
- no `any`
- type remote rows and local items separately
- keep string unions centralized in `itemTypes.ts`

Field naming rule:

- remote shape uses snake_case
- local shape uses camelCase
- translation belongs in `itemMappers.ts`

---

## Anti-Drift Rules

- No direct Supabase calls from route files.
- No direct IndexedDB calls from components.
- No sync logic inside `ItemRow`, `CaptureDialog`, or other UI components.
- No hidden hard-delete path.
- No local-state-only fake success path when local write fails.
- No collapsing repository, commands, queries, and sync into one file.

---

## Verification Gates (this role)

After any architecture chunk:

- run `typecheck`, `lint`, and tests when project tooling exists
- verify capture still succeeds with no network
- verify failed sync does not remove items
- verify retry triggers remain intact
- verify service worker boundaries are preserved

If the repo still lacks tooling, state that explicitly and stop at documented
manual verification where possible.

---

## Handoff to @frontend

When architecture work hands off to UI work, include:

- exact fields the UI should consume
- exact command or hook entry points to call
- sync states the UI must represent
- any keyboard or timing constraints the UI must respect

Do not hand off vague “items data changed” notes. Be specific.
