# build-spec-v2-account-recovery

## Purpose

Define the next recovery milestone after `build-spec-v1-capture.md`.

It exists to tighten the single-user password model for this app without
expanding into email-based recovery infrastructure or broader account settings.

---

## Status

- current
- active
- implementation should follow this file while
  `docs/agents/build-spec.md` points here

---

## Why This Is A Separate Build

The current build proves:

- password sign-up
- email-confirmed sign-in
- signed-in sync

This next build adds a different guarantee:

- the signed-in user can change their password safely
- locked-out recovery is defined explicitly as a manual admin action

That is an account-lifecycle feature, not sync or portability work.

---

## Included

- signed-in change-password flow
- double-entry password confirmation before submission
- clear success and failure messaging for password changes
- explicit documentation that locked-out recovery is manual through Supabase

---

## Excluded

- forgot-password email request flow
- reset-link completion flow
- broader account settings
- email-address change
- multi-factor authentication
- profile editing
- SMTP setup

---

## Product Goals

- the signed-in user can rotate their password without leaving the app
- the auth surface stays honest about what the app can and cannot recover on its own
- the flow stays compact and does not introduce a large account-management surface

---

## First Release Definition

The first release of this build should provide:

- a visible settings route
- a signed-in change-password form
- confirmation and error messaging for password update
- double-entry password confirmation

The first release should not include self-service forgot-password recovery.

---

## Recovery Direction

The recovery model should assume:

- Supabase Auth remains the source of truth for password updates
- the user is the only intended account holder for the app
- `/settings` is the visible account-management route
- password changes happen only while signed in
- true locked-out recovery is manual through the Supabase dashboard or admin API

---

## Rules

- password change must operate on the authenticated account system already in use
- messaging must not imply email recovery, export, or restore behavior
- signed-out users must not be shown a fake self-service recovery path
- broader account settings must remain out of scope

---

## Risks

- weak messaging can confuse signed-in password change with locked-out recovery
- leaving dead reset-email routes in the app would create false expectations
- blending password change and broader account settings can expand scope quickly

---

## Activation Rule

Do not treat this file as current until
`docs/agents/build-spec.md` is explicitly updated to point at it.
