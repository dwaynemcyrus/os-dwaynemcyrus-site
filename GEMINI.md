# GEMINI.md

## Project Overview
**PSA (Personal System Anchor)** is a local-first, offline-capable GTD (Getting Things Done) capture and processing application. It is designed for high-performance, immediate capture and reliable background synchronization with a remote backend.

### Core Technologies
- **Framework:** Next.js 15 (App Router) with React 19.
- **Language:** TypeScript (Strict mode).
- **Local Persistence:** IndexedDB (using the `idb` library).
- **Backend & Auth:** Supabase (PostgreSQL with RLS, GoTrue Auth).
- **Styling:** Vanilla CSS Modules with BEM naming conventions.

### Architecture
The project follows a strict layered architecture to ensure local-first resilience:
1.  **UI Layer (`app/`, `components/`):** React components and Next.js routes. They consume data exclusively through custom hooks.
2.  **Hooks Layer (`lib/hooks/`):** React hooks that interface with the logic and persistence layers.
3.  **Business Logic (`lib/items/`):** Defines item types, commands (mutations), queries (reads), and mappers (local ↔ remote translation).
4.  **Persistence Layer (`lib/db/`):** IndexedDB schema and repository (the sole interface for local reads/writes).
5.  **Sync Engine (`lib/sync/`):** Orchestrates background push/pull operations, handles retries, and manages the sync queue.
6.  **Auth Layer (`lib/supabase/`):** Manages Supabase client and user sessions.

## Building and Running
The following commands are defined in `package.json`:

- `npm run dev`: Starts the Next.js development server (using Turbopack).
- `npm run build`: Runs the production build (also acts as the primary type-checking gate).
- `npm run lint`: Executes ESLint for code quality checks.
- `npm run start`: Starts the production server.

**Verification Gates:** Before committing or declaring a task complete, you MUST run `npm run build && npm run lint`. There is currently no automated test suite; these commands are the primary verification gates.

## Development Conventions

### Mandatory Read Order
Before taking any action, you MUST read these documents in sequence:
1.  `AGENTS.md`: Behavioral rules and quality gates.
2.  `docs/agents/build-spec.md`: The pointer to the active build specification.
3.  **Active Build Spec**: (e.g., `docs/build-specs/build-spec-v5-...md`) as referenced in the above pointer.
4.  `MEMORY.md`: Repeatable problems and known repo-specific traps.

### Strict Constraints
- **Local-First:** Capture operations must never await remote sync. A local write to IndexedDB is considered success.
- **No Direct Access:** UI components and routes must never call Supabase or IndexedDB directly; they must use hooks.
- **Data Model:** `type = 'unknown'` signifies an unprocessed inbox item.
- **Deletions:** Use local tombstones (`needsRemoteDelete`) for hard deletes until the remote operation is confirmed.
- **Viewport:** The app shell must not scroll at the viewport level to maintain layout stability on mobile (iPhone Safari).

### File and Naming Conventions
- **Components:** PascalCase (e.g., `CaptureDialog.tsx`).
- **Styles:** CSS Modules with BEM (e.g., `.button--primary`).
- **Functions/Variables:** camelCase.
- **Constants:** UPPER_SNAKE_CASE.
- **Types:** PascalCase.

### Repository Maintenance
- **CHANGELOG.md:** Update the `Unreleased` section for every commit-ready change.
- **PLANS.md:** Maintain for any non-trivial active work (multi-step or multi-file).
- **MEMORY.md:** Update whenever a repeatable problem or durable fix is discovered.
- **Commits:** Use the format `type(scope): short description` (e.g., `feat(sync): add retry logic`).

## Key Files
- `lib/items/itemTypes.ts`: Core data models and item definitions.
- `lib/db/indexedDb.ts`: Local database schema.
- `lib/sync/syncEngine.ts`: Logic for remote synchronization.
- `lib/supabase/client.ts`: Supabase client configuration.
- `app/layout.tsx`: Root layout and global shell structure.
