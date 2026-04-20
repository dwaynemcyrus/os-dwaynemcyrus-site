# Memory

This file records repeatable problems, durable fixes, and repo-specific traps so
future sessions do not need to rediscover them.

## Environment

### Next.js root inference can drift when parent lockfiles exist
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: `next build` warns that it inferred the workspace root from a lockfile outside the repo.
- Root cause: Next.js detects multiple lockfiles and may choose a parent directory as the Turbopack root.
- Resolution: set `turbopack.root` explicitly in `next.config.ts` to `process.cwd()`.
- Prevention: keep the repo root pinned in config instead of relying on inferred workspace boundaries.
- References:
  - `next.config.ts`

## Tooling

### Initial hook loads should not call state-setting helpers directly from effects
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: `eslint` fails with `react-hooks/set-state-in-effect` when an effect directly invokes a helper that synchronously sets state.
- Root cause: the effect body calls a reusable load function whose control flow reaches `setState`, which React treats as a cascading render pattern.
- Resolution: keep the initial async load inside the effect itself, await the external work there, and then update state after the async boundary with a cancellation guard when needed.
- Prevention: for mount-time data loads, do not call reusable state-setting helpers directly from `useEffect`; keep the first-load path local to the effect.
- References:
  - `lib/hooks/useItems.ts`

### Supabase CLI writes ephemeral project state under `supabase/.temp`
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: `supabase db push` and related CLI commands can leave generated temp files that show up as noisy tracked changes.
- Root cause: the Supabase CLI persists local project metadata in `supabase/.temp/`.
- Resolution: ignore `supabase/.temp/` in `.gitignore` and keep only canonical migration files in version control.
- Prevention: when reviewing Supabase changes, stage only `supabase/migrations/*` unless a real repo-managed config file is intentionally added.
- References:
  - `.gitignore`
  - `supabase/migrations/20260418130000_create_items.sql`

### Stale local Supabase refresh tokens should be cleared automatically
- Status: active
- First seen: 2026-04-20
- Last seen: 2026-04-20
- Symptom: the browser console shows `Invalid Refresh Token: Refresh Token Not Found` and session bootstrap keeps trying to refresh a dead local token.
- Root cause: a previously rotated or invalidated Supabase session remains in local browser storage, and `getSession()` or `getUser()` attempts to refresh it on startup.
- Resolution: detect the specific invalid-refresh-token error, clear the local Supabase session with local sign-out, and treat the session as missing.
- Prevention: on auth bootstrap, do not surface invalid local refresh-token state as an application error; clear it narrowly and continue signed out.
- References:
  - `lib/supabase/auth.ts`

## Build / CI

- None currently.

## Architecture

### Local capture must not await remote sync
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: capture flow can feel blocked or fail when network conditions are poor.
- Root cause: treating remote sync success as the definition of capture success.
- Resolution: treat the local IndexedDB write as success and run Supabase sync in the background.
- Prevention: do not await remote sync from UI capture handlers or route-level UI code.
- References:
  - `docs/build-specs/build-spec-v1-capture.md`
  - `docs/agents/architecture.md`

## UI / UX

### App shell must not scroll at the viewport level
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: iPhone Safari layout becomes unstable, especially around keyboard and FAB positioning.
- Root cause: allowing page-level scrolling instead of a fixed shell with an internal scroll region.
- Resolution: keep the root shell static and confine scrolling to the internal content region.
- Prevention: check shell and route composition against the canonical build spec before changing layout behavior.
- References:
  - `docs/build-specs/build-spec-v1-capture.md`
  - `docs/agents/frontend.md`

## Data / Sync

### Push-only sync is not enough for multi-device visibility
- Status: active
- First seen: 2026-04-19
- Last seen: 2026-04-19
- Symptom: items created on one signed-in device appear in Supabase but never show up on other devices unless those devices also created them locally.
- Root cause: local pending rows were pushed to Supabase, but there was no remote pull/reconcile path back into each device's IndexedDB.
- Resolution: treat remote pull into IndexedDB as part of the baseline sync engine, not an optional extra, and trigger it on app load, reconnect, foreground, and manual refresh.
- Prevention: do not call a sync model "multi-device" if it only pushes local state and never repopulates other devices' local stores.
- References:
  - `lib/sync/syncEngine.ts`
  - `lib/items/itemMappers.ts`
  - `lib/hooks/useRetrySync.ts`

### Deferred sync must no-op until Supabase auth exists
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: pending items can never satisfy RLS if sync runs with a placeholder local user or without an authenticated Supabase session.
- Root cause: the remote schema uses `auth.uid() = user_id`, while local capture starts with a temporary `local-user` owner before auth is implemented.
- Resolution: wire the real Supabase client now, but exit the sync engine cleanly when env vars or an authenticated user are missing and leave items in `pending_sync`.
- Prevention: do not treat missing auth as a sync error and do not push placeholder `userId` values to Supabase.
- References:
  - `lib/supabase/auth.ts`
  - `lib/sync/syncEngine.ts`
  - `supabase/migrations/20260418130000_create_items.sql`

### Backup exports should use canonical Supabase rows, not device cache state
- Status: active
- First seen: 2026-04-19
- Last seen: 2026-04-19
- Symptom: export payloads can differ by device if they are built from local IndexedDB instead of the authenticated remote dataset.
- Root cause: each device maintains its own local cache and reconciliation timing, while the backup contract is supposed to represent the user's canonical synced data.
- Resolution: generate backup downloads from authenticated Supabase rows filtered by `user_id`, then map those rows into the exported JSON shape.
- Prevention: treat local IndexedDB as a runtime cache for this feature, not as the source of truth for durable backup export.
- References:
  - `lib/export/exportBackup.ts`
  - `docs/build-specs/build-spec-v2-export-backup.md`

### Restore imports must compare against remote rows before queueing sync
- Status: active
- First seen: 2026-04-20
- Last seen: 2026-04-20
- Symptom: a restored backup can overwrite newer canonical data if imported rows are blindly marked pending and pushed immediately.
- Root cause: restore operates on exported snapshots, while the signed-in account may already contain newer remote rows than the backup file.
- Resolution: compare imported items against both local and remote state first; skip older backup rows, keep local rows on exact timestamp ties, and only queue sync for imported rows that are actually newer than the current remote version or absent remotely.
- Prevention: never treat restore as a pure local file import followed by unconditional sync; restore must understand remote freshness before scheduling writes.
- References:
  - `lib/backup/restoreBackup.ts`
  - `lib/sync/syncEngine.ts`

### Remote deletions should reconcile only on explicit manual refresh
- Status: active
- First seen: 2026-04-20
- Last seen: 2026-04-20
- Symptom: rows manually removed from Supabase remain visible locally even after a normal sync cycle, or destructive reconciliation risks wiping unsynced device-only data.
- Root cause: the baseline sync engine pulls existing remote rows but should not silently treat remote absence as destructive on every background sync trigger.
- Resolution: mirror remote absence as local trash only during an explicit manual refresh, and only for rows already fully synced locally; never apply that rule to pending or errored local rows.
- Prevention: keep background sync non-destructive by default and reserve remote-deletion reconciliation for deliberate user refresh actions.
- References:
  - `lib/sync/syncEngine.ts`
  - `lib/db/itemRepository.ts`

### Permanent delete needs a local tombstone until remote delete succeeds
- Status: active
- First seen: 2026-04-20
- Last seen: 2026-04-20
- Symptom: a local-first hard delete can disappear from IndexedDB before the app has enough information left to delete the matching Supabase row.
- Root cause: physically removing the row from local storage immediately destroys the identifier and sync flags the background delete path needs.
- Resolution: mark the item as a hidden pending remote delete locally, process the Supabase delete first in the sync engine, and only remove the IndexedDB row after the remote delete succeeds.
- Prevention: for destructive remote actions, do not equate "hide from UI now" with "erase from local persistence now"; preserve a tombstone until sync completion.
- References:
  - `lib/db/itemRepository.ts`
  - `lib/sync/syncEngine.ts`

## Deployment

### Supabase email confirmation depends on dashboard redirect settings
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-19
- Symptom: signup appears to work, but the confirmation link returns to the wrong location or fails to establish the expected browser session.
- Root cause: password signup with email confirmation depends on the project `Site URL` and allowed `Redirect URLs` matching the app origin.
- Resolution: configure the Supabase Auth dashboard so the local dev origin, deployed origin, and any explicit auth callback paths like `/settings/reset-password` are valid redirect targets before testing confirmation or recovery emails.
- Prevention: whenever the app origin or auth-route path changes, update Supabase Auth redirect settings alongside env configuration.
- References:
  - `.env.local`
  - `lib/supabase/auth.ts`

### Single-user password apps should not pretend to offer self-service recovery without email infrastructure
- Status: active
- First seen: 2026-04-20
- Last seen: 2026-04-20
- Symptom: the UI can imply that locked-out users can reset their password even though no production email channel exists to deliver a recovery link.
- Root cause: reusing a generic consumer-auth pattern in a single-user app that intentionally avoids SMTP or other external recovery factors.
- Resolution: keep only signed-in password change in the app and document locked-out recovery as a manual Supabase dashboard or admin action.
- Prevention: do not add a `Forgot password` surface unless the project has a real recovery channel configured and tested.
- References:
  - `docs/build-specs/build-spec-v2-account-recovery.md`
  - `components/settings/SettingsPanel.tsx`

## Known Constraints

### Active build spec must be in the mandatory read order
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: future sessions may follow `AGENTS.md` but still miss the actual active build definition.
- Root cause: the build-spec entrypoint and the top-level read order can drift apart.
- Resolution: require reading the active build spec directly after `docs/agents/build-spec.md`.
- Prevention: keep `AGENTS.md` and `docs/agents/build-spec.md` aligned whenever the documentation workflow changes.
- References:
  - `AGENTS.md`
  - `docs/agents/build-spec.md`

### Build specs use a flat primary catalog plus shared supporting docs
- Status: active
- First seen: 2026-04-18
- Last seen: 2026-04-18
- Symptom: future sessions may scatter build docs into role folders or ad hoc subdirectories.
- Root cause: documentation ownership boundaries are easy to blur over time.
- Resolution: keep primary build specs in `docs/build-specs/` with filenames starting `build-spec`, and place support docs in `docs/build-specs/supporting/`.
- Prevention: update `docs/agents/build-spec.md` rather than relocating canonical build docs elsewhere.
- References:
  - `docs/agents/build-spec.md`
