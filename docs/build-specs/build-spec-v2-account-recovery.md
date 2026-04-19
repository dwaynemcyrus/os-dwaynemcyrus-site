# build-spec-v2-account-recovery

## Purpose

Define the next recovery milestone after `build-spec-v1-capture.md`.

This build is not current yet.

It exists to add a proper account-recovery path for the existing password-based
authentication model without expanding into broader account settings.

---

## Status

- planned
- not active
- do not implement by default while `docs/agents/build-spec.md` still points to
  `build-spec-v1-capture.md`

---

## Why This Is A Separate Build

The current build proves:

- password sign-up
- email-confirmed sign-in
- signed-in sync

This next build adds a different guarantee:

- the user can recover access if they forget their password

That is an account-lifecycle feature, not sync or portability work.

---

## Included

- forgot-password request flow
- reset-password completion flow
- clear recovery messaging for success and failure states
- Supabase-compatible redirect handling for password reset

---

## Excluded

- change-password while already signed in
- broader account settings
- email-address change
- multi-factor authentication
- profile editing

---

## Product Goals

- the user can recover account access without manual intervention
- the flow stays compact and does not introduce a large account-management surface
- reset behavior is explicit and understandable

---

## First Release Definition

The first release of this build should provide:

- a visible forgot-password entry point
- password reset email request flow
- reset-link completion flow
- confirmation and error messaging that matches Supabase Auth behavior

The first release should not include change-password settings for authenticated users.

---

## Recovery Direction

The recovery model should assume:

- Supabase Auth remains the source of truth for password recovery
- the app must honor the project’s site URL and redirect URL configuration
- the flow may involve one route or a compact embedded recovery surface, but it
  must be decision-complete before implementation

---

## Rules

- recovery must operate on the authenticated account system already in use
- recovery messaging must not imply account deletion, export, or restore behavior
- reset completion must be clearly separated from normal sign-in
- broader account settings must remain out of scope

---

## Risks

- redirect settings drift can silently break recovery emails
- weak messaging can confuse reset state with normal sign-in state
- blending reset and broader account settings can expand scope quickly

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
