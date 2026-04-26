"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import {
  processInboxItem,
  type ProcessingOutcome,
} from "@/lib/items/itemCommands";
import type { ItemSubtype, LocalItem } from "@/lib/items/itemTypes";
import styles from "./ProcessWizard.module.css";

type WizardStep =
  | "actionability"
  | "actionable"
  | "calendar-detail"
  | "clarify"
  | "consume-detail"
  | "non-actionable"
  | "project-detail"
  | "reference-detail"
  | "waiting-detail";

const PREVIOUS_STEP: Partial<Record<WizardStep, WizardStep>> = {
  actionability: "clarify",
  actionable: "actionability",
  "calendar-detail": "actionable",
  "consume-detail": "non-actionable",
  "non-actionable": "actionability",
  "project-detail": "actionable",
  "reference-detail": "non-actionable",
  "waiting-detail": "actionable",
};

type ProcessWizardProps = {
  errorMessage?: string;
  isLoading: boolean;
  item: LocalItem | null;
  onRetryLoad?: () => void;
};

export function ProcessWizard({
  errorMessage = "",
  isLoading,
  item,
  onRetryLoad,
}: ProcessWizardProps) {
  const [content, setContent] = useState(item?.content ?? "");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");
  const [step, setStep] = useState<WizardStep>("clarify");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [nextActionContent, setNextActionContent] = useState("");

  if (isLoading) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>Loading inbox…</p>
      </section>
    );
  }

  if (errorMessage && !item) {
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

  if (!item) {
    return (
      <section className={styles.wizard}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>Inbox clear. Nothing to process right now.</p>
      </section>
    );
  }

  async function handleDecision(outcome: Omit<ProcessingOutcome, "content" | "id">) {
    if (!item || isSubmitting) {
      return;
    }

    setSubmitErrorMessage("");
    setIsSubmitting(true);

    try {
      await processInboxItem({
        ...outcome,
        content,
        id: item.id,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not process the item.";
      setSubmitErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.wizard}>
      <div className={styles.wizard__copy}>
        <p className={styles.wizard__eyebrow}>{LABELS.processInbox}</p>
        <p className={styles.wizard__message}>
          Clarify what this item means, then decide where it belongs.
        </p>
      </div>

      <div className={styles.wizard__field}>
        <label className={styles.wizard__label} htmlFor="process-content">
          Clarify
        </label>
        <textarea
          className={styles.wizard__textarea}
          disabled={isSubmitting}
          id="process-content"
          onChange={(event) => setContent(event.target.value)}
          value={content}
        />
      </div>

      {/* Step: clarify */}
      {step === "clarify" ? (
        <div className={styles.wizard__actions}>
          <TextButton
            disabled={isSubmitting}
            onPress={() => setStep("actionability")}
          >
            {LABELS.continue}
          </TextButton>
        </div>
      ) : null}

      {/* Step: actionability */}
      {step === "actionability" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Is it actionable?</p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("actionable")}
            >
              Yes
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("non-actionable")}
              variant="secondary"
            >
              No
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: actionable */}
      {step === "actionable" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Choose the actionable outcome.</p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => void handleDecision({ decision: "trash" })}
            >
              {LABELS.doItNow}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => void handleDecision({ decision: "task" })}
              variant="secondary"
            >
              {LABELS.nextAction}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("waiting-detail")}
              variant="secondary"
            >
              {LABELS.waitingFor}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("calendar-detail")}
              variant="secondary"
            >
              {LABELS.schedule}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("project-detail")}
              variant="secondary"
            >
              {LABELS.project}
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: waiting-detail */}
      {step === "waiting-detail" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>
            Mark as Waiting For — someone else needs to act first.
          </p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => void handleDecision({ decision: "task", status: "waiting" })}
            >
              {LABELS.waitingFor}
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: calendar-detail */}
      {step === "calendar-detail" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Add a start or due date.</p>
          <div className={styles.wizard__field}>
            <label className={styles.wizard__label} htmlFor="process-start-at">
              Start date
            </label>
            <input
              className={styles.wizard__input}
              disabled={isSubmitting}
              id="process-start-at"
              onChange={(event) => setStartAt(event.target.value)}
              type="date"
              value={startAt}
            />
          </div>
          <div className={styles.wizard__field}>
            <label className={styles.wizard__label} htmlFor="process-end-at">
              Due date
            </label>
            <input
              className={styles.wizard__input}
              disabled={isSubmitting}
              id="process-end-at"
              onChange={(event) => setEndAt(event.target.value)}
              type="date"
              value={endAt}
            />
          </div>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() =>
                void handleDecision({
                  decision: "task",
                  endAt: endAt || null,
                  startAt: startAt || null,
                })
              }
            >
              {LABELS.schedule}
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: project-detail */}
      {step === "project-detail" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>
            What is the next physical action for this project?
          </p>
          <div className={styles.wizard__field}>
            <label className={styles.wizard__label} htmlFor="process-next-action">
              Next action (optional)
            </label>
            <textarea
              className={styles.wizard__textarea}
              disabled={isSubmitting}
              id="process-next-action"
              onChange={(event) => setNextActionContent(event.target.value)}
              placeholder="Leave blank to skip"
              value={nextActionContent}
            />
          </div>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() =>
                void handleDecision({
                  decision: "project",
                  nextActionContent,
                })
              }
            >
              {LABELS.project}
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: non-actionable */}
      {step === "non-actionable" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Choose the non-actionable outcome.</p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("reference-detail")}
            >
              {LABELS.reference}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => setStep("consume-detail")}
              variant="secondary"
            >
              {LABELS.consume}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => void handleDecision({ decision: "incubate" })}
              variant="secondary"
            >
              {LABELS.incubate}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => void handleDecision({ decision: "trash" })}
              variant="danger"
            >
              {LABELS.trash}
            </TextButton>
          </div>
        </div>
      ) : null}

      {/* Step: reference-detail */}
      {step === "reference-detail" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>What kind of reference is this?</p>
          <div className={styles.wizard__actions}>
            {(["note", "article", "book"] as ItemSubtype[]).map((sub) => (
              <TextButton
                disabled={isSubmitting}
                key={sub}
                onPress={() =>
                  void handleDecision({ decision: "reference", subtype: sub })
                }
                variant="secondary"
              >
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </TextButton>
            ))}
          </div>
        </div>
      ) : null}

      {/* Step: consume-detail */}
      {step === "consume-detail" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>What kind of item is this to consume?</p>
          <div className={styles.wizard__actions}>
            {(["article", "book", "video", "podcast"] as ItemSubtype[]).map((sub) => (
              <TextButton
                disabled={isSubmitting}
                key={sub}
                onPress={() =>
                  void handleDecision({ decision: "media", subtype: sub })
                }
                variant="secondary"
              >
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </TextButton>
            ))}
          </div>
        </div>
      ) : null}

      {/* Back button */}
      {step !== "clarify" ? (
        <div className={styles.wizard__actions}>
          <TextButton
            disabled={isSubmitting}
            onPress={() => setStep(PREVIOUS_STEP[step] ?? "clarify")}
            variant="ghost"
          >
            {LABELS.back}
          </TextButton>
        </div>
      ) : null}

      {/* Error states */}
      {errorMessage ? (
        <>
          <p className={styles.wizard__error}>{errorMessage}</p>
          {onRetryLoad ? (
            <div className={styles.wizard__actions}>
              <TextButton disabled={isSubmitting} onPress={onRetryLoad}>
                {LABELS.retry}
              </TextButton>
            </div>
          ) : null}
        </>
      ) : null}
      {submitErrorMessage ? (
        <p className={styles.wizard__error}>{submitErrorMessage}</p>
      ) : null}
    </section>
  );
}
