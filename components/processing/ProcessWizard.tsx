"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { useLinkMetadata } from "@/lib/hooks/useLinkMetadata";
import { useTypeRegistry } from "@/lib/hooks/useTypeRegistry";
import { deriveItemPresentation } from "@/lib/items/itemPresentation";
import {
  processInboxItem,
  updateCaptureContent,
  type ProcessingOutcome,
} from "@/lib/items/itemCommands";
import type { LocalItem } from "@/lib/items/itemTypes";
import styles from "./ProcessWizard.module.css";

type WizardStep =
  | "commit"
  | "commit-kind"
  | "creation-date"
  | "creation-type"
  | "creation-wait"
  | "date"
  | "defer-kind"
  | "delegate"
  | "habit-date"
  | "keep"
  | "project"
  | "project-date"
  | "project-wait"
  | "reference-type"
  | "recurring"
  | "two-minute"
  | "waiting";

type ProcessWizardProps = {
  errorMessage?: string;
  isLoading: boolean;
  items: LocalItem[];
  onRetryLoad?: () => void;
};

type Draft = {
  creationType: string;
  delegatedTo: string;
  endAt: string;
  referenceType: string;
  startAt: string;
  waitingReason: string;
};

const EMPTY_DRAFT: Draft = {
  creationType: "",
  delegatedTo: "",
  endAt: "",
  referenceType: "",
  startAt: "",
  waitingReason: "",
};

function formatDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : null;
}

export function ProcessWizard({
  errorMessage = "",
  isLoading,
  items,
  onRetryLoad,
}: ProcessWizardProps) {
  const router = useRouter();
  const { entries } = useTypeRegistry();
  const [content, setContent] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [history, setHistory] = useState<WizardStep[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(() => new Set());
  const [step, setStep] = useState<WizardStep>("keep");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const currentItem = useMemo(
    () => items.find((item) => !skippedIds.has(item.id)) ?? null,
    [items, skippedIds],
  );
  const preview = deriveItemPresentation(content);
  const { title: enrichedPreviewTitle } = useLinkMetadata(preview.firstLineUrl);
  const previewTitle = enrichedPreviewTitle ?? preview.titleFallback;
  const referenceTypes = entries.filter((entry) => entry.kind === "reference");
  const creationTypes = entries.filter((entry) => entry.kind === "creation");

  useEffect(() => {
    let cancelled = false;

    async function resetWizardForItem() {
      await Promise.resolve();

      if (cancelled) {
        return;
      }

      setContent(currentItem?.content ?? "");
      setDraft(EMPTY_DRAFT);
      setHistory([]);
      setStep("keep");
      setSubmitErrorMessage("");
    }

    void resetWizardForItem();

    return () => {
      cancelled = true;
    };
  }, [currentItem?.id, currentItem?.content]);

  function go(nextStep: WizardStep) {
    setHistory((current) => [...current, step]);
    setStep(nextStep);
  }

  function goBack() {
    setHistory((current) => {
      const nextHistory = current.slice(0, -1);
      setStep(current.at(-1) ?? "keep");
      return nextHistory;
    });
  }

  function skipCurrentItem() {
    if (!currentItem) {
      return;
    }

    setSkippedIds((current) => new Set(current).add(currentItem.id));
  }

  async function saveContentIfChanged() {
    if (!currentItem || content === currentItem.content) {
      return;
    }

    await updateCaptureContent(currentItem.id, content);
  }

  async function finish(outcome: Omit<ProcessingOutcome, "content" | "id">) {
    if (!currentItem || isSubmitting) {
      return;
    }

    setSubmitErrorMessage("");
    setIsSubmitting(true);

    try {
      await processInboxItem({
        ...outcome,
        content,
        id: currentItem.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not process the item.";
      setSubmitErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>Loading inbox...</p>
      </section>
    );
  }

  if (errorMessage && !currentItem) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__error}>{errorMessage}</p>
        {onRetryLoad ? (
          <div className={styles.wizard__actions}>
            <TextButton onPress={onRetryLoad}>{LABELS.retry}</TextButton>
          </div>
        ) : null}
      </section>
    );
  }

  if (!currentItem && skippedIds.size > 0 && items.length > 0) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>All items skipped. Try again later.</p>
        <div className={styles.wizard__actions}>
          <TextButton onPress={() => setSkippedIds(new Set())}>Restart</TextButton>
          <TextButton onPress={() => router.push("/")} variant="secondary">
            Exit
          </TextButton>
        </div>
      </section>
    );
  }

  if (!currentItem) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>Inbox clear.</p>
        <p className={styles.wizard__message}>Nothing to process right now.</p>
        <div className={styles.wizard__actions}>
          <TextButton onPress={() => router.push("/")}>Close</TextButton>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wizard}>
      <div className={styles.wizard__topbar}>
        <TextButton disabled={history.length === 0 || isSubmitting} onPress={goBack}>
          {LABELS.back}
        </TextButton>
        <p className={styles.wizard__eyebrow}>
          {items.findIndex((item) => item.id === currentItem.id) + 1} of {items.length}
        </p>
        <TextButton onPress={() => router.push("/")} variant="secondary">
          Exit
        </TextButton>
      </div>

      <label className={styles.wizard__field}>
        <span className={styles.wizard__label}>Capture</span>
        <textarea
          className={styles.wizard__textarea}
          disabled={isSubmitting}
          onBlur={() => {
            void saveContentIfChanged();
          }}
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
      </label>

      {previewTitle ? (
        <div className={styles.wizard__preview}>
          <p className={styles.wizard__label}>{LABELS.previewTitle}</p>
          <p className={styles.wizard__previewTitle}>{previewTitle}</p>
        </div>
      ) : null}

      {step === "keep" ? (
        <Question title="Keep this?">
          <TextButton disabled={isSubmitting} onPress={() => go("commit")}>
            Yes
          </TextButton>
          <TextButton
            disabled={isSubmitting}
            onPress={() => void finish({ decision: "trash" })}
            variant="danger"
          >
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "commit" ? (
        <Question title="Commit now?">
          <TextButton disabled={isSubmitting} onPress={() => go("commit-kind")}>
            Yes
          </TextButton>
          <TextButton
            disabled={isSubmitting}
            onPress={() => go("defer-kind")}
            variant="secondary"
          >
            Not yet
          </TextButton>
        </Question>
      ) : null}

      {step === "commit-kind" ? (
        <Question title="What kind of item?">
          <TextButton disabled={isSubmitting} onPress={() => go("recurring")}>
            Action
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("creation-type")}>
            Creation
          </TextButton>
        </Question>
      ) : null}

      {step === "defer-kind" ? (
        <Question title="What kind of item?">
          <TextButton disabled={isSubmitting} onPress={() => go("reference-type")}>
            Reference
          </TextButton>
          <TextButton
            disabled={isSubmitting}
            onPress={() => void finish({ decision: "incubate" })}
            variant="secondary"
          >
            {LABELS.maybe}
          </TextButton>
        </Question>
      ) : null}

      {step === "recurring" ? (
        <Question title="Recurring?">
          <TextButton disabled={isSubmitting} onPress={() => go("habit-date")}>
            Yes
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("project")}>
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "project" ? (
        <Question title="Multi-step project?">
          <TextButton disabled={isSubmitting} onPress={() => go("project-wait")}>
            Yes
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("two-minute")}>
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "two-minute" ? (
        <Question title="Under 2 minutes?">
          <TextButton
            disabled={isSubmitting}
            onPress={() => void finish({ decision: "completed-task" })}
          >
            Done
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("delegate")}>
            Not done
          </TextButton>
        </Question>
      ) : null}

      {step === "delegate" ? (
        <Question title="Delegate?">
          <LabeledInput
            disabled={isSubmitting}
            label="Delegated to"
            onChange={(value) =>
              setDraft((current) => ({ ...current, delegatedTo: value }))
            }
            value={draft.delegatedTo}
          />
          <TextButton
            disabled={isSubmitting || draft.delegatedTo.trim().length === 0}
            onPress={() =>
              void finish({
                delegatedTo: draft.delegatedTo.trim(),
                decision: "delegated-task",
              })
            }
          >
            Yes
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("waiting")}>
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "waiting" ? (
        <Question title="Blocked / waiting?">
          <LabeledInput
            disabled={isSubmitting}
            label="Waiting reason"
            onChange={(value) =>
              setDraft((current) => ({ ...current, waitingReason: value }))
            }
            value={draft.waitingReason}
          />
          <TextButton
            disabled={isSubmitting || draft.waitingReason.trim().length === 0}
            onPress={() =>
              void finish({
                decision: "waiting-task",
                waitingReason: draft.waitingReason.trim(),
              })
            }
          >
            Yes
          </TextButton>
          <TextButton disabled={isSubmitting} onPress={() => go("date")}>
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "date" ? (
        <DateQuestion
          draft={draft}
          disabled={isSubmitting}
          onChange={setDraft}
          onNo={() => void finish({ decision: "task" })}
          onYes={() =>
            void finish({
              decision: "dated-task",
              endAt: formatDateInput(draft.endAt),
              startAt: formatDateInput(draft.startAt),
            })
          }
        />
      ) : null}

      {step === "habit-date" ? (
        <DateQuestion
          draft={draft}
          disabled={isSubmitting}
          onChange={setDraft}
          onNo={() => void finish({ decision: "habit" })}
          onYes={() =>
            void finish({
              decision: "habit",
              endAt: formatDateInput(draft.endAt),
              startAt: formatDateInput(draft.startAt),
            })
          }
        />
      ) : null}

      {step === "project-wait" ? (
        <Question title="Blocked / waiting?">
          <LabeledInput
            disabled={isSubmitting}
            label="Waiting reason"
            onChange={(value) =>
              setDraft((current) => ({ ...current, waitingReason: value }))
            }
            value={draft.waitingReason}
          />
          <TextButton
            disabled={isSubmitting || draft.waitingReason.trim().length === 0}
            onPress={() => go("project-date")}
          >
            Yes
          </TextButton>
          <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setDraft((current) => ({ ...current, waitingReason: "" }));
              go("project-date");
            }}
          >
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "project-date" ? (
        <DateQuestion
          draft={draft}
          disabled={isSubmitting}
          onChange={setDraft}
          onNo={() =>
            void finish({
              decision: "project",
              waitingReason: draft.waitingReason.trim() || null,
            })
          }
          onYes={() =>
            void finish({
              decision: "project",
              endAt: formatDateInput(draft.endAt),
              startAt: formatDateInput(draft.startAt),
              waitingReason: draft.waitingReason.trim() || null,
            })
          }
        />
      ) : null}

      {step === "reference-type" ? (
        <Question title="Pick reference type.">
          {referenceTypes.map((entry) => (
            <TextButton
              disabled={isSubmitting}
              key={entry.id}
              onPress={() =>
                void finish({ decision: "reference", type: entry.name })
              }
              variant="secondary"
            >
              {entry.name}
            </TextButton>
          ))}
        </Question>
      ) : null}

      {step === "creation-type" ? (
        <Question title="Pick creation type.">
          {creationTypes.map((entry) => (
            <TextButton
              disabled={isSubmitting}
              key={entry.id}
              onPress={() => {
                setDraft((current) => ({ ...current, creationType: entry.name }));
                go("creation-wait");
              }}
              variant="secondary"
            >
              {entry.name}
            </TextButton>
          ))}
        </Question>
      ) : null}

      {step === "creation-wait" ? (
        <Question title="Blocked / waiting?">
          <LabeledInput
            disabled={isSubmitting}
            label="Waiting reason"
            onChange={(value) =>
              setDraft((current) => ({ ...current, waitingReason: value }))
            }
            value={draft.waitingReason}
          />
          <TextButton
            disabled={isSubmitting || draft.waitingReason.trim().length === 0}
            onPress={() => go("creation-date")}
          >
            Yes
          </TextButton>
          <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setDraft((current) => ({ ...current, waitingReason: "" }));
              go("creation-date");
            }}
          >
            No
          </TextButton>
        </Question>
      ) : null}

      {step === "creation-date" ? (
        <DateQuestion
          draft={draft}
          disabled={isSubmitting}
          onChange={setDraft}
          onNo={() =>
            void finish({
              decision: "creation",
              type: draft.creationType,
              waitingReason: draft.waitingReason.trim() || null,
            })
          }
          onYes={() =>
            void finish({
              decision: "creation",
              endAt: formatDateInput(draft.endAt),
              startAt: formatDateInput(draft.startAt),
              type: draft.creationType,
              waitingReason: draft.waitingReason.trim() || null,
            })
          }
        />
      ) : null}

      <div className={styles.wizard__actions}>
        <TextButton disabled={isSubmitting} onPress={skipCurrentItem} variant="ghost">
          Skip
        </TextButton>
      </div>

      {submitErrorMessage ? (
        <p className={styles.wizard__error}>{submitErrorMessage}</p>
      ) : null}
    </section>
  );
}

function Question({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className={styles.wizard__branch}>
      <p className={styles.wizard__question}>{title}</p>
      <div className={styles.wizard__actions}>{children}</div>
    </div>
  );
}

function LabeledInput({
  disabled,
  label,
  onChange,
  value,
}: {
  disabled: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className={styles.wizard__field}>
      <span className={styles.wizard__label}>{label}</span>
      <input
        className={styles.wizard__input}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function DateQuestion({
  disabled,
  draft,
  onChange,
  onNo,
  onYes,
}: {
  disabled: boolean;
  draft: Draft;
  onChange: Dispatch<SetStateAction<Draft>>;
  onNo: () => void;
  onYes: () => void;
}) {
  const hasDate = draft.startAt.length > 0 || draft.endAt.length > 0;

  return (
    <Question title="Has a date?">
      <label className={styles.wizard__field}>
        <span className={styles.wizard__label}>Start date</span>
        <input
          className={styles.wizard__input}
          disabled={disabled}
          onChange={(event) =>
            onChange((current) => ({ ...current, startAt: event.target.value }))
          }
          type="date"
          value={draft.startAt}
        />
      </label>
      <label className={styles.wizard__field}>
        <span className={styles.wizard__label}>Due date</span>
        <input
          className={styles.wizard__input}
          disabled={disabled}
          onChange={(event) =>
            onChange((current) => ({ ...current, endAt: event.target.value }))
          }
          type="date"
          value={draft.endAt}
        />
      </label>
      <TextButton disabled={disabled || !hasDate} onPress={onYes}>
        Yes
      </TextButton>
      <TextButton disabled={disabled} onPress={onNo} variant="secondary">
        No
      </TextButton>
    </Question>
  );
}
