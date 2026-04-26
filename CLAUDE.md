# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Mandatory Read Order

Before any action, read these documents in sequence:

1. `AGENTS.md` — behavioral rules, workflow, quality gates
2. `docs/agents/build-spec.md` — stable pointer to the active build spec
3. The active build spec referenced there (currently `docs/build-specs/build-spec-v4-gtd-processing-wizard.md`)
4. `MEMORY.md` — repeat problems, durable fixes, repo-specific traps
5. The relevant role sub-doc in `docs/agents/` for your task

In any conflict: **AGENTS.md > build-spec.md > active build spec > MEMORY.md > role docs**

---

## Commands

```bash
npm run dev      # Next.js dev server (Turbopack)
npm run build    # Production build (also serves as typecheck)
npm run lint     # ESLint
npm run start    # Production server
```

No test suite exists yet — `npm run build && npm run lint` are the verification gates.

---

## Architecture

**Personal System Anchor (PSA)** — a local-first, offline-capable GTD capture and processing app. Next.js 15 App Router, TypeScript strict, React 19, IndexedDB for local persistence, Supabase for remote sync and auth.

### Layered architecture

| Layer | Location | Responsibility |
|---|---|---|
| Routes | `app/` | 8 routes: `/`, `/process`, `/list`, `/tasks`, `/notes`, `/incubate`, `/trash`, `/settings` |
| Components | `components/` | React UI, organized by feature (capture, processing, settings, sync, items, navigation, auth) |
| Business logic | `lib/items/` | Item types, commands (mutations), queries (reads), mappers (local ↔ remote translation) |
| Persistence | `lib/db/` | IndexedDB schema and item repository (sole interface for local reads/writes) |
| Sync engine | `lib/sync/` | Background push/pull, queue guard, retry orchestration |
| Auth | `lib/supabase/` | Supabase client, session management, env config |
| Hooks | `lib/hooks/` | React hooks wrapping the above layers for UI consumption |

### Data flow

1. User input → IndexedDB immediately (local write = success)
2. Background sync pushes `pending_sync` items to Supabase
3. On load, reconnect, foreground, or manual refresh → pull remote rows back into IndexedDB
4. UI reads exclusively from local IndexedDB via hooks

### Local vs. remote model

- Local items use `camelCase` with sync bookkeeping fields (`needsRemoteCreate`, `needsRemoteUpdate`, `needsRemoteDelete`, `syncState`, `syncErrorMessage`)
- Remote rows use `snake_case`
- Translation lives in `lib/items/itemMappers.ts` — do not put mapping logic elsewhere

### Item type model

`type` encodes both GTD destination and processing state:
- `unknown` = inbox (unprocessed) — do not introduce a parallel processing field
- `task`, `project` = GTD actions
- `incubate` = someday/maybe (legacy `someday` normalizes to this)
- `note`, `content`, `journal`, `idea`, `reference` = reference/capture

### Hard constraints (do not violate)

- Local capture must never await remote sync
- No direct Supabase calls from route files
- No direct IndexedDB access from components — use hooks
- No sync logic inside UI components
- No hard delete without a local tombstone until remote delete succeeds
- Soft delete only via trash; permanent delete preserves tombstone until Supabase confirms
- Remote deletions reconcile only on explicit manual refresh, never background sync
- App shell must not scroll at the viewport level (breaks iPhone Safari layout)
- Backup exports must read from Supabase, not local IndexedDB
- Restore must compare against remote freshness before queueing sync

### Naming conventions

- Component files: PascalCase (`Button.tsx`, `Button.module.css`)
- CSS: BEM in modules (`.button`, `.button--primary`, `.button__icon`)
- Functions: camelCase (`handleSubmit`, `fetchItems`)
- Constants: `UPPER_SNAKE_CASE`
- Types: PascalCase (`LocalItem`, `SyncStatus`)

### Commit message format

```
type(scope): short description
```

≤48 characters, lowercase. Types: `feat`, `fix`, `refactor`, `style`, `test`, `chore`, `docs`.

---

## Repo maintenance files

- `CHANGELOG.md` — update the `Unreleased` section for every commit-ready change
- `PLANS.md` — maintain for any multi-step, multi-file, or multi-session work
- `MEMORY.md` — update when a repeatable problem or durable fix is discovered

---

## Environment

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

When testing auth flows, Supabase Auth dashboard must have the app origin in Site URL and allowed Redirect URLs (including `/settings/reset-password`).
