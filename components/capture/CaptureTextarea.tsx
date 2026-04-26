"use client";

import { forwardRef } from "react";
import styles from "./CaptureTextarea.module.css";

type CaptureTextareaProps = {
  enterKeyHint?: "send";
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  value: string;
};

export const CaptureTextarea = forwardRef<HTMLTextAreaElement, CaptureTextareaProps>(
  function CaptureTextarea({ enterKeyHint, onChange, onKeyDown, value }, ref) {
    return (
      <textarea
        autoFocus
        className={styles.captureTextarea}
        enterKeyHint={enterKeyHint}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write it down."
        ref={ref}
        rows={6}
        value={value}
      />
    );
  },
);
