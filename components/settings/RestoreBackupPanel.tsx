"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import {
  previewBackupFile,
  restoreAuthenticatedBackup,
  type RestoreBackupResult,
} from "@/lib/backup/restoreBackup";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./RestoreBackupPanel.module.css";

type BackupPreview = Awaited<ReturnType<typeof previewBackupFile>>;
type RestoreSummary = Pick<
  RestoreBackupResult,
  | "backupItemCount"
  | "importedCount"
  | "queuedForSyncCount"
  | "skippedEqualLocalCount"
  | "skippedNewerLocalCount"
  | "skippedNewerRemoteCount"
  | "syncedParityCount"
>;

export function RestoreBackupPanel() {
  const { hasSession, isLoading, user } = useAuthSession();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [restoreSummary, setRestoreSummary] = useState<RestoreSummary | null>(null);

  async function handleFileChange(file: File | null) {
    setErrorMessage("");
    setRestoreSummary(null);
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
      return;
    }

    if (!hasSession) {
      setErrorMessage("Sign in before restoring a backup.");
      return;
    }

    setErrorMessage("");
    setRestoreSummary(null);
    setIsSubmitting(true);

    try {
      const result = await restoreAuthenticatedBackup(preview.payload);

      setRestoreSummary(result);
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
      {restoreSummary ? (
        <div className={styles.restorePanel__summary}>
          <p className={styles.restorePanel__message}>Restore summary</p>
          <dl className={styles.restorePanel__stats}>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Processed</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.backupItemCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Restored</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.importedCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Matched</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.skippedEqualLocalCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Newer local</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.skippedNewerLocalCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Newer remote</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.skippedNewerRemoteCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Reused remote</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.syncedParityCount}
              </dd>
            </div>
            <div className={styles.restorePanel__statRow}>
              <dt className={styles.restorePanel__statLabel}>Queued for sync</dt>
              <dd className={styles.restorePanel__statValue}>
                {restoreSummary.queuedForSyncCount}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
      {errorMessage ? <p className={styles.restorePanel__error}>{errorMessage}</p> : null}
    </section>
  );
}
