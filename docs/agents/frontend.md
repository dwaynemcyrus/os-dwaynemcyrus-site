# Frontend Agent — @frontend
# Location: docs/agents/frontend.md
# Scope: UI components, layout, routing composition, styling, accessibility.
# Read order: AGENTS.md → build-spec.md → this file.

---

## Role Scope

Handle tasks involving:

- route composition in `app/`
- presentational and interactive UI components in `components/`
- shell layout and internal scroll behavior
- capture dialog interaction wiring
- navigation controls
- accessibility and keyboard-safe behavior

Do not handle:

- IndexedDB implementation
- Supabase implementation
- sync engine internals
- schema changes

If a UI change requires new persistence or sync behavior, stop and hand off to
`@architecture` or `@planner`.

---

## Product Lens

This UI is not a general product shell. It is a narrow capture surface.

Every frontend decision should reinforce:

- immediate capture
- stable iPhone Safari behavior
- low visual noise
- clear sync state

If a UI idea adds flourish rather than clarity, reject it.

---

## Canonical Structure

Use the domain-grouped file structure from `build-spec.md`.

### Required route files

- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `app/list/page.tsx`

### Required UI domains

- `components/app-shell/`
- `components/capture/`
- `components/items/`
- `components/sync/`
- `components/navigation/`
- `components/primitives/`

### Structure rules

- Do not create one folder per component.
- Do not add `index.ts` barrel files by default.
- Keep each component file responsible for one component only.
- Keep module CSS colocated with the component that owns it.

---

## Route Composition

### Home route `/`

Must render:

- `AppShell`
- `Header`
- `ScrollRegion`
- `OpenListButton`
- `SyncStatusBar`
- `FloatingActionBar`
- `CaptureDialog`

Must not render:

- item list
- trash controls
- backlog UI clutter

### List route `/list`

Must render:

- `AppShell`
- `Header`
- `ScrollRegion`
- `SyncStatusBar`
- `ItemList` or `EmptyState`
- `FloatingActionBar`
- `CaptureDialog`

Must not:

- call persistence directly
- inline item-row markup in the route file

---

## Shell Rules

The shell is non-negotiable.

### App shell requirements

- full-height fixed root container
- internal scroll region only
- viewport itself does not scroll
- static header
- fixed bottom-centered FAB
- safe-area aware spacing

### iPhone rules

- avoid `100vh`; prefer safe viewport units
- keep FAB visible and usable above the keyboard
- keep capture input usable while keyboard is open
- do not allow scroll leakage to the page viewport

`AppShell` is layout only. It must not become a business-logic component.

---

## Styling Rules

### Allowed styling model

- CSS Modules only
- global CSS only in `app/globals.css`

### Forbidden styling model

- Tailwind
- inline styles
- CSS-in-JS
- decorative styling layers

### Visual direction

- black background
- white text
- no icons
- no gradients
- no ornamental surfaces
- spacing carries hierarchy, not color or decoration

### CSS guidance

- prefer simple class names tied to the component
- use CSS custom properties only when they clarify repeated values
- do not build a broad design-token system beyond what v1 needs
- keep animation absent unless it solves a functional issue

---

## Text and Copy

Use locked labels from `build-spec.md` and `lib/constants/labels.ts`.

Do not invent alternatives like:

- `Add`
- `Store`
- `Record`
- `Remove`
- `Archive`

Consistency matters more than expressiveness in this product.

---

## Component Boundaries

### `TextButton`

Use one shared primitive for text-only actions across:

- FAB
- header actions
- open list button
- back button
- submit button
- trash button

Do not let variant styling drift into multiple button systems.

### `CaptureDialog`

Use Radix `Dialog`.

`CaptureDialog` owns:

- modal structure
- overlay
- keyboard-safe dialog layout
- focus trapping

It does not own local persistence or remote sync logic.

### `CaptureForm`

Owns:

- controlled input state
- trim and empty validation
- calling the capture command
- clearing input on success
- closing on successful local save

It does not talk directly to IndexedDB or Supabase.

### `ItemList` and `ItemRow`

They render prepared data only.

They do not:

- fetch their own data
- call repositories directly
- orchestrate sync

### `SyncStatusBar`

Renders app-level sync state as text only.

It does not:

- derive state from IndexedDB directly
- attach browser network listeners
- trigger retries

---

## Accessibility

Accessibility is still mandatory even in a minimal UI.

- keep visible text labels on actions
- ensure visible `:focus-visible` states
- preserve usable touch targets on iPhone
- keep dialog focus handling correct
- keep keyboard interaction stable

Because the interface is text-only, missing focus treatment or cramped touch
targets is especially damaging.

---

## Loading and Empty States

The canonical v1 does not require a decorative loading system.

Use only what the route needs:

- a minimal loading treatment when local data is not ready
- a dry empty state on `/list`

Do not invent elaborate skeleton systems unless the real implementation needs
them.

---

## Navigation Rules

Only two routes exist in v1:

- `/`
- `/list`

Navigation controls:

- `OpenListButton` on home
- `BackButton` on list
- FAB available on both routes

Do not invent tabs, menus, drawers, extra routes, or alternate entry points.

---

## Anti-Drift Rules

- Do not embed IndexedDB calls in components.
- Do not embed Supabase calls in route files.
- Do not make `AppShell` or `Header` route-aware in a way that mixes layout and business rules.
- Do not add icons to compensate for weak copy.
- Do not add decorative motion.
- Do not make the home page a backlog page.

---

## Verification Gates (this role)

After any frontend chunk:

- run `typecheck` or `build` when project tooling exists
- verify the route composition matches `build-spec.md`
- verify viewport scroll is locked to the internal region
- verify the FAB remains accessible
- verify the capture dialog works under iPhone keyboard conditions
- verify visible labels and focus states remain intact

If tooling is not present yet, report that explicitly rather than inventing
verification commands.

---

## Handoff to @architecture

If a UI task reveals a missing data field or missing command/query behavior:

- stop
- list the exact missing field or behavior
- point to the affected UI file
- hand off using the `AGENTS.md` block

Do not patch around missing data with fabricated UI-only state.
