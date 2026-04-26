# build-spec-v5-task-project-destination-views

## Purpose

Define the next destination-view milestone after
`build-spec-v4-gtd-processing-wizard.md`.

This build keeps the simplified GTD processing model intact, but clarifies how
processed outcomes should be reviewed after they leave the inbox.

---

## Status

- implemented-reference
- superseded by `build-spec-v6-gtd-full-flow.md`

---

## Why This Is A Separate Build

The current app already proves:

- inbox capture stays local-first
- inbox processing routes items by `type`
- processed destinations exist for review

This next build changes the product contract for destination review:

- tasks should mean tasks only
- projects should have their own destination view
- both destinations should be reachable directly from the signed-in home screen

That is a user-facing milestone, not a minor cleanup inside the v4 spec.

---

## Included

- `/tasks` as a task-only destination for items with `type = 'task'`
- dedicated `/projects` destination for items with `type = 'project'`
- direct signed-in home navigation to both Tasks and Projects
- continued destination views for `/notes` and `/incubate`
- read-only review of processed items in these destination routes
- continued use of the shared capture dialog from destination routes

---

## Excluded

- project planning structure
- task completion state
- editing workflows from destination views
- filtering or search
- tags, priorities, due dates, or scheduling
- separate tables for tasks or projects
- changes to sync semantics, backup, restore, or auth

---

## Product Goals

- the user can review only true tasks on `/tasks`
- the user can review only true projects on `/projects`
- processed work destinations are faster to reach from the home screen
- the feature remains narrow and read-only

---

## Route Rules

- `/list` shows inbox only
- `/process` processes oldest inbox items first
- `/tasks` shows only `task`
- `/projects` shows only `project`
- `/notes` shows only `reference`
- `/incubate` shows only `incubate`
- `/trash` remains separate and unchanged as trash

Navigation rules:

- signed-in home shows direct entry points for Tasks and Projects
- `/tasks` and `/projects` return to `/` through the shared back button pattern
- Tasks and Projects are not routed through Settings in this build

---

## Data Rules

- use `type` as the sole processing result
- do not add GTD-specific state columns
- do not create separate note, task, or project tables
- preserve the existing `status` field unchanged
- destination views remain read-only presentations over existing local items

---

## UI Rules

- keep the existing text-only white-on-black destination-view pattern
- reuse the current `ItemList` and `EmptyState` composition model
- do not add cards, tabs, counts, or dashboard-style task summaries
- keep the shared capture dialog available from `/tasks` and `/projects`

---

## Risks

- keeping projects inside `/tasks` would blur the meaning of the task list
- promoting more destinations to home can create navigation clutter if the
  existing text-button pattern is not preserved
- adding project review must not drift into project-planning features

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
