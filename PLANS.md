# Plans

This file tracks active and historical execution plans for non-trivial work.

## Active

- None currently.

## Backlog
- None currently.

## Completed

### 2026-04-26 — Auth guard with returnTo for all protected routes
- Status: completed
- Summary: added `useAuthGuard` hook that redirects unauthenticated users to `/login?returnTo=<path>`; applied to all 9 protected routes; login page reads `returnTo` and redirects there after sign-in.

### 2026-04-26 — Dedicated /login route and auth loading gate
- Status: completed
- Summary: moved the sign-in form to a dedicated `/login` route with no app chrome; added a loading gate and client-side redirect to the home page so unauthenticated users never see app content or the FAB; simplified `AuthPanel` to signed-in display only.

### 2026-04-26 — V5 tasks and projects destination views
- Status: completed
- Summary: activated a new v5 build spec for split task/project destination views, made `/tasks` task-only, added `/projects`, promoted both destinations to the signed-in home screen, and removed task/project destination entry from Settings.

### 2026-04-26 — Processing wizard review and bug fixes
- Status: completed
- Summary: fixed back button navigation on destination views (tasks/notes/incubate) returning to `/settings` instead of `/`; fixed wizard back button to step back through the correct step sequence; removed the direct trash bypass from the inbox list view; moved hardcoded UI strings into LABELS.

### 2026-04-26 — Inbox processing wizard hardening
- Status: completed
- Summary: hardened `/process` with an explicit decision-submit lock, resilient inbox load/retry handling, and progress visibility that no longer contradicts blocking loading or error states.

### 2026-04-26 — Rapid capture toggle
- Status: completed
- Summary: added a session-scoped rapid capture toggle to the shared capture dialog so repeated captures can stay in the modal, clear the textarea, and refocus immediately after each local save.

### 2026-04-21 — Settings export and gated home nav
- Status: completed
- Summary: moved backup export from the home auth panel into `/settings`, added a dedicated home settings button, and restricted the signed-out home screen to auth-only UI.

### 2026-04-21 — Home trash navigation
- Status: completed
- Summary: moved the trash navigation entry from `/settings` to the home screen alongside the main inbox and process navigation.

### 2026-04-21 — V4 GTD processing wizard
- Status: completed
- Summary: added the type-driven inbox processing wizard, new `/process`, `/tasks`, `/notes`, and `/incubate` routes, migrated `someday` to `incubate`, and extended sync plus backup compatibility for the new processing model.

### 2026-04-18 — Documentation structure alignment
- Status: completed
- Summary: normalized build spec storage under `docs/build-specs/`, moved supporting docs to `docs/build-specs/supporting/`, and aligned agent docs to the active PSA capture build.

### 2026-04-18 — Repo workflow planning and changelog policy
- Status: completed
- Summary: added mandatory repo-root `CHANGELOG.md` and `PLANS.md` workflow policies to `AGENTS.md`, scaffolded both root files, and established dated completed-plan history.

### 2026-04-18 — Repo working memory policy
- Status: completed
- Summary: added mandatory repo-root `MEMORY.md` policy to `AGENTS.md`, inserted it into the required read order, and scaffolded a category-based memory log for repeatable issues and durable fixes.

### 2026-04-18 — Active build spec read-order fix
- Status: completed
- Summary: corrected the top-level read order and precedence so the active build spec is always read between the build-spec entrypoint and `MEMORY.md`, and aligned the entrypoint document to the same sequence.

### 2026-04-18 — Public explainer for the agent setup
- Status: completed
- Summary: added a public-facing explainer in `docs/codex-agent-project-template.md` describing how the agent setup works, what each file does, and how to reuse the structure as a template in other projects.

### 2026-04-18 — Initial PSA build kickoff
- Status: completed
- Summary: scaffolded the Next.js App Router app with npm, TypeScript, and ESLint; added the Phase 1 static shell, shared text button primitive, `/` and `/list` route skeletons; and verified the build and lint scripts pass.

### 2026-04-18 — Phase 2 local capture foundation
- Status: completed
- Summary: added the local-first capture flow with `idb` and Radix Dialog, wired the FAB-driven capture modal on both routes, persisted captured items to IndexedDB with temporary local ownership, rendered `/list` from local storage only, and verified `npm run build` plus `npm run lint`.

### 2026-04-18 — Phase 3 deferred sync foundation
- Status: completed
- Summary: added real Supabase client wiring with env scaffolding, created the canonical `public.items` SQL migration under `supabase/migrations/`, added local-to-remote mapping plus a guarded sync engine and queue, derived route-level sync status from local state, and verified `npm run build` plus `npm run lint`.

### 2026-04-18 — Phase 4 authenticated account flow
- Status: completed
- Summary: added the embedded home-screen email/password auth panel, added Supabase session hooks for sign up, sign in, and sign out with required email confirmation messaging, kept local capture available while signed out, preferred the authenticated user id for new captures, and verified `npm run build` plus `npm run lint`.

### 2026-04-18 — Phase 5 PWA hardening
- Status: completed
- Summary: added the installable manifest, generated minimal PSA icons, registered a native service worker, cached the offline app shell without moving data or sync logic into the service worker, and verified `npm run build`, `npm run lint`, plus local manifest and service-worker endpoint delivery.

### 2026-04-19 — Phase 6 multi-device sync completion
- Status: completed
- Summary: added remote pull-and-reconcile into IndexedDB with last-write-wins protection for newer unsynced local rows, triggered sync on launch, reconnect, foreground, and manual refresh, added a refresh control near sync status, and added a non-current future resilience build spec for the next roadmap step.

### 2026-04-19 — Future build-spec split for export and recovery
- Status: completed
- Summary: replaced the future resilience umbrella with two separate non-current build specs for export/backup and password-based account recovery, and removed realtime awareness from the planned roadmap.

### 2026-04-19 — V2 export/backup implementation
- Status: completed
- Summary: promoted `build-spec-v2-export-backup.md` to the current build, added a signed-in JSON backup export backed by canonical Supabase rows, exposed the action in the existing account panel, and verified `npm run build` plus `npm run lint`.

### 2026-04-19 — V2 account-recovery implementation
- Status: completed
- Summary: promoted `build-spec-v2-account-recovery.md` to the current build, added a forgot-password request flow on `/`, added `/settings` and `/settings/reset-password`, completed reset handling through Supabase recovery state, and verified `npm run build` plus `npm run lint`.

### 2026-04-20 — Single-user auth cleanup
- Status: completed
- Summary: removed the email-based reset flow, deleted `/settings/reset-password`, replaced it with a signed-in password change form on `/settings`, documented locked-out recovery as a manual Supabase action, and verified `npm run build` plus `npm run lint`.

### 2026-04-20 — Future import/restore build spec
- Status: completed
- Summary: added a non-current `build-spec-v3-import-restore.md` defining the next portability milestone around validated JSON import/restore and last-write-wins restoration by item id.

### 2026-04-20 — V3 import/restore activation
- Status: completed
- Summary: promoted `build-spec-v3-import-restore.md` to the current build and moved the prior account-recovery build into implemented-reference status.

### 2026-04-20 — V3 import/restore implementation
- Status: completed
- Summary: implemented validated PSA JSON restore on `/settings`, added explicit confirmation and result messaging, compared imported rows against both local and remote state, restored locally first, and queued newer imported rows for background sync.

### 2026-04-20 — Stale local Supabase session cleanup
- Status: completed
- Summary: detected invalid local refresh-token errors during browser session bootstrap, cleared the stale local Supabase session automatically, and verified the auth cleanup with `npm run build` plus `npm run lint`.

### 2026-04-20 — Remote deletion reconciliation
- Status: completed
- Summary: reconciled rows manually deleted from Supabase by mirroring them as local trash on explicit manual refresh only, while protecting unsynced local rows from accidental loss.

### 2026-04-20 — Trash route and hard delete
- Status: completed
- Summary: added a dedicated `/trash` route for trashed items, required confirmation before permanent delete, removed deleted items from local lists immediately, and synced the matching Supabase delete in the background.

### 2026-04-20 — Restore result clarity
- Status: completed
- Summary: clarified restore reporting so backup processing shows total backup entries plus matched, newer-local, newer-remote, reused-remote, and queued-for-sync counts instead of one opaque skipped total.

### 2026-04-20 — Restore result UI summary
- Status: completed
- Summary: replaced the dense restore-result sentence with a stat-style summary block in the restore panel so backup processing is easier to scan.

### 2026-04-20 — Settings trash section
- Status: completed
- Summary: moved the `Open Trash` control out of the password-change action group and into its own settings section on `/settings`.
