# Changelog

All notable commit-ready changes to this project should be recorded here.

## Unreleased

### Added
- Initial documentation structure for build specs and agent guidance.

### Changed
- Established `docs/agents/build-spec.md` as the stable entrypoint for the active build.
- Standardized build spec storage under `docs/build-specs/` with shared support docs in `docs/build-specs/supporting/`.
- Added a mandatory root `PLANS.md` workflow for non-trivial active work with dated completed history.
- Added a mandatory root `MEMORY.md` workflow for repeatable issues and durable fixes.
- Corrected the mandatory read order so the active build spec is always read before role docs.

### Fixed

### Docs
- Aligned agent role documents with the current PSA capture build.
- Added repo workflow policy for maintaining `PLANS.md`.
- Added repo workflow policy for maintaining `MEMORY.md`.
- Aligned `AGENTS.md` and the build-spec entrypoint on precedence and read order.
- Added a public explainer document describing the agent template and how to reuse it in other projects.
