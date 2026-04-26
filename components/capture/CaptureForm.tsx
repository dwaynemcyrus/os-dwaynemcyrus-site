"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS } from "@/lib/constants/labels";
import { createCapturedItem } from "@/lib/items/itemCommands";
import { isEmptyCaptureContent } from "@/lib/utils/guards";
import { CaptureTextarea } from "./CaptureTextarea";
import { SubmitCaptureButton } from "./SubmitCaptureButton";
import styles from "./CaptureForm.module.css";

type CaptureFormProps = {
  onCloseRequested?: () => void;
  onRapidCaptureChange: (enabled: boolean) => void;
  onSubmitted?: () => Promise<void> | void;
  rapidCapture: boolean;
};

export function CaptureForm({
  onCloseRequested,
  onRapidCaptureChange,
  onSubmitted,
  rapidCapture,
}: CaptureFormProps) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const shouldRestoreFocusRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDisabled = isSaving || isEmptyCaptureContent(content);

  useEffect(() => {
    if (!rapidCapture || isSaving || !shouldRestoreFocusRef.current) {
      return;
    }

    shouldRestoreFocusRef.current = false;
    textareaRef.current?.focus();
  }, [isSaving, rapidCapture]);

  async function submitCapture() {
    if (isDisabled) {
      return;
    }

    setIsSaving(true);

    try {
      await createCapturedItem({ content });
      setContent("");
      await onSubmitted?.();

      if (rapidCapture) {
        shouldRestoreFocusRef.current = true;
        return;
      }

      onCloseRequested?.();
    } finally {
      setIsSaving(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitCapture();
  }

  function handleTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      !rapidCapture ||
      event.key !== "Enter" ||
      event.shiftKey ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    void submitCapture();
  }

  return (
    <form className={styles.captureForm} onSubmit={handleSubmit}>
      <CaptureTextarea
        enterKeyHint={rapidCapture ? "send" : undefined}
        onChange={setContent}
        onKeyDown={handleTextareaKeyDown}
        ref={textareaRef}
        value={content}
      />
      <label className={styles["captureForm__toggle"]}>
        <input
          checked={rapidCapture}
          className={styles["captureForm__checkbox"]}
          disabled={isSaving}
          onChange={(event) => onRapidCaptureChange(event.target.checked)}
          type="checkbox"
        />
        <span>{LABELS.rapidCapture}</span>
      </label>
      <SubmitCaptureButton disabled={isDisabled} />
    </form>
  );
}
