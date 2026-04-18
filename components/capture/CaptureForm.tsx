"use client";

import { useState } from "react";
import { createCapturedItem } from "@/lib/items/itemCommands";
import { isEmptyCaptureContent } from "@/lib/utils/guards";
import { CaptureTextarea } from "./CaptureTextarea";
import { SubmitCaptureButton } from "./SubmitCaptureButton";
import styles from "./CaptureForm.module.css";

type CaptureFormProps = {
  onSubmitted?: () => Promise<void> | void;
};

export function CaptureForm({ onSubmitted }: CaptureFormProps) {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.captureForm} onSubmit={handleSubmit}>
      <CaptureTextarea onChange={setContent} value={content} />
      <SubmitCaptureButton disabled={isDisabled} />
    </form>
  );
}
