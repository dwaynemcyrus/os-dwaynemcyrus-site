# Codex Agent Project Template

This document explains how the agent setup in this repository works, why each
file exists, and how you can reuse the same structure in another project.

It is written for developers first, but it should also be readable by someone
who is not deeply technical and just wants to understand how the system stays
organized.

---

## What This Setup Is Trying To Solve

Most AI-assisted coding setups break down for predictable reasons:

- the agent does not know which project rules matter most
- instructions are scattered across prompts and chat history
- the agent forgets repeat problems and reintroduces old mistakes
- plans disappear between sessions
- changes get made without any historical record

This template solves that by moving important project knowledge into files that
live inside the repository.

That gives both humans and agents a shared source of truth.

---

## The Core Idea

This setup separates project knowledge into a few distinct layers:

- `AGENTS.md`
  Defines the top-level operating rules for the agent.
- `docs/agents/build-spec.md`
  Acts as the stable entrypoint for the currently active build.
- `docs/build-specs/build-spec-*.md`
  Defines the actual product or implementation target for the current build.
- `docs/build-specs/supporting/*`
  Holds supporting canonical artifacts such as component trees or file maps.
- `MEMORY.md`
  Stores repeat problems, durable fixes, and repo-specific traps.
- `PLANS.md`
  Stores active and historical execution plans.
- `CHANGELOG.md`
  Stores commit-ready change history.
- `docs/agents/*.md`
  Holds role-specific guidance such as frontend, architecture, or planner docs.

Each file has one job.

That is important because the system becomes much harder to maintain when one
document tries to be instructions, design spec, working notes, and changelog
all at once.

---

## How The Read Order Works

The top-level workflow starts in `AGENTS.md`.

The required order is:

1. `AGENTS.md`
2. `docs/agents/build-spec.md`
3. the active build spec referenced there
4. `MEMORY.md`
5. the role-specific agent doc

This order matters because each layer answers a different question:

1. `AGENTS.md` answers: how should the agent behave in this repo?
2. `docs/agents/build-spec.md` answers: which build is currently active?
3. the active build spec answers: what are we actually building?
4. `MEMORY.md` answers: what should not be rediscovered the hard way?
5. the role docs answers: how should a specific kind of work be done?

That sequence gives the agent behavior first, target second, memory third, and
specialized execution guidance last.

---

## What Each File Is For

### `AGENTS.md`

This is the operating system for the agent.

It defines:

- how work should be planned
- when the agent should stop and ask
- verification expectations
- commit message rules
- changelog rules
- planning rules
- memory rules

If you want to change the default behavior of the agent in the repo, this is
the primary file to edit.

### `docs/agents/build-spec.md`

This is the stable pointer file.

It exists so `AGENTS.md` does not need to change every time the project moves to
a new build phase or a new product direction.

Instead of embedding the full active spec inline, it points to:

- the current build spec
- the current supporting docs

That makes build switching easier and keeps the top-level workflow stable.

### `docs/build-specs/build-spec-*.md`

These are the actual build definitions.

They describe what is being built right now.

A build spec should contain the practical information an implementation agent
needs, such as:

- product scope
- included and excluded features
- stack
- routes
- data model
- workflow rules
- sequencing
- constraints

The naming convention matters:

- primary build specs live in `docs/build-specs/`
- their filenames start with `build-spec`

That makes them easy for both humans and agents to scan.

### `docs/build-specs/supporting/`

This is where companion artifacts live.

Examples:

- component trees
- file responsibility maps
- architecture sketches
- phase breakdowns

These files support a build spec but are not themselves the main build spec.

Keeping them out of the main `docs/build-specs/` flat list avoids clutter while
still keeping them close to the canonical build documents.

### `MEMORY.md`

This is the working memory log for durable repo knowledge.

It is not a changelog and not a notebook.

It is for things like:

- environment traps
- recurring tool failures
- known architecture pitfalls
- UI layout rules that are easy to violate
- ordering constraints discovered through failure

The goal is simple:

if a future session is likely to make the same mistake again, record it.

### `PLANS.md`

This is the active planning record.

It tracks:

- what is being worked on now
- what is queued for later
- what was completed and when

It is useful for multi-step work, multi-file work, or multi-session work.

It should not be used like a changelog.
It should help someone return to the repo and answer:

- what was the plan?
- what stage is this in?
- what is next?

### `CHANGELOG.md`

This is the commit-ready history file.

It captures notable changes that are intended to be kept.

It is useful for:

- release notes later
- summarizing progress
- making repo history readable
- giving other developers a fast way to see what changed

It should be concise and high signal.

### `docs/agents/architecture.md`, `frontend.md`, `planner.md`

These are role-specific guides.

They are there to narrow the agent’s behavior once the general rules and active
build are already known.

This makes them much safer than putting all instructions into one giant file.

---

## How The Workflow Functions In Practice

### 1. Planning

The agent reads the required files first.

Then it decides:

- what the current build is
- what repo rules apply
- what known traps already exist
- which role guide is relevant

For non-trivial work, it updates `PLANS.md` before stopping after the plan.

### 2. Execution

Once a plan is approved, the agent works chunk by chunk.

During execution it should:

- keep the work scoped
- update `PLANS.md` as status changes
- update `CHANGELOG.md` for commit-ready changes
- update `MEMORY.md` if a repeatable issue or durable fix is discovered

### 3. Completion

When the work is done, the agent reports:

- what changed
- what files were touched
- what assumptions were made
- what still needs attention
- the status of `PLANS.md`, `CHANGELOG.md`, and `MEMORY.md`

That makes the workflow traceable across sessions.

---

## Why This Works Better Than A Single Instruction File

A single file usually becomes overloaded very quickly.

You end up mixing:

- agent behavior rules
- product requirements
- current task planning
- historical change notes
- future task memory

That creates drift and confusion.

This structure works because it separates concerns cleanly:

- rules live in `AGENTS.md`
- build targets live in build specs
- active work lives in `PLANS.md`
- durable lessons live in `MEMORY.md`
- shipped or commit-ready changes live in `CHANGELOG.md`

That separation is the main reason this setup remains usable as a project grows.

---

## What Is Mandatory Vs Optional

### Mandatory

- `AGENTS.md`
- `docs/agents/build-spec.md`
- at least one active `build-spec-*.md`
- `CHANGELOG.md`
- `PLANS.md`
- `MEMORY.md`

### Strongly recommended

- role-specific docs under `docs/agents/`
- supporting canonical docs under `docs/build-specs/supporting/`

### Optional

- additional role docs
- more detailed supporting docs
- extra workflow docs for a specific team

The key is to start small and only add files that have a distinct job.

---

## How To Reuse This In Another Project

If you want to use this setup as a template, copy the structure and replace the
project-specific content.

A good starting skeleton is:

```text
AGENTS.md
CHANGELOG.md
PLANS.md
MEMORY.md

docs/
  agents/
    build-spec.md
    architecture.md
    frontend.md
    planner.md
  build-specs/
    build-spec-v1.md
    supporting/
      component-tree-v1.md
      file-responsibility-map-v1.md
```

Then customize in this order:

1. write `AGENTS.md` workflow rules
2. define the build-spec entrypoint
3. write the first active build spec
4. add only the role docs you actually need
5. keep `MEMORY.md`, `PLANS.md`, and `CHANGELOG.md` small and active

---

## Design Principles Behind The Template

### Keep one file per concern

If a document is trying to do too many jobs, split it.

### Optimize for repeated use

The system should still make sense to a future human or agent who was not part
of the original conversation.

### Prefer explicit workflow over hidden assumptions

Agents perform better when the repo contains stable instructions instead of
relying on chat memory.

### Preserve useful history, not all history

That is why this template keeps:

- changelog history
- completed plans with dates
- durable memory entries

But avoids turning everything into an archive dump.

---

## When This Template Is Especially Useful

This structure is most useful when:

- the project will have multiple work sessions
- more than one person may use the repo
- an AI agent will work repeatedly over time
- you want cleaner project memory and fewer repeated mistakes
- the build target may evolve across phases

It is probably too much for a throwaway one-file experiment.

---

## Final Takeaway

This setup is not just a prompt system.

It is a repository-based operating model for AI-assisted development.

The important idea is not any one file.
The important idea is the separation between:

- instructions
- active build definition
- active planning
- durable memory
- historical changes

If you preserve that separation, you can adapt this template to many different
projects without losing clarity.
