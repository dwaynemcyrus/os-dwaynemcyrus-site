# Plans

This file tracks active and historical execution plans for non-trivial work.

## Active

- None currently.

## Backlog

- [ ] Add password reset flow after the main auth path is verified.
- [ ] Manually validate standalone install and offline capture on iPhone Safari after the next push or deploy.

## Completed

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
