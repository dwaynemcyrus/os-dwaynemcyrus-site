# build-spec-v7-writing-workspace

## Purpose

Define the next milestone after `build-spec-v6-gtd-full-flow.md`.

This build adds a document-first writing workspace to the OS while keeping the
existing local-first item database as the source of truth.

---

## Status

- current
- active
- implementation should follow this file while
  `docs/agents/build-spec.md` points here

---

## Why This Is A Separate Build

The current app already proves:

- inbox capture is local-first
- processed items route into stable destination views
- processed items can already present title/body-like content

This next build changes the interaction model:

- processed items become openable as markdown documents
- writing gets a dedicated top-level workspace
- editable frontmatter introduces a new boundary between freeform document
  metadata and native OS routing fields

That is a new product layer, not a minor extension of the v6 GTD flow.

---

## Included

- dedicated `/writing` route showing a unified list of processed writable items
- dedicated `/writing/[itemId]` route for editing a single item as a markdown
  document
- direct home navigation to Writing
- entry into writing from processed destination views
- markdown body editing
- rendered read mode
- raw markdown-document editing through a top-right `More` menu
- exact frontmatter preservation
- arbitrary top-level frontmatter keys and values
- a reserved `os` frontmatter block for native routing metadata
- wiki-links that resolve to existing processed items only
- local-first save semantics over the existing item model
- backup, restore, and sync compatibility for preserved document frontmatter

---

## Excluded

- real `.md` files as a storage layer
- a separate documents table
- writing access for inbox `/list` items
- automatic creation of new documents from unresolved wiki-links
- backlinks, graph views, link suggestions, or document maps
- search, filtering, folders, collections, or tags UI
- auto-generated new app routes from custom frontmatter values
- dynamic home navigation based on user-created metadata

---

## Product Goals

- let the user treat processed items as real markdown documents
- let the user preserve and edit freeform frontmatter safely
- keep native GTD routing stable even when document metadata is more flexible
- make Writing a first-class workspace without replacing the current
  destination-based OS

---

## Route Rules

- `/writing` shows all processed, non-trashed items
- `/writing` sorts by `updatedAt DESC`
- `/writing/[itemId]` opens one processed item in the writing screen
- `/list` remains inbox only and is excluded from writing in this build
- existing native routes like `/tasks`, `/projects`, `/reference`, `/media`,
  `/waiting`, `/calendar`, and `/incubate` remain the canonical destination
  routes for built-in OS organization

Navigation rules:

- signed-in home adds `Open Writing`
- processed item rows can open into `/writing/[itemId]`
- the writing screen includes a path back to the item's original native route

---

## Data Model Rules

- the current item row remains canonical
- add one new nullable text field to items: `documentFrontmatter`
- do not add a `title` column
- do not create a document entity separate from items
- markdown is a serialized document view of an item, not a second storage
  system

---

## Document Contract

Each writable item serializes to one virtual markdown document:

```md
---
type: essay
status: draft
customKey: custom value
os:
  type: reference
  status: backlog
  subtype: note
  startAt:
  endAt:
---

Title line

Body text...
```

Rules:

- the markdown body is stored in the existing `content` field
- the first non-empty body line remains the canonical title
- the remaining body remains the item body content
- top-level frontmatter is freeform document metadata
- top-level unknown keys must save unchanged
- top-level values may be arbitrary valid YAML values
- frontmatter preservation must be exact when saving from raw markdown view
- exact preservation takes priority over canonical YAML normalization

---

## OS Metadata Rules

The reserved `os` frontmatter block is the only frontmatter section that affects
native app behavior.

Supported `os` keys:

- `os.type`
- `os.status`
- `os.subtype`
- `os.startAt`
- `os.endAt`

Rules:

- `os.*` maps to the existing constrained item fields
- `os.type` remains limited to the built-in native destinations
- `os.status` remains limited to built-in status values
- `os.subtype` remains limited to the existing subtype values
- `os.startAt` and `os.endAt` remain the native scheduling fields
- invalid `os.*` values block save with inline validation
- if the `os` block is missing, the editor seeds it from the current item state
- if the `os` block is malformed or deleted, raw markdown save is blocked until
  it becomes valid again

Top-level keys like `type`, `status`, or any other user metadata:

- are allowed
- are preserved
- do not alter native app routing

---

## Writing Workspace Behavior

### Writing Home

- show processed, non-trashed items only
- use derived title and lightweight native metadata for list presentation
- keep the surface text-first and consistent with the current OS shell
- do not add dashboard, folder, or graph UI in this build

### Writing Screen

- default mode: `Write`
- secondary mode: `Read`
- top-right `More` menu includes:
  - `Markdown View`
  - `Open Original Route`

Mode rules:

- `Write` edits markdown body only
- `Read` renders markdown plus wiki-links
- `Markdown View` edits the full raw document including frontmatter
- non-raw modes must not rewrite or normalize frontmatter text
- raw markdown saves must preserve exact frontmatter text and update native
  item fields from the `os` block

---

## Wiki-link Rules

- support `[[Wiki Links]]` in rendered read mode
- resolve only to existing processed items
- use normalized current item titles for matching
- unresolved links remain visible but non-navigable
- duplicate-title matches are treated as unresolved in this build
- no auto-create behavior in v1

---

## Data / Sync Rules

- writing saves remain local-first
- document edits write back into the existing item row
- `documentFrontmatter` must round-trip through IndexedDB, Supabase sync,
  backup export, and restore
- freeform document metadata must not be discarded by sync or restore
- native routing must continue to depend only on the existing item fields mapped
  from `os.*`

---

## Risks

- exact frontmatter preservation is harder than simple parse-and-reserialize
- allowing arbitrary top-level metadata while keeping fixed native routes
  requires a strict separation between document metadata and OS metadata
- duplicate titles weaken wiki-link resolution in a title-based linking model
- writing can sprawl into a full knowledge system unless the first build stays
  narrow

---

## Activation Rule

This file is current while `docs/agents/build-spec.md` points here.
