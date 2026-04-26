"use client";

import { forwardRef } from "react";
import styles from "./CaptureTextarea.module.css";

type CaptureTextareaProps = {
  onChange: (value: string) => void;
  value: string;
};

export const CaptureTextarea = forwardRef<HTMLTextAreaElement, CaptureTextareaProps>(
  function CaptureTextarea({ onChange, value }, ref) {
    return (
      <textarea
        autoFocus
        className={styles.captureTextarea}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write it down."
        ref={ref}
        rows={6}
        value={value}
      />
    );
  },
);
