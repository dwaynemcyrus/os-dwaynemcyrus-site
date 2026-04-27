# build-spec-v6-gtd-full-flow

## Purpose

Complete the GTD inbox processing flow by adding all missing canonical branches
to the processing wizard, the data model fields that back them, and the
destination views for each new outcome type.

This build extends `build-spec-v5-task-project-destination-views.md`, which is
now implemented-reference status.

---

## Status

- current
- active
- implementation should follow this file while
  `docs/agents/build-spec.md` points here

---

## Why This Is A Separate Build

The v5 build proved:

- destination views exist for task and project types
- processed items route correctly from the inbox
- home navigation is structured around destination views

This build adds the branches and data that were deferred:

- the **2-minute rule** (do it now → processed out)
- **Waiting For** as a workflow status, not a type
- **Calendar** scheduling via `startAt`/`endAt` date fields
- **Consume** (read/watch later) as a distinct `media` type with subtypes
- **Reference** with subtypes (note, article, book) replacing the bare reference type
- **Project** with an optional next-action capture inline in the wizard
- destination views for reference, media, waiting, and calendar

---

## Data Model Changes

### New columns on `public.items`

| Column     | Type         | Nullable | Constraint                                              |
|------------|--------------|----------|---------------------------------------------------------|
| `subtype`  | `text`       | yes      | `null OR IN ('note','article','book','video','podcast')` |
| `start_at` | `timestamptz`| yes      | —                                                       |
| `end_at`   | `timestamptz`| yes      | —                                                       |

### Updated type constraint

Add `media` to the existing `items_type_check` constraint.

### New status constraint

Add `waiting` alongside `backlog` in a new `items_status_check` constraint.

---

## Type System (TypeScript)

```
ItemType = "content" | "idea" | "incubate" | "journal" | "media"
         | "project" | "reference" | "task" | "unknown"

ItemSubtype = "note" | "article" | "book" | "video" | "podcast"

ItemStatus = "backlog" | "waiting"

LocalItem gains: subtype, startAt, endAt
```

- `subtype` is only meaningful for `reference` and `media` types
- `startAt` / `endAt` can be set on any type without changing the type
- `status: "waiting"` can be set on any type without changing the type

---

## GTD Processing Wizard — Branch Tree

```
clarify
  └─ actionability
       ├─ actionable
       │    ├─ Do it now  (<2 min)      → trash (item processed out, done)
       │    ├─ Next Action              → type: task
       │    ├─ Waiting For              → waiting-detail
       │    │                                └─ type: task, status: waiting
       │    ├─ Schedule                 → calendar-detail
       │    │                                └─ type: task, startAt, endAt
       │    └─ Project                  → project-detail
       │                                     └─ type: project
       │                                        + optional new task (next action)
       └─ non-actionable
            ├─ Reference                → reference-detail
            │                                └─ type: reference, subtype: note/article/book
            ├─ Consume                  → consume-detail
            │                                └─ type: media, subtype: article/book/video/podcast
            ├─ Incubate                 → type: incubate
            └─ Trash                    → isTrashed: true
```

### Back navigation

Each detail step has a Back button that returns to its parent branch step:

- `waiting-detail` → `actionable`
- `calendar-detail` → `actionable`
- `project-detail` → `actionable`
- `reference-detail` → `non-actionable`
- `consume-detail` → `non-actionable`
- `actionable` → `actionability`
- `non-actionable` → `actionability`
- `actionability` → `clarify`

---

## Destination Views

| Route        | Shows                                           | Empty label            |
|--------------|-------------------------------------------------|------------------------|
| `/reference` | items where `type = 'reference'`                | "No reference items."  |
| `/media`     | items where `type = 'media'`                    | "No consume items."    |
| `/waiting`   | items where `status = 'waiting'`                | "No waiting items."    |
| `/calendar`  | items where `start_at IS NOT NULL OR end_at IS NOT NULL`, sorted by earliest date | "No scheduled items." |

The existing `/notes` route redirects to `/reference`.

All new routes are protected by `AuthGate` and follow the same structure as
the existing `/tasks` and `/projects` routes.

---

## Destination Item Presentation

- processed destination routes derive a display title from the first non-empty
  line of `content`
- remaining lines render as body/details below that title
- if the first line is a public URL, the UI may replace the raw URL title with
  fetched page metadata for display
- URL-title fallback order is metadata title → hostname/path label → raw URL
- this is display-only enrichment; stored `content` remains unchanged
- inbox `/list` remains raw capture text rather than title/body presentation

---

## Home Navigation

Add four new nav buttons to the home screen:
- Open Reference → `/reference`
- Open Consume → `/media`
- Open Waiting → `/waiting`
- Open Calendar → `/calendar`

Replace the `OpenNotesButton` with `OpenReferenceButton`.

---

## Processing Command Contract

`processInboxItem` now accepts a `ProcessingOutcome` object:

```typescript
type ProcessingOutcome = {
  content: string;
  decision: "trash" | "incubate" | "task" | "project" | "reference" | "media";
  endAt?: string | null;
  id: string;
  nextActionContent?: string; // project only: creates a second task item
  startAt?: string | null;
  status?: ItemStatus;        // task only: "waiting"
  subtype?: ItemSubtype | null; // reference and media only
};
```

The `project` decision with a non-empty `nextActionContent` creates an
additional `task` item in the same atomic local write, then triggers a single
sync queue flush.

---

## Out of Scope for This Build

- Subtype filtering tabs within destination views (e.g. Notes / Articles / Books
  within `/reference`). Views show all items of the type; filtering is deferred.
- Full calendar UI (e.g. month grid). The `/calendar` route is a flat list
  sorted by date.
- Editing `startAt`/`endAt` or `subtype` after processing. Fields are set at
  processing time only.
- Realtime sync or push notifications for Waiting items.
