"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { CaptureForm } from "./CaptureForm";
import styles from "./CaptureDialog.module.css";

type CaptureDialogProps = {
  onCaptured?: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CaptureDialog({
  onCaptured,
  onOpenChange,
  open,
}: CaptureDialogProps) {
  const [rapidCapture, setRapidCapture] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setRapidCapture(false);
    }
  }

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.captureDialog__overlay} />
        <Dialog.Content className={styles.captureDialog__content}>
          <Dialog.Title className={styles.captureDialog__title}>
            Capture
          </Dialog.Title>
          <Dialog.Description className={styles.captureDialog__description}>
            Capture a thought immediately. Local save happens before background sync.
          </Dialog.Description>
          <CaptureForm
            onCloseRequested={() => handleOpenChange(false)}
            onRapidCaptureChange={setRapidCapture}
            onSubmitted={onCaptured}
            rapidCapture={rapidCapture}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
