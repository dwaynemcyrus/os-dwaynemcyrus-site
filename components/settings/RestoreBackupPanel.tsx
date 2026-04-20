"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import {
  previewBackupFile,
  restoreAuthenticatedBackup,
} from "@/lib/backup/restoreBackup";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./RestoreBackupPanel.module.css";

type BackupPreview = Awaited<ReturnType<typeof previewBackupFile>>;

export function RestoreBackupPanel() {
  const { hasSession, isLoading, user } = useAuthSession();
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<BackupPreview | null>(null);

  async function handleFileChange(file: File | null) {
    setErrorMessage("");
    setInfoMessage("");
    setPreview(null);

    if (!file) {
      return;
    }

    try {
      const nextPreview = await previewBackupFile(file);
      setPreview(nextPreview);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not read the selected backup.";

      setErrorMessage(message);
    }
  }

  async function handleRestore() {
    if (!preview) {
      setErrorMessage("Choose a valid PSA backup before restoring.");
      setInfoMessage("");
      return;
    }

    if (!hasSession) {
      setErrorMessage("Sign in before restoring a backup.");
      setInfoMessage("");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const result = await restoreAuthenticatedBackup(preview.payload);

      setInfoMessage(
        `Restored ${result.importedCount} items, skipped ${result.skippedCount}, and queued ${result.queuedForSyncCount} for sync.`,
      );
      setPreview(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not restore the backup.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.restorePanel}>
      <div className={styles.restorePanel__copy}>
        <p className={styles.restorePanel__eyebrow}>{LABELS.importRestore}</p>
        <p className={styles.restorePanel__message}>
          {hasSession && user
            ? `Restore a PSA backup into ${user.email}.`
            : "Sign in on the home screen before restoring a backup."}
        </p>
        <p className={styles.restorePanel__hint}>
          Restore validates the JSON file first, then imports newer backup items
          by id and syncs them in the background.
        </p>
      </div>
      <div className={styles.restorePanel__fields}>
        <label className={styles.restorePanel__field}>
          <span>Backup file</span>
          <input
            accept=".json,application/json"
            className={styles.restorePanel__input}
            disabled={isLoading || isSubmitting}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleFileChange(file);
            }}
            type="file"
          />
        </label>
      </div>
      {preview ? (
        <div className={styles.restorePanel__preview}>
          <p className={styles.restorePanel__message}>{preview.fileName}</p>
          <p className={styles.restorePanel__hint}>
            This backup contains {preview.itemCount} items.
          </p>
          <p className={styles.restorePanel__hint}>
            Restore only if you want to merge this backup into the current account.
          </p>
        </div>
      ) : null}
      <div className={styles.restorePanel__actions}>
        <TextButton
          disabled={!preview || !hasSession || isLoading || isSubmitting}
          onPress={() => {
            void handleRestore();
          }}
        >
          {LABELS.restoreBackup}
        </TextButton>
      </div>
      {errorMessage ? <p className={styles.restorePanel__error}>{errorMessage}</p> : null}
      {infoMessage ? <p className={styles.restorePanel__hint}>{infoMessage}</p> : null}
    </section>
  );
}
