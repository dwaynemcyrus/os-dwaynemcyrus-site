"use client";

import { useRef, useState } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const isDisabled = isSaving || isEmptyCaptureContent(content);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isDisabled) {
      return;
    }

    setIsSaving(true);

    try {
      await createCapturedItem({ content });
      setContent("");
      await onSubmitted?.();

      if (rapidCapture) {
        window.requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
        return;
      }

      onCloseRequested?.();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.captureForm} onSubmit={handleSubmit}>
      <CaptureTextarea onChange={setContent} ref={textareaRef} value={content} />
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
