"use client";

import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { ROUTES } from "@/lib/constants/routes";
import styles from "./OpenWritingButton.module.css";

export function OpenWritingButton() {
  return (
    <TextButton className={styles.button} href={ROUTES.writing} variant="secondary">
      {LABELS.openWriting}
    </TextButton>
  );
}
