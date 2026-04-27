"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./WritingMenu.module.css";

type WritingMode = "markdown" | "read" | "write";

type WritingMenuProps = {
  mode: WritingMode;
  onModeChange: (mode: WritingMode) => void;
  originalRoute: string;
};

export function WritingMenu({
  mode,
  onModeChange,
  originalRoute,
}: WritingMenuProps) {
  const [open, setOpen] = useState(false);

  function handleModeToggle() {
    onModeChange(mode === "markdown" ? "write" : "markdown");
    setOpen(false);
  }

  return (
    <div className={styles.menu}>
      <TextButton onPress={() => setOpen((current) => !current)} variant="ghost">
        {LABELS.more}
      </TextButton>
      {open ? (
        <div className={styles.menu__panel}>
          <TextButton className={styles.menu__action} onPress={handleModeToggle} variant="ghost">
            {mode === "markdown" ? LABELS.writeView : LABELS.markdownView}
          </TextButton>
          <TextButton
            className={styles.menu__action}
            href={originalRoute}
            variant="ghost"
          >
            {LABELS.openOriginalRoute}
          </TextButton>
        </div>
      ) : null}
    </div>
  );
}
