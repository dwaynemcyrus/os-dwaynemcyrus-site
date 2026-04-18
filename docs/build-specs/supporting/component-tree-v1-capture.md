# component-tree-v1-capture
# Component Tree —
# build-spec-v1-capture
### This is the right next step. The component tree needs to stay narrow, or the build turns messy fast.
### The goal is not “clean React architecture” in the abstract. The goal is:
### a stable iPhone-first PSA with fast capture, local persistence, and deferred sync
### So the tree should reflect the product, not generic frontend habits.
###  
### ⸻
# 1\. Top-level structure
### app/
###   layout.tsx
###   page.tsx
###   list/
###     page.tsx

### components/
###   app-shell/
###     AppShell.tsx
###     AppShell.module.css
###     Header.tsx
###     Header.module.css
###     ScrollRegion.tsx
###     ScrollRegion.module.css
###     FloatingActionBar.tsx
###     FloatingActionBar.module.css

###   capture/
###     CaptureDialog.tsx
###     CaptureDialog.module.css
###     CaptureForm.tsx
###     CaptureForm.module.css
###     CaptureTextarea.tsx
###     CaptureTextarea.module.css
###     SubmitCaptureButton.tsx
###     SubmitCaptureButton.module.css

###   items/
###     ItemList.tsx
###     ItemList.module.css
###     ItemRow.tsx
###     ItemRow.module.css
###     ItemMeta.tsx
###     ItemMeta.module.css
###     TrashItemButton.tsx
###     TrashItemButton.module.css
###     EmptyState.tsx
###     EmptyState.module.css

###   sync/
###     SyncStatusBar.tsx
###     SyncStatusBar.module.css
###     SyncStatusText.tsx

###   navigation/
###     OpenListButton.tsx
###     OpenListButton.module.css
###     BackButton.tsx
###     BackButton.module.css

###   primitives/
###     TextButton.tsx
###     TextButton.module.css

### lib/
###   db/
###     indexedDb.ts
###     itemRepository.ts

###   sync/
###     syncEngine.ts
###     syncQueue.ts
###     networkState.ts

###   supabase/
###     client.ts

###   items/
###     itemTypes.ts
###     itemMappers.ts
###     itemQueries.ts
###     itemCommands.ts

###   hooks/
###     useItems.ts
###     useCaptureDialog.ts
###     useNetworkStatus.ts
###     useSyncStatus.ts
###     useRetrySync.ts

###   constants/
###     labels.ts
###     routes.ts

###   utils/
###     datetime.ts
###     ids.ts
###     guards.ts
### ⸻
# 2\. Route-level component tree
# /
# — Home
### HomePage
###   AppShell
###     Header
###     ScrollRegion
###       OpenListButton
###       SyncStatusBar
###     FloatingActionBar
###     CaptureDialog
### Why this is correct
### Home is not the list. Home is the launch surface.
### It should feel like:
* open app
* see system state
* either capture
* or go to list

⠀No clutter.
 
⸻
 
# /list
# — Captured Items
### ListPage
###   AppShell
###     Header
###     ScrollRegion
###       SyncStatusBar
###       ItemList
###         ItemRow
###           ItemMeta
###           TrashItemButton
###       EmptyState
###     FloatingActionBar
###     CaptureDialog
### Why this is correct
### List view is where backlog visibility lives. Capture still has to be available here, so the FAB stays global.
###  
### ⸻
# 3\. App shell components
### These components define the static-shell + internal-scroll rule.
# AppShell
### Responsible for:
* full-screen fixed layout
* safe area handling
* black background / white text baseline
* assembling header, scroll region, FAB, dialog slot

⠀Props
### type AppShellProps = {
###   title: string;
###   children: React.ReactNode;
###   fabLabel: string;
###   onFabPress: () => void;
###   headerLeft?: React.ReactNode;
###   headerRight?: React.ReactNode;
###   dialogSlot?: React.ReactNode;
### };
### ⸻
# Header
### Responsible for:
* page title
* optional left/right text actions
* fixed position within shell layout

⠀Rules
* static
* no icons
* no dense controls
* short labels only

⠀ 
⸻
 
# ScrollRegion
### Responsible for:
* internal scrolling only
* content padding
* preventing viewport scroll leakage

⠀This is important because your shell rule is non-negotiable.
 
⸻
 
# FloatingActionBar
### This is effectively your bottom-centered FAB, but text-only.
### Responsibilities
* fixed bottom center
* launch capture dialog
* remain accessible in both routes
* adapt safely above bottom inset

⠀Example label
* Capture

⠀Do not overcomplicate the name.
 
⸻
 
# 4\. Capture flow components
### This is the most important subtree in the whole app.
# CaptureDialog
### Use Radix Dialog primitive.
### Responsibilities
* modal open/close state
* overlay
* content container
* keyboard-safe positioning
* focus trapping

⠀Contains
### CaptureDialog
###   CaptureForm
###     CaptureTextarea
###     SubmitCaptureButton
### Props
### type CaptureDialogProps = {
###   open: boolean;
###   onOpenChange: (open: boolean) => void;
### };
### ⸻
# CaptureForm
### Responsible for:
* controlled input state
* validation
* submit handling
* calling local create command
* clearing input on success

⠀Props
### type CaptureFormProps = {
###   onSubmitted?: () => void;
### };
### Internal behavior
### On submit:
### 1. trim content
2. reject empty
3. create local item
4. trigger sync attempt
5. close dialog

⠀ 
⸻
 
# CaptureTextarea
### Responsible for:
* input field only
* autofocus
* multiline capture
* keyboard-safe usability

⠀Props
### type CaptureTextareaProps = {
###   value: string;
###   onChange: (value: string) => void;
### };
### ⸻
# SubmitCaptureButton
### Responsible for:
* explicit save action
* loading / disabled state during local write
* text-only label

⠀Label options
### Use one and stick to it:
* Save
* Capture

⠀My recommendation: Save inside dialog, Capture on FAB.
That gives clearer distinction:
* FAB = open action
* submit = commit action

⠀ 
⸻
 
# 5\. Item list components
# ItemList
### Responsible for:
* rendering non-trashed items
* newest-first ordering
* empty state fallback

⠀Props
### type ItemListProps = {
###   items: LocalItem[];
###   onTrash: (id: string) => void;
### };
### ⸻
# ItemRow
### Responsible for:
* item text
* item sync state
* item timestamps if needed later
* trash action

⠀Structure
### ItemRow
###   content block
###   ItemMeta
###   TrashItemButton
### Props
### type ItemRowProps = {
###   item: LocalItem;
###   onTrash: (id: string) => void;
### };
### ⸻
# ItemMeta
### Responsible for showing minimal secondary text.
### Suggested contents
* sync state text
* maybe created time later

⠀For v1, keep it light:
* pending
* synced
* failed

⠀That’s enough.
 
⸻
 
# TrashItemButton
### Responsible for:
* marking item as trashed locally
* triggering remote update sync
* no hard delete

⠀Label
### Trash
That is clearer than “Delete,” and matches your schema.
 
⸻
 
# EmptyState
### Responsible for:
* showing no-item state on /list

⠀Example copy
* No captured items yet.

⠀Do not make this cute. Keep it dry.
 
⸻
 
# 6\. Sync components
# SyncStatusBar
### Responsible for app-level sync visibility.
### Shown on:
* home
* list

⠀States it should handle
* offline
* syncing
* failed count
* all synced

⠀Example outputs
* Offline
* Syncing
* 1 failed
* All synced

⠀That is enough.
 
⸻
 
# SyncStatusText
### A tiny formatting component or helper component for consistent sync labels.
### This may feel unnecessary, but it prevents random wording drift.
###  
### ⸻
# 7\. Navigation components
# OpenListButton
### Home page button to open/list.
### Label
### Open Captured Items
or shorter:
### Open List
My recommendation: Open List Cleaner and more repeatable in a minimal UI.
 
⸻
 
# BackButton
### List page text button back to home.
### Label
### Back
No need to be clever.
 
⸻
 
# 8\. Shared primitive
# TextButton
### This matters because you want:
* no inline styles
* consistent visual language
* no icon/button drift

⠀Use one shared button primitive for:
* FAB
* header actions
* open list button
* trash button
* submit button

⠀Then apply variants through CSS module class names, not style props.
### Props
### type TextButtonProps = {
###   children: React.ReactNode;
###   onPress?: () => void;
###   type?: 'button' | 'submit';
###   disabled?: boolean;
###   variant?: 'primary' | 'secondary' | 'fab' | 'ghost' | 'danger';
### };
### ⸻
# 9\. State and hook structure
### Do not scatter data logic inside UI components.
### That creates chaos fast.
# useCaptureDialog
### Responsible for:
* open
* close
* toggle

⠀type UseCaptureDialogReturn = {
  open: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setOpen: (open: boolean) => void;
};
### ⸻
# useItems
### Responsible for:
* loading local items
* exposing visible list items
* refreshing after writes
* hiding trashed items

⠀type UseItemsReturn = {
  items: LocalItem[];
  isLoading: boolean;
  refreshItems: () => Promise<void>;
};
### ⸻
# useNetworkStatus
### Responsible for:
* online/offline browser state

⠀type UseNetworkStatusReturn = {
  isOnline: boolean;
};
### ⸻
# useSyncStatus
### Responsible for deriving app-level status from local item state.
### type UseSyncStatusReturn = {
###   label: 'Offline' | 'Syncing' | 'All synced' | `${number} failed`;
###   pendingCount: number;
###   failedCount: number;
### };
### ⸻
# useRetrySync
### Responsible for:
* retry on mount
* retry on reconnect
* retry on foreground

⠀This should be wired near route-level page components or shell level.
 
⸻
 
# 10\. Data layer structure
### This is where you avoid future pain.
# itemTypes.ts
### Contains shared TS types:
* LocalItem
* enums / unions for type, status, syncState

⠀ 
⸻
 
# itemRepository.ts
### Handles IndexedDB read/write logic.
### Functions:
### getAllItems()
### getVisibleItems()
### createItem()
### updateItem()
### markItemTrashed()
### getPendingSyncItems()
### getFailedSyncItems()
### setItemSynced()
### setItemSyncError()
### ⸻
# itemCommands.ts
### High-level commands used by UI:
### createCapturedItem(content: string)
### trashItem(id: string)
### retryFailedSync()
### This keeps UI components from talking directly to raw IndexedDB methods.
###  
### ⸻
# itemQueries.ts
### Derived read logic:
### getVisibleBacklogItems()
### getSyncCounts()
### ⸻
# itemMappers.ts
### Map between:
* local item record
* Supabase row format

⠀This is where field name translation stays contained.
 
⸻
 
# 11\. Sync engine structure
# syncEngine.ts
### Orchestrates remote syncing.
### Functions:
### syncPendingItems()
### syncItemById(id: string)
### Responsibilities
* pull pending/failed items from local store
* write to Supabase
* update local sync state
* never remove items on failure

⠀ 
⸻
 
# syncQueue.ts
### For v1, this should stay thin.
### You donot need a complex queue abstraction yet. This file should just control guarded sync execution.
Example responsibilities:
* prevent concurrent duplicate sync runs
* sequential processing
* optional debounce

⠀ 
⸻
 
# networkState.ts
### Light browser wrapper around:
* navigator.onLine
* online/offline events

⠀ 
⸻
 
# 12\. Recommended page composition
# app/page.tsx
### HomePage
###   useCaptureDialog()
###   useSyncStatus()

###   AppShell
###     Header
###     ScrollRegion
###       OpenListButton
###       SyncStatusBar
###     FloatingActionBar
###     CaptureDialog
### ⸻
# app/list/page.tsx
### ListPage
###   useCaptureDialog()
###   useItems()
###   useSyncStatus()
###   useRetrySync()

###   AppShell
###     Header
###     ScrollRegion
###       SyncStatusBar
###       ItemList
###     FloatingActionBar
###     CaptureDialog
### ⸻
# 13\. Label system
### You should lock labels early to avoid drift.
# Primary labels
* Capture
* Save
* Open List
* Back
* Trash

⠀Sync labels
* Offline
* Syncing
* All synced
* Failed

⠀Empty state
* No captured items yet.

⠀Do not invent synonyms later like:
* “Add”
* “Store”
* “Record”
* “Remove”
* “Archive”

⠀That inconsistency weakens muscle memory.
 
⸻
 
# 14\. Radix primitives to use
### Use Radix where it actually helps.
# Recommended
* Dialog for capture modal
* ScrollArea only if needed carefully, though native internal scroll may be cleaner
* VisuallyHidden if you need accessibility labels

⠀Not necessary yet
* Dropdown menus
* Popovers
* Tooltips
* Toasts
* Tabs

⠀Do not import half of Radix just because it exists.
 
⸻
 
# 15\. What not to do
### Avoid these mistakes now:
# 1\. Do not make
# AppShell
# smart
### It should handle layout, not business logic.
# 2\. Do not put sync logic in
# ItemRow
### Rows render state; they should not orchestrate network flows.
# 3\. Do not let
# CaptureDialog
# talk directly to Supabase
### It should call a command that writes local-first.
# 4\. Do not merge list state and sync state into one giant hook
### Keep reads and sync orchestration separate.
# 5\. Do not over-componentize typography
### This app is too small for a design-system fantasy.
###  
### ⸻
# 16\. Final recommended tree
### This is the trimmed version I would actually build:
### app/
###   layout.tsx
###   page.tsx
###   list/
###     page.tsx

### components/
###   app-shell/
###     AppShell.tsx
###     Header.tsx
###     ScrollRegion.tsx
###     FloatingActionBar.tsx

###   capture/
###     CaptureDialog.tsx
###     CaptureForm.tsx
###     CaptureTextarea.tsx
###     SubmitCaptureButton.tsx

###   items/
###     ItemList.tsx
###     ItemRow.tsx
###     ItemMeta.tsx
###     TrashItemButton.tsx
###     EmptyState.tsx

###   sync/
###     SyncStatusBar.tsx

###   navigation/
###     OpenListButton.tsx
###     BackButton.tsx

###   primitives/
###     TextButton.tsx

### lib/
###   db/
###     indexedDb.ts
###     itemRepository.ts

###   items/
###     itemTypes.ts
###     itemCommands.ts
###     itemQueries.ts
###     itemMappers.ts

###   sync/
###     syncEngine.ts
###     syncQueue.ts
###     networkState.ts

###   hooks/
###     useCaptureDialog.ts
###     useItems.ts
###     useNetworkStatus.ts
###     useSyncStatus.ts
###     useRetrySync.ts

###   supabase/
###     client.ts
### This is lean enough to move quickly and structured enough not to collapse.
### The next thing to lock down is theexact file-by-file responsibility map, because that determines whether AI-generated code stays coherent or turns into spaghetti.
