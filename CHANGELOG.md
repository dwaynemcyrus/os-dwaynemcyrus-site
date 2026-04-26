# Changelog

All notable commit-ready changes to this project should be recorded here.

## Unreleased

### Added
- Dedicated `/process` route for one-item-at-a-time inbox processing with simplified GTD decisions.
- New outcome views for `/tasks`, `/notes`, and `/incubate`.
- Session-scoped rapid capture toggle in the shared capture dialog for repeated local saves without closing the modal.
- New current v5 build spec for split task/project destination views and a dedicated `/projects` route.

### Changed
- Promoted `docs/build-specs/build-spec-v4-gtd-processing-wizard.md` to the current build in the build-spec entrypoint.
- Promoted `docs/build-specs/build-spec-v5-task-project-destination-views.md` to the current build in the build-spec entrypoint.
- Re-defined inbox processing around `type = 'unknown'` and added `project` plus `incubate` as canonical processed types.
- Moved the trash navigation entry from `/settings` to the home screen.
- Moved backup export from the home account panel into `/settings` and restricted the signed-out home screen to auth-only UI.
- Split destination review so `/tasks` shows only `task`, `/projects` shows only `project`, and both destinations are promoted to the signed-in home screen.

### Fixed
- Normalized legacy `someday` data and backups to `incubate` for the new processing model.
- Hardened the inbox processing wizard against duplicate decision taps, blocking load hangs, and misleading progress messaging during inbox loading failures.
- Corrected the back button destination on `/tasks`, `/notes`, and `/incubate` to return to home instead of `/settings`.
- Fixed the processing wizard back button to return to the previous step rather than always resetting to clarify.
- Removed the direct trash shortcut from the inbox list view so all inbox items must be routed through the processing wizard.
- Moved hardcoded `"Inbox"`, `"Next Actions"`, and `"Projects"` strings into `LABELS`.

## 1.1.0 - 2026-04-21

### Added
- Signed-in JSON backup export from canonical Supabase rows with a direct browser download flow.
- Signed-in password change flow on `/settings` with double-entry confirmation for this single-user app.
- Signed-in import/restore flow on `/settings` with PSA backup validation, explicit confirmation, local-first restore writes, and immediate background sync for imported items.
- Dedicated `/trash` route for reviewing trashed items and permanently deleting them with confirmation.

### Changed
- Promoted `docs/build-specs/build-spec-v2-export-backup.md` to the current build in the build-spec entrypoint.
- Promoted `docs/build-specs/build-spec-v2-account-recovery.md` to the current build in the build-spec entrypoint.
- Promoted `docs/build-specs/build-spec-v3-import-restore.md` to the current build in the build-spec entrypoint.
- Removed the incomplete email-based reset flow and re-scoped the current auth milestone around signed-in password change plus manual locked-out recovery.
- Extended the current `v3` build to include a dedicated trash route and local-first permanent delete semantics.
- Moved the `Open Trash` control into its own settings section instead of grouping it with password-change actions.

### Fixed
- Cleared stale local Supabase sessions automatically when the browser encounters an invalid refresh-token error during session bootstrap.
- Mirrored rows manually deleted from Supabase as locally trashed items on explicit manual refresh, while protecting unsynced local rows from accidental loss.
- Synced confirmed permanent deletes from `/trash` to Supabase in the background while hiding deleted items from local lists immediately.
- Clarified restore results so backup processing reports matched, newer-local, newer-remote, and queued counts instead of a single ambiguous skipped total.
- Replaced the dense restore-result sentence with a structured summary block in settings so backup processing is easier to scan.

### Docs
- Added a non-current `build-spec-v3-import-restore.md` to define the next planned restore milestone.

## 1.0.0 - 2026-04-19

### Added
- Initial documentation structure for build specs and agent guidance.
- Initial Next.js App Router scaffold with TypeScript, ESLint, and npm tooling.
- Phase 1 app shell with shared layout components, text button primitive, and `/` plus `/list` route skeletons.
- Phase 2 local-first capture flow with IndexedDB persistence, Radix Dialog capture UI, and local item rendering on `/list`.
- Phase 3 deferred sync foundation with Supabase client wiring, repo-local SQL migrations, a guarded sync queue, and derived sync-status hooks.
- Phase 4 email/password auth flow with an embedded home-screen auth panel, session-aware client hooks, sign in/sign out, and confirmation-required account creation messaging.
- Phase 5 PWA hardening with manifest metadata, generated PSA install icons, native service-worker registration, and offline app-shell caching.
- Phase 6 multi-device sync completion with remote pull reconciliation, foreground/manual refresh, and a future split build-spec direction for export/backup plus account recovery.

### Changed
- Established `docs/agents/build-spec.md` as the stable entrypoint for the active build.
- Standardized build spec storage under `docs/build-specs/` with shared support docs in `docs/build-specs/supporting/`.
- Added a mandatory root `PLANS.md` workflow for non-trivial active work with dated completed history.
- Added a mandatory root `MEMORY.md` workflow for repeatable issues and durable fixes.
- Corrected the mandatory read order so the active build spec is always read before role docs.
- Set `turbopack.root` in Next.js config so build root inference stays pinned to the repo.
- Replaced the generic Next.js starter UI with the PSA Phase 1 shell foundation.
- Wired the shared FAB to open route-level capture dialogs and use temporary `local-user` ownership for local items until auth exists.
- Replaced the placeholder sync-status labels with labels derived from local pending/failed state, queue activity, and network state.
- Updated local capture to prefer the authenticated Supabase user id for new items while preserving signed-out local-only capture.
- Updated root metadata to advertise standalone PWA behavior with a black theme for installed use.
- Updated sync to pull remote rows into local IndexedDB on app load, reconnect, foreground return, and manual refresh.

### Fixed
- Adjusted the initial local-item hook load to satisfy the React hooks effect-state lint rule without changing the capture flow.
- Guarded deferred sync so missing Supabase env or missing auth leaves items pending instead of failing local capture.
- Prevented signed-out pending items from showing a misleading syncing state by surfacing a sign-in-required sync label instead.
- Constrained offline caching to the same-origin app shell so the service worker does not become the source of truth for data or sync behavior.
- Prevented older remote rows from overwriting newer unsynced local rows during multi-device reconciliation.

### Docs
- Aligned agent role documents with the current PSA capture build.
- Added repo workflow policy for maintaining `PLANS.md`.
- Added repo workflow policy for maintaining `MEMORY.md`.
- Aligned `AGENTS.md` and the build-spec entrypoint on precedence and read order.
- Added a public explainer document describing the agent template and how to reuse it in other projects.
- Replaced the future resilience umbrella spec with separate non-current build specs for export/backup and account recovery.
