# Memory

This file records repeatable problems, durable fixes, and repo-specific traps so
future sessions do not need to rediscover them.

## Environment

- None currently.

## Tooling

- None currently.

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

- None currently beyond the architecture memory above.

## Deployment

- None currently.

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
