"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import {
  processInboxItem,
  type ProcessingDecision,
} from "@/lib/items/itemCommands";
import type { LocalItem } from "@/lib/items/itemTypes";
import styles from "./ProcessWizard.module.css";

type WizardStep = "actionability" | "clarify" | "actionable" | "non-actionable";

const PREVIOUS_STEP: Partial<Record<WizardStep, WizardStep>> = {
  actionability: "clarify",
  actionable: "actionability",
  "non-actionable": "actionability",
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
            <TextButton
              onPress={onRetryLoad}
            >
              {LABELS.retry}
            </TextButton>
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

  async function handleDecision(decision: ProcessingDecision) {
    if (!item || isSubmitting) {
      return;
    }

    setSubmitErrorMessage("");
    setIsSubmitting(true);

    try {
      await processInboxItem({
        content,
        decision,
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
      {step === "clarify" ? (
        <div className={styles.wizard__actions}>
          <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setStep("actionability");
            }}
          >
            {LABELS.continue}
          </TextButton>
        </div>
      ) : null}
      {step === "actionability" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Is it actionable?</p>
          <div className={styles.wizard__actions}>
            <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setStep("actionable");
              }}
            >
              Yes
            </TextButton>
            <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setStep("non-actionable");
              }}
              variant="secondary"
            >
              No
            </TextButton>
          </div>
        </div>
      ) : null}
      {step === "actionable" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Choose the actionable outcome.</p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => {
                void handleDecision("task");
              }}
            >
              {LABELS.nextAction}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => {
                void handleDecision("project");
              }}
              variant="secondary"
            >
              {LABELS.project}
            </TextButton>
          </div>
        </div>
      ) : null}
      {step === "non-actionable" ? (
        <div className={styles.wizard__branch}>
          <p className={styles.wizard__question}>Choose the non-actionable outcome.</p>
          <div className={styles.wizard__actions}>
            <TextButton
              disabled={isSubmitting}
              onPress={() => {
                void handleDecision("reference");
              }}
            >
              {LABELS.notes}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => {
                void handleDecision("incubate");
              }}
              variant="secondary"
            >
              {LABELS.incubate}
            </TextButton>
            <TextButton
              disabled={isSubmitting}
              onPress={() => {
                void handleDecision("trash");
              }}
              variant="danger"
            >
              {LABELS.trash}
            </TextButton>
          </div>
        </div>
      ) : null}
      {step !== "clarify" ? (
        <div className={styles.wizard__actions}>
          <TextButton
            disabled={isSubmitting}
            onPress={() => {
              setStep(PREVIOUS_STEP[step] ?? "clarify");
            }}
            variant="ghost"
          >
            {LABELS.back}
          </TextButton>
        </div>
      ) : null}
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
