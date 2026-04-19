# build-spec-v2-resilience

## Status

- retired as an umbrella spec
- not current
- do not implement directly

---

## Purpose

This file remains only as a redirect note for earlier planning references.

The future resilience work is now split into two separate planned build specs:

- `docs/build-specs/build-spec-v2-export-backup.md`
- `docs/build-specs/build-spec-v2-account-recovery.md`

This split keeps the future roadmap decision-complete and prevents unrelated
recovery and portability work from being bundled into one ambiguous milestone.

---

## Replacement Rule

If a plan, issue, or backlog note still references `build-spec-v2-resilience`,
replace that reference with one of:

- `build-spec-v2-export-backup` for data portability and user-controlled backup
- `build-spec-v2-account-recovery` for password reset and account recovery

Realtime awareness is no longer part of the planned roadmap.

---

## Activation Rule

Do not treat this file as active. Future work should reference one of the
replacement build specs instead.
