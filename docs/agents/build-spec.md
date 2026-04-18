# Build Spec Entry Point
# Location: docs/agents/build-spec.md

---

## Purpose

This file is the stable build-spec entrypoint referenced by `AGENTS.md`.

It does not hold every project build specification inline.
Instead, it points to the currently active build spec in `docs/build-specs/`
and defines how future build specs should be referenced as the project grows.

---

## Current Build

Current build: `docs/build-specs/build-spec-v1-capture.md`

This is the build spec to follow unless a newer build is explicitly marked as
current in this file.

---

## Build Spec Catalog

All build specs live in:

- `docs/build-specs/`

Rules:

- Add new build specs to `docs/build-specs/`
- Keep this file as the single stable pointer from `AGENTS.md`
- When a new build becomes active, update the `Current build` line here
- Do not move build specs back into `docs/agents/`
- Do not treat `docs/tmp/` as the long-term home for canonical build specs

---

## Current Supporting Documents

The active build currently depends on these supporting canonical documents:

- `docs/build-specs/supporting/component-tree-v1-capture.md`
- `docs/build-specs/supporting/file-responsibility-map-v1-capture.md`

If supporting docs later graduate into a more permanent home, update this file
to point at that location too.

The preferred structure is:

- a flat list of primary build specs in `docs/build-specs/`
- primary build spec filenames begin with `build-spec`
- shared supporting material lives in `docs/build-specs/supporting/`

---

## How To Read This With AGENTS.md

Required order:

1. `AGENTS.md`
2. this file
3. the active build spec named above
4. `MEMORY.md`
5. the relevant role document in `docs/agents/`

If the active build spec conflicts with generic agent guidance, use this order:

`AGENTS.md` → `docs/agents/build-spec.md` → active build spec → `MEMORY.md` → role docs

---

## Project-Level Constraints

These remain active regardless of which build spec is current:

- Build specs describe the product and implementation target for the repo
- Agent role docs in `docs/agents/` must align to the current build
- Any new build spec must be added intentionally and not silently replace the current one
- If a task depends on assumptions not declared in the current build spec, stop and ask

---

## Current Repo State

As of this revision:

- the repo is still documentation-first
- no `package.json` exists yet
- verification commands must be discovered after the app scaffold exists

Do not invent scripts or tooling contracts that are not present in the repo.
