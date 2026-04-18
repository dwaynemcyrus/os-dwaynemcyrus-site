"use client";

import styles from "./CaptureTextarea.module.css";

type CaptureTextareaProps = {
  onChange: (value: string) => void;
  value: string;
};

export function CaptureTextarea({ onChange, value }: CaptureTextareaProps) {
  return (
    <textarea
      autoFocus
      className={styles.captureTextarea}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Write it down."
      rows={6}
      value={value}
    />
  );
}
