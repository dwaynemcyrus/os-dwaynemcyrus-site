# Plans

This file tracks active and historical execution plans for non-trivial work.

## Active

- None currently.

## Backlog

- [ ] Add app scaffold and package tooling before enabling automated verification commands.

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
