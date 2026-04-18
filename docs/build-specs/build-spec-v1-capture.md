# build-spec-v1-capture
### # build-spec-v1-capture (updated)

### ## Purpose

### Implement a **PWA-first capture system for iPhone Safari** that guarantees:

### *> a thought can be captured instantly, stored locally, and safely synced later — even with no network*

This version is deliberately constrained.

It is not a full app.  
It is not a task manager.  
It is not a GTD system.

It is:

### *> a***Personal System Anchor (PSA)** — a stable capture surface that never drops input.

---

## Core Principle

### *> Capture must succeed before sync succeeds.*

- Local write = success
- Remote sync = secondary
- UI must reflect this truth clearly

---

## Product Scope

### Included

- PWA installable app (iPhone Safari)
- FAB-triggered capture
- local-first storage (IndexedDB)
- deferred sync to Supabase
- offline capture + backlog access
- list view of captured items
- soft delete (trash only)
- sync state visibility

---

### Excluded

- processing wizard
- categorization workflows
- filtering/search
- editing flows (beyond minimal)
- projects / tags / grouping
- multi-user features

---

## Platform Target

### Primary
- iPhone 16
- iOS Safari
- Installed PWA (standalone mode)

---

## Tech Stack

- Framework: Next.js (App Router)
- Frontend: React (client-heavy)
- UI: Radix primitives only
- Styling: CSS Modules only
- Backend: Supabase (Postgres)
- Local storage: IndexedDB
- Hosting: Vercel

---

## Hard Constraints

### UI

- **text only** (no icons anywhere)
- **white text on black background**
- minimal visual hierarchy
- no decorative elements

---

### Styling

- CSS Modules only
- no Tailwind
- no inline styles
- no CSS-in-JS

---

### Layout

- App shell is **static**
- content scrolls internally
- viewport itself does not scroll

---

## Navigation Structure

### Routes

- `/` → Home (entry point)
- `/list` → Captured items list

---

## Home Screen

### Responsibilities

- primary entry point
- contains:
  - button → open list view
  - FAB → trigger capture input

---

### Behavior

- no item list shown here
- clean and minimal
- acts as launch surface

---

## List Screen

### Responsibilities

- display captured items
- show newest first
- display sync state
- allow trash action

---

### Layout

- scrollable content region
- static header
- FAB available here as well

---

## Capture Interaction

## 1. Trigger

Capture is triggered by:

### *> FAB at bottom center*

---

## 2. Behavior

On tap:

- input overlay or modal opens
- input is auto-focused
- user types
- submit saves locally instantly

---

## 3. Submission Flow

On submit:

1\. create local item (IndexedDB)
2\. mark `sync_state = pending_sync`
3\. close input
4\. item appears immediately in list
5\. background sync attempt starts

---

## 4. Input Rules

- plain text only
- multiline allowed
- trim outer whitespace
- reject empty input

---

## App Shell

## Requirements

- fixed, non-scrolling root container
- height locked to viewport
- internal content area scrolls

---

## Structure

- root container (fixed)
- header (static)
- content area (scrollable)
- FAB (fixed bottom center)

---

## iOS Considerations

- avoid `100vh`, use safe viewport units
- ensure FAB remains visible above keyboard
- input must remain usable when keyboard is open

---

## Data Model

## Supabase Schema

### Table: `items`

```sql
create extension if not exists pgcrypto;

create table public.items (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null,
  content text not null,

  type text not null default 'unknown',
  status text not null default 'backlog',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  device_created_at timestamptz,
  device_updated_at timestamptz,

  sync_state text not null default 'synced',
  last_synced_at timestamptz,

  is_trashed boolean not null default false,
  trashed_at timestamptz,

  constraint items_type_check check (
    type in ('unknown', 'task', 'idea', 'content', 'journal', 'reference', 'someday')
  ),

  constraint items_status_check check (
    status in ('backlog')
  ),

  constraint items_sync_state_check check (
    sync_state in ('pending_sync', 'synced', 'sync_error')
  )
);
### ⸻
# Indexes
### create index items_user_idx on public.items (user_id);
### create index items_created_idx on public.items (user_id, created_at desc);
### create index items_sync_idx on public.items (user_id, sync_state);
### create index items_trashed_idx on public.items (user_id, is_trashed);
### ⸻
# Updated-at Trigger
### create or replace function public.set_updated_at()
### returns trigger
### language plpgsql
### as $$
### begin
###   new.updated_at = now();
###   return new;
### end;
### $$;

### create trigger set_items_updated_at
### before update on public.items
### for each row
### execute function public.set_updated_at();
### ⸻
# Row Level Security
### alter table public.items enable row level security;
### create policy "select own"
### on public.items for select
### using (auth.uid() = user_id);

### create policy "insert own"
### on public.items for insert
### with check (auth.uid() = user_id);

### create policy "update own"
### on public.items for update
### using (auth.uid() = user_id)
### with check (auth.uid() = user_id);
### ⸻
# Local Data Model
### type LocalItem = {
###   id: string;
###   userId: string;
###   content: string;

###   type: 'unknown';
###   status: 'backlog';

###   createdAt: string;
###   updatedAt: string;

###   deviceCreatedAt: string;
###   deviceUpdatedAt: string;

###   syncState: 'pending_sync' | 'synced' | 'sync_error';
###   lastSyncedAt: string | null;

###   isTrashed: boolean;
###   trashedAt: string | null;

###   needsRemoteCreate: boolean;
###   needsRemoteUpdate: boolean;

###   syncErrorMessage: string | null;
### };
### ⸻
# Local Storage
### Use IndexedDB.
### Requirements
* persist all captures immediately
* support read on app launch
* support updates to sync state
* support trash flag updates

⠀ 
⸻
 
# Sync Model
# States
* pending_sync
* synced
* sync_error

⠀ 
⸻
 
# Flow
### On capture
* local insert
* mark pending_sync
* attempt remote insert

⠀ 
⸻
 
### On success
* set synced
* set lastSyncedAt

⠀ 
⸻
 
### On failure
* set sync_error
* retain item locally

⠀ 
⸻
 
# Retry Triggers
* app launch
* network reconnect
* app foreground

⠀ 
⸻
 
# Trash Behavior
# Rules
* no hard delete
* only soft delete

⠀ 
⸻
 
# Action
### On trash:
* set is_trashed = true
* set trashed_at
* mark pending_sync

⠀ 
⸻
 
# UI Behavior
* trashed items hidden from list by default
* no trash view in v1
* no restore UI yet

⠀ 
⸻
 
# PWA Requirements
# Manifest
* standalone display
* app icons
* theme color: black
* background color: black

⠀ 
⸻
 
# Service Worker
### Must
* cache app shell
* allow offline app load

⠀ 
⸻
 
### Must NOT
* handle data sync logic
* cache API data as source of truth

⠀ 
⸻
 
# Sync UI
### Item-level states
* pending
* synced
* failed

⠀ 
⸻
 
### App-level states
* offline
* syncing
* failed count

⠀ 
⸻
 
# Error Handling
### Local failure
* block UI
* do not pretend success

⠀ 
⸻
 
### Remote failure
* mark sync_error
* allow retry
* never remove item

⠀ 
⸻
 
# UI Components
### Required
* AppShell
* Header
* ContentContainer
* FAB (text label only)
* CaptureModal
* InputField
* SubmitButton
* ListView
* ListItem
* SyncIndicator

⠀ 
⸻
 
# Design Rules
* no icons
* no color variation beyond white on black
* no gradients
* no animation unless functional
* spacing must carry hierarchy

⠀ 
⸻
 
# Success Criteria
### 1. app installs as PWA
2. app opens without browser chrome
3. capture works offline
4. local items persist after reload
5. sync resumes automatically
6. items never disappear
7. UI remains stable under keyboard interaction
8. FAB always accessible
9. capture is immediate

⠀ 
⸻
 
# Failure Conditions
* lost capture
* blocked input due to network
* UI breaks under keyboard
* scroll leaks to viewport
* misleading sync state
* local/remote mismatch without visibility

⠀ 
⸻
 
# Build Order
### Phase 1
* app shell
* layout system
* routing
* CSS modules setup

⠀Phase 2
* IndexedDB layer
* capture modal
* FAB interaction
* local insert flow

⠀Phase 3
* list view
* item rendering
* trash logic

⠀Phase 4
* Supabase integration
* sync engine
* retry logic

⠀Phase 5
* service worker
* offline testing
* PWA install validation

⠀ 
⸻
 
# Final Definition
### This system is not a productivity app.
### It is:
### aPSA (Personal System Anchor) — a capture surface that guarantees input integrity regardless of network conditions
### If you want next step, I would strongly recommend we define the **exact component tree + file structure** for Next.js + Radix + CSS modules before you start coding. That’s where most people introduce chaos early.
