# file-by-file-responsibility-map-v1-capture
````markdown
# File-by-File Responsibility Map — `build-spec-v1-capture`

This map defines the exact responsibility of each file in the v1 capture build.

The rule is simple:

> each file should have one clear job  
> no file should become a “miscellaneous logic dump”

---

# Root App Structure

```text
app/
  layout.tsx
  globals.css
  page.tsx
  list/
    page.tsx

components/
  app-shell/
    AppShell.tsx
    AppShell.module.css
    Header.tsx
    Header.module.css
    ScrollRegion.tsx
    ScrollRegion.module.css
    FloatingActionBar.tsx
    FloatingActionBar.module.css

  capture/
    CaptureDialog.tsx
    CaptureDialog.module.css
    CaptureForm.tsx
    CaptureForm.module.css
    CaptureTextarea.tsx
    CaptureTextarea.module.css
    SubmitCaptureButton.tsx
    SubmitCaptureButton.module.css

  items/
    ItemList.tsx
    ItemList.module.css
    ItemRow.tsx
    ItemRow.module.css
    ItemMeta.tsx
    ItemMeta.module.css
    TrashItemButton.tsx
    TrashItemButton.module.css
    EmptyState.tsx
    EmptyState.module.css

  sync/
    SyncStatusBar.tsx
    SyncStatusBar.module.css

  navigation/
    OpenListButton.tsx
    OpenListButton.module.css
    BackButton.tsx
    BackButton.module.css

  primitives/
    TextButton.tsx
    TextButton.module.css

lib/
  db/
    indexedDb.ts
    itemRepository.ts

  items/
    itemTypes.ts
    itemCommands.ts
    itemQueries.ts
    itemMappers.ts

  sync/
    syncEngine.ts
    syncQueue.ts
    networkState.ts

  hooks/
    useCaptureDialog.ts
    useItems.ts
    useNetworkStatus.ts
    useSyncStatus.ts
    useRetrySync.ts

  supabase/
    client.ts

  constants/
    labels.ts
    routes.ts

  utils/
    ids.ts
    datetime.ts
    guards.ts
````

---

# App Directory

## `app/layout.tsx`

### Responsibility

Defines the global application frame for the Next.js app.

### Must do

* render the root HTML/body structure
* import `globals.css`
* provide global metadata if needed
* define the app-wide black background / white text baseline
* avoid putting feature logic here

### Must not do

* fetch item data
* manage capture dialog state
* run sync logic
* contain route-specific UI

---

## `app/globals.css`

### Responsibility

Contains only true global CSS.

### Must do

* CSS reset / normalization
* root color tokens if any
* body/html overflow rules
* font smoothing / selection defaults
* base black background and white text
* enforce no viewport scroll if that is global

### Must not do

* style feature components directly
* contain page-specific rules
* replace CSS Modules

---

## `app/page.tsx`

### Responsibility

Implements the Home route.

### Must do

* assemble the home page tree
* wire `useCaptureDialog`
* wire `useSyncStatus`
* render `AppShell`
* pass in home-specific content:

  * `OpenListButton`
  * `SyncStatusBar`
  * `CaptureDialog`

### Must not do

* contain local DB logic
* contain Supabase calls
* render captured item list
* duplicate shell layout logic inline

---

## `app/list/page.tsx`

### Responsibility

Implements the List route.

### Must do

* assemble the list page tree
* wire `useCaptureDialog`
* wire `useItems`
* wire `useSyncStatus`
* wire `useRetrySync`
* render `ItemList` or `EmptyState`

### Must not do

* implement item row markup directly
* call IndexedDB directly
* call Supabase directly
* own trash business logic

---

# App Shell Components

## `components/app-shell/AppShell.tsx`

### Responsibility

Top-level layout wrapper for every route screen.

### Must do

* render the fixed full-height shell
* place:

  * header area
  * internal scroll region
  * bottom-centered FAB
  * optional dialog slot
* respect safe area layout
* keep layout composition clean

### Must not do

* own sync state logic
* own route logic
* own dialog open state
* contain route-specific copy

---

## `components/app-shell/AppShell.module.css`

### Responsibility

Styles only for `AppShell.tsx`.

### Must do

* define fixed shell layout
* define safe area spacing
* define bottom FAB positioning support

### Must not do

* style unrelated shell children deeply
* contain button variants for the whole app

---

## `components/app-shell/Header.tsx`

### Responsibility

Page header component.

### Must do

* render title
* optionally render left/right text actions
* stay visually stable and minimal

### Must not do

* decide navigation rules
* own page state
* import routing/business logic directly unless unavoidable

---

## `components/app-shell/Header.module.css`

### Responsibility

Header styles only.

### Must do

* handle spacing and border/divider if used
* preserve static header sizing

### Must not do

* style page content below it

---

## `components/app-shell/ScrollRegion.tsx`

### Responsibility

Internal scrolling container.

### Must do

* create the scrollable content area inside the fixed shell
* prevent viewport-level scroll usage
* provide consistent content padding

### Must not do

* contain business logic
* fetch data
* decide what is rendered inside

---

## `components/app-shell/ScrollRegion.module.css`

### Responsibility

Scroll container styles only.

### Must do

* configure internal overflow behavior
* handle iPhone-friendly scrolling

### Must not do

* style specific children like item rows or buttons

---

## `components/app-shell/FloatingActionBar.tsx`

### Responsibility

Bottom-centered text-only FAB.

### Must do

* render one clear action button
* expose an `onPress` handler
* stay fixed at the bottom center
* remain route-agnostic

### Must not do

* know how capture works internally
* own open state for dialog
* render multiple unrelated actions

---

## `components/app-shell/FloatingActionBar.module.css`

### Responsibility

Styles for the FAB container and button positioning.

### Must do

* lock bottom-center position
* respect safe area inset
* keep touch target large enough

### Must not do

* define general-purpose button styles used elsewhere

---

# Capture Components

## `components/capture/CaptureDialog.tsx`

### Responsibility

Capture modal wrapper using Radix Dialog primitives.

### Must do

* manage modal structure
* render overlay/content shell
* receive `open` and `onOpenChange`
* host `CaptureForm`

### Must not do

* talk directly to IndexedDB
* talk directly to Supabase
* embed capture command logic itself

---

## `components/capture/CaptureDialog.module.css`

### Responsibility

Dialog styling only.

### Must do

* style overlay
* style content surface
* support keyboard-safe positioning on iPhone

### Must not do

* style form internals that belong to child components

---

## `components/capture/CaptureForm.tsx`

### Responsibility

Own the capture form behavior.

### Must do

* control input state
* validate input
* call `createCapturedItem`
* close dialog after successful local save
* optionally trigger refresh flow if needed

### Must not do

* implement raw DB writes itself
* implement sync engine internals
* style textarea/button internals directly beyond composition

---

## `components/capture/CaptureForm.module.css`

### Responsibility

Styles for the form layout.

### Must do

* arrange textarea and submit button
* define form spacing

### Must not do

* duplicate dialog layout styles

---

## `components/capture/CaptureTextarea.tsx`

### Responsibility

Input field component only.

### Must do

* render text input or textarea
* autofocus when mounted/opened
* pass value changes upward
* keep API very small

### Must not do

* own submission logic
* own validation logic beyond trivial attributes

---

## `components/capture/CaptureTextarea.module.css`

### Responsibility

Styles only for the textarea.

### Must do

* define text appearance
* define sizing and resize behavior
* support black background / white text theme

### Must not do

* style parent form layout

---

## `components/capture/SubmitCaptureButton.tsx`

### Responsibility

Submit button for capture form.

### Must do

* render a text-only submit control
* accept disabled/loading state if needed

### Must not do

* perform submit logic itself
* know anything about DB or sync

---

## `components/capture/SubmitCaptureButton.module.css`

### Responsibility

Styles only for submit button specifics if not fully handled by `TextButton`.

### Must do

* stay thin
* only override what is unique to submit use

### Must not do

* become a second general button system

---

# Item Components

## `components/items/ItemList.tsx`

### Responsibility

Render the visible list of captured items.

### Must do

* accept already-prepared items
* render newest-first item rows
* handle empty array gracefully via composition or conditional rendering

### Must not do

* fetch items itself
* sort/filter business logic if that can live in queries/hooks
* implement trash mutation logic itself

---

## `components/items/ItemList.module.css`

### Responsibility

Styles only for the list container.

### Must do

* define vertical rhythm between rows

### Must not do

* style item row internals deeply

---

## `components/items/ItemRow.tsx`

### Responsibility

Render one captured item.

### Must do

* display content text
* display minimal meta info
* render trash action
* remain visually simple

### Must not do

* call repository directly
* own sync retry logic
* own trash persistence logic

---

## `components/items/ItemRow.module.css`

### Responsibility

Styles for one item row.

### Must do

* define spacing between content, meta, and action
* preserve readability for longer captured text

### Must not do

* style list container as a whole

---

## `components/items/ItemMeta.tsx`

### Responsibility

Render secondary item text.

### Must do

* show sync label like:

  * `pending`
  * `synced`
  * `failed`
* stay small and predictable

### Must not do

* become a formatting catch-all
* add unnecessary metadata in v1

---

## `components/items/ItemMeta.module.css`

### Responsibility

Styles for item meta only.

### Must do

* visually subordinate the meta text to item content

### Must not do

* introduce decorative complexity

---

## `components/items/TrashItemButton.tsx`

### Responsibility

Render the trash action for an item.

### Must do

* receive an `onPress` or `onTrash` callback
* render text label `Trash`

### Must not do

* call local DB directly
* know how trash sync works internally

---

## `components/items/TrashItemButton.module.css`

### Responsibility

Styles only for trash button specifics if needed.

### Must do

* stay minimal
* reuse shared button visual language where possible

### Must not do

* define global danger button patterns across the app

---

## `components/items/EmptyState.tsx`

### Responsibility

Render the empty list state.

### Must do

* show one dry, clear message
* remain presentational only

### Must not do

* include feature logic
* include navigation logic unless explicitly passed in

---

## `components/items/EmptyState.module.css`

### Responsibility

Empty state styling only.

### Must do

* center or place the message cleanly within the list view

### Must not do

* style shell layout

---

# Sync Components

## `components/sync/SyncStatusBar.tsx`

### Responsibility

Render the app-level sync state label.

### Must do

* display derived sync status from hook input
* remain simple text-only UI
* be reusable on home and list routes

### Must not do

* compute sync state internally from DB
* call network listeners
* trigger retries

---

## `components/sync/SyncStatusBar.module.css`

### Responsibility

Sync status bar styling only.

### Must do

* define quiet secondary visual treatment
* maintain readability

### Must not do

* take over layout responsibilities from shell/page

---

# Navigation Components

## `components/navigation/OpenListButton.tsx`

### Responsibility

Route user from home to list.

### Must do

* render text-only navigation action
* encapsulate the link/button UI

### Must not do

* contain home page layout logic

---

## `components/navigation/OpenListButton.module.css`

### Responsibility

Styles only for the open-list action if unique.

### Must do

* stay aligned with button system

### Must not do

* become a separate style language

---

## `components/navigation/BackButton.tsx`

### Responsibility

Route user from list back to home.

### Must do

* render one simple back action

### Must not do

* own header layout
* contain list feature logic

---

## `components/navigation/BackButton.module.css`

### Responsibility

Styles only for the back button if unique.

### Must do

* stay minimal and consistent

### Must not do

* drift from shared button system

---

# Primitive Components

## `components/primitives/TextButton.tsx`

### Responsibility

Single reusable text-button primitive.

### Must do

* provide one consistent button API
* support variants like:

  * primary
  * secondary
  * fab
  * ghost
  * danger
* support `button` and `submit`
* support disabled state

### Must not do

* contain routing logic
* contain DB logic
* become a giant design-system abstraction

---

## `components/primitives/TextButton.module.css`

### Responsibility

Core shared button styles.

### Must do

* define visual language for all text buttons
* define variant classes
* keep styles reusable and predictable

### Must not do

* include page-specific placement styles

---

# Database Layer

## `lib/db/indexedDb.ts`

### Responsibility

Initialize and expose the IndexedDB database connection.

### Must do

* define database name/version
* define object stores
* handle upgrade/migration for v1
* expose low-level DB access helpers

### Must not do

* contain business commands like “create captured item”
* contain remote sync logic

---

## `lib/db/itemRepository.ts`

### Responsibility

Single source for local item persistence operations.

### Must do

* implement CRUD-like local item methods needed by v1
* expose functions such as:

  * `getAllItems`
  * `getVisibleItems`
  * `createItem`
  * `updateItem`
  * `markItemTrashed`
  * `getPendingSyncItems`
  * `getFailedSyncItems`
  * `setItemSynced`
  * `setItemSyncError`

### Must not do

* contain React hooks
* contain component code
* contain route logic
* contain Supabase API calls

---

# Item Domain Layer

## `lib/items/itemTypes.ts`

### Responsibility

Define item-related TypeScript types and unions.

### Must do

* define `LocalItem`
* define `RemoteItemRow`
* define unions for:

  * `type`
  * `status`
  * `syncState`

### Must not do

* contain runtime business logic
* contain DB calls

---

## `lib/items/itemCommands.ts`

### Responsibility

Own high-level item mutation commands used by the UI.

### Must do

* expose business actions such as:

  * `createCapturedItem(content)`
  * `trashItem(id)`
  * `retryFailedSync()`
* call repository methods
* trigger sync scheduling/attempts where appropriate

### Must not do

* contain JSX
* become a dumping ground for all item code
* implement low-level IndexedDB access directly if repository already does it

---

## `lib/items/itemQueries.ts`

### Responsibility

Own read-oriented item query logic.

### Must do

* provide derived read helpers such as:

  * `getVisibleBacklogItems`
  * `getSyncCounts`
* centralize list filtering rules:

  * hide trashed items
  * newest-first

### Must not do

* mutate items
* call UI code
* duplicate repository methods unnecessarily

---

## `lib/items/itemMappers.ts`

### Responsibility

Map between local and remote item shapes.

### Must do

* convert `LocalItem` → Supabase row payload
* convert Supabase row → local item patch if needed
* isolate field naming differences:

  * `isTrashed` ↔ `is_trashed`
  * `lastSyncedAt` ↔ `last_synced_at`

### Must not do

* talk to IndexedDB directly
* talk to React components
* contain sync orchestration logic

---

# Sync Layer

## `lib/sync/syncEngine.ts`

### Responsibility

Own actual remote synchronization workflow.

### Must do

* read pending/failed items from repository
* send insert/update operations to Supabase
* update local sync state based on result
* process items sequentially or with guarded batching

### Must not do

* contain React hook code
* render UI
* own network event subscriptions directly if that belongs elsewhere

---

## `lib/sync/syncQueue.ts`

### Responsibility

Guard sync execution so it does not run chaotically.

### Must do

* prevent overlapping sync runs
* expose a controlled “run if idle” pattern
* optionally debounce repeated retry triggers

### Must not do

* know item schema details deeply
* know UI state
* become a full queue framework in v1

---

## `lib/sync/networkState.ts`

### Responsibility

Thin abstraction around browser online/offline state.

### Must do

* expose helpers for current network status
* expose listener setup helpers if useful

### Must not do

* contain React hook state directly if hooks layer handles that
* contain sync orchestration logic

---

# Hooks Layer

## `lib/hooks/useCaptureDialog.ts`

### Responsibility

Own capture dialog open/close state.

### Must do

* return:

  * `open`
  * `openDialog`
  * `closeDialog`
  * `setOpen`

### Must not do

* contain capture submit logic
* contain route logic
* call DB or sync functions

---

## `lib/hooks/useItems.ts`

### Responsibility

Expose item data to list route/components.

### Must do

* load visible items from local query layer
* manage loading state
* expose `refreshItems`

### Must not do

* define sync engine behavior
* define UI rendering
* bypass query layer for random ad hoc logic

---

## `lib/hooks/useNetworkStatus.ts`

### Responsibility

React hook for online/offline state.

### Must do

* subscribe to browser network events
* expose `isOnline`

### Must not do

* derive app sync text labels
* trigger sync itself unless explicitly chosen later

---

## `lib/hooks/useSyncStatus.ts`

### Responsibility

Derive app-level sync label from local item state and network state.

### Must do

* compute display values such as:

  * `Offline`
  * `Syncing`
  * `All synced`
  * `1 failed`
* keep wording centralized

### Must not do

* fetch remote data directly
* trigger writes
* become a second item list hook

---

## `lib/hooks/useRetrySync.ts`

### Responsibility

Wire sync retries to app lifecycle events.

### Must do

* trigger retry on:

  * mount
  * reconnect
  * foreground/resume
* call guarded sync queue/engine entry point

### Must not do

* own item display state
* contain raw Supabase write code

---

# Supabase Layer

## `lib/supabase/client.ts`

### Responsibility

Create and export the Supabase client.

### Must do

* initialize client from environment variables
* expose one configured client instance

### Must not do

* contain query/mutation logic for items
* contain auth flow UI
* contain sync orchestration

---

# Constants

## `lib/constants/labels.ts`

### Responsibility

Centralize fixed UI copy for repeated labels.

### Must do

* store stable labels such as:

  * `Capture`
  * `Save`
  * `Open List`
  * `Back`
  * `Trash`
  * `Offline`
  * `Syncing`
  * `All synced`
  * `Failed`

### Must not do

* store long page copy or content that belongs to components
* become a junk drawer for random constants

---

## `lib/constants/routes.ts`

### Responsibility

Centralize route strings.

### Must do

* define:

  * home route
  * list route

### Must not do

* include navigation logic
* include external URLs unless truly needed

---

# Utility Files

## `lib/utils/ids.ts`

### Responsibility

ID generation helpers.

### Must do

* create stable local UUIDs for new items if needed

### Must not do

* contain item creation workflow

---

## `lib/utils/datetime.ts`

### Responsibility

Date/time formatting and timestamp helpers.

### Must do

* create ISO timestamps
* optionally format display time later

### Must not do

* contain sync logic
* contain schema definitions

---

## `lib/utils/guards.ts`

### Responsibility

Simple shared validation helpers.

### Must do

* provide narrow helpers like:

  * empty string checks
  * maybe invariant helpers

### Must not do

* become a generic utilities dumping ground

---

# Responsibility Boundaries

## UI layer

Files in `components/` and `app/` should:

* render
* compose
* pass handlers
* remain thin

They should **not**:

* perform raw DB writes
* perform raw sync writes
* define schema mapping

---

## Hook layer

Files in `lib/hooks/` should:

* connect UI to domain/data layers
* manage React state and lifecycle

They should **not**:

* render markup
* become persistence layers

---

## Domain/data layer

Files in `lib/items/`, `lib/db/`, `lib/sync/`, `lib/supabase/` should:

* own actual business logic and persistence logic

They should **not**:

* depend on route markup
* depend on UI composition details

---

# Anti-Chaos Rules

## 1. No direct IndexedDB calls from components

All local persistence must go through `itemRepository` and command/query functions.

## 2. No direct Supabase calls from route files

All remote writes must go through `syncEngine`.

## 3. No duplicated label strings

Repeated UI words should come from `labels.ts`.

## 4. No mixed responsibilities

If a file both renders UI and manipulates DB state directly, it is already drifting.

## 5. No “utils.ts” junk drawer

Keep helpers separated by purpose.

---

# Implementation Order by File

## First

* `app/layout.tsx`
* `app/globals.css`
* `components/primitives/TextButton.tsx`
* `components/primitives/TextButton.module.css`
* `components/app-shell/*`

## Second

* `lib/items/itemTypes.ts`
* `lib/db/indexedDb.ts`
* `lib/db/itemRepository.ts`
* `lib/items/itemQueries.ts`

## Third

* `components/capture/*`
* `lib/items/itemCommands.ts`
* `lib/hooks/useCaptureDialog.ts`

## Fourth

* `components/items/*`
* `lib/hooks/useItems.ts`

## Fifth

* `lib/supabase/client.ts`
* `lib/items/itemMappers.ts`
* `lib/sync/syncEngine.ts`
* `lib/sync/syncQueue.ts`
* `lib/hooks/useNetworkStatus.ts`
* `lib/hooks/useSyncStatus.ts`
* `lib/hooks/useRetrySync.ts`

## Sixth

* `app/page.tsx`
* `app/list/page.tsx`
* `components/sync/SyncStatusBar.tsx`
* `components/navigation/*`

---

# Final Rule

If you are unsure where code belongs, decide by asking:

> is this rendering, state wiring, local persistence, domain behavior, or remote sync?

Then put it in the narrowest file that owns exactly that concern.

```
```
