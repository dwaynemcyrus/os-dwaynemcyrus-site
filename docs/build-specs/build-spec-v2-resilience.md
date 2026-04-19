# build-spec-v2-resilience

## Purpose

Define the next product step after `build-spec-v1-capture.md`.

This build is not current yet.

It exists to capture the next layer of product guarantees once the v1 PSA
capture surface is stable across devices:

- stronger multi-device visibility
- recovery and portability
- explicit resilience tooling

---

## Status

- planned
- not active
- do not implement by default while `docs/agents/build-spec.md` still points to
  `build-spec-v1-capture.md`

---

## Why This Is A Separate Build

The v1 build proves:

- local-first capture
- authenticated sync
- installable PWA shell

This v2 build adds product guarantees that are broader than “deferred sync
works”:

- near-instant multi-device awareness
- explicit user-controlled export backups
- restore and recovery planning
- stronger sync visibility and resilience semantics

Those are meaningful product-scope expansions, not just implementation cleanup.

---

## Included

- remote pull sync as a formal first-class behavior
- foreground refresh behavior
- manual sync refresh control
- optional realtime cross-device propagation
- export backup flow
- import or restore design
- explicit resilience and portability rules

---

## Excluded

- task-manager feature expansion
- projects, tags, filters, or processing workflows
- collaborative or multi-user features
- complex conflict resolution beyond a documented default policy

---

## Product Goals

- a signed-in device should not feel isolated from other signed-in devices
- the user should have a clear way to refresh sync state
- the user should be able to export their data outside Supabase
- the system should remain understandable even when offline-first behavior and
  remote reconciliation overlap

---

## Candidate Capabilities

### 1. Multi-device visibility

- pull remote rows on app load
- pull on reconnect
- pull on app foreground
- manual sync refresh action

### 2. Realtime propagation

- subscribe to remote changes while the app is open
- refresh local IndexedDB when remote change events arrive
- keep realtime optional and layered above the durable pull-sync baseline

### 3. Backup / export

- export user data to a durable portable format
- start with a JSON export of all items
- preserve enough metadata to support later restore design

### 4. Restore / import

- define import semantics explicitly before implementation
- define duplicate handling
- define last-write-wins or alternative merge policy clearly

---

## Sync Policy Direction

Default conflict policy:

- last-write-wins by timestamp

Rules:

- unsynced newer local rows must not be overwritten by older remote rows
- remote pull must enrich empty or stale local stores
- manual refresh must use the same guarded sync path as automatic refresh
- realtime must not bypass reconciliation rules

---

## Backup Direction

Minimum acceptable backup target:

- export all user-visible items
- include sync-relevant metadata needed for safe restore planning

Preferred first format:

- JSON

Future optional formats:

- line-delimited JSON
- CSV for human portability

---

## Risks

- realtime subscriptions can make the system feel magical but harder to reason about
- export without restore semantics creates false confidence
- pull, push, and realtime together can drift unless one reconciliation model is
  treated as canonical

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
