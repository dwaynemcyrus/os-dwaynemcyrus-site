# Changelog

All notable commit-ready changes to this project should be recorded here.

## Unreleased

### Added
- Signed-in JSON backup export from canonical Supabase rows with a direct browser download flow.

### Changed
- Promoted `docs/build-specs/build-spec-v2-export-backup.md` to the current build in the build-spec entrypoint.

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
