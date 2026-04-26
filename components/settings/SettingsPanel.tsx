"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { exportAuthenticatedBackup } from "@/lib/export/exportBackup";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { updateCurrentUserPassword } from "@/lib/supabase/auth";
import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
  const { hasSession, isLoading, user } = useAuthSession();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [exportErrorMessage, setExportErrorMessage] = useState("");
  const [exportInfoMessage, setExportInfoMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const isDisabled =
    !hasSession ||
    isLoading ||
    isSubmitting ||
    password.length < 8 ||
    confirmPassword.length < 8;

  async function handleExportBackup() {
    if (!hasSession) {
      setExportErrorMessage("Sign in before exporting your backup.");
      setExportInfoMessage("");
      return;
    }

    setExportErrorMessage("");
    setExportInfoMessage("");
    setIsExporting(true);

    try {
      const result = await exportAuthenticatedBackup();
      const itemLabel = result.itemCount === 1 ? "item" : "items";

      setExportInfoMessage(
        `Downloaded ${result.filename} with ${result.itemCount} ${itemLabel}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not export your backup.";

      setExportErrorMessage(message);
    } finally {
      setIsExporting(false);
    }
  }

  async function handleChangePassword() {
    if (!hasSession) {
      setErrorMessage("Sign in before changing your password.");
      setInfoMessage("");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The password fields must match.");
      setInfoMessage("");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      await updateCurrentUserPassword(password);
      setPassword("");
      setConfirmPassword("");
      setInfoMessage("Password updated for your signed-in account.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not change your password.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.settingsPanel}>
      <div className={styles.settingsPanel__copy}>
        <p className={styles.settingsPanel__eyebrow}>Settings</p>
        <p className={styles.settingsPanel__message}>
          {hasSession && user
            ? `Signed in as ${user.email}. Manage your account and backups here.`
            : "Sign in on the home screen before changing your password or exporting a backup."}
        </p>
        <p className={styles.settingsPanel__hint}>
          If you are locked out completely, recovery is manual through Supabase.
        </p>
      </div>
      <div className={styles.settingsPanel__fields}>
        <label className={styles.settingsPanel__field}>
          <span>{LABELS.newPassword}</span>
          <input
            autoComplete="new-password"
            className={styles.settingsPanel__input}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
        <label className={styles.settingsPanel__field}>
          <span>{LABELS.confirmPassword}</span>
          <input
            autoComplete="new-password"
            className={styles.settingsPanel__input}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            value={confirmPassword}
          />
        </label>
      </div>
      <div className={styles.settingsPanel__list}>
        <TextButton
          disabled={isDisabled}
          onPress={() => {
            void handleChangePassword();
          }}
        >
          {LABELS.changePassword}
        </TextButton>
      </div>
      {errorMessage ? <p className={styles.settingsPanel__error}>{errorMessage}</p> : null}
      {infoMessage ? <p className={styles.settingsPanel__hint}>{infoMessage}</p> : null}
      <div className={styles.settingsPanel__section}>
        <div className={styles.settingsPanel__copy}>
          <p className={styles.settingsPanel__eyebrow}>{LABELS.exportBackup}</p>
          <p className={styles.settingsPanel__message}>
            Download the canonical Supabase backup for your signed-in account.
          </p>
        </div>
        <div className={styles.settingsPanel__list}>
          <TextButton
            disabled={isLoading || isExporting || !hasSession}
            onPress={() => {
              void handleExportBackup();
            }}
          >
            {isExporting ? LABELS.exportingBackup : LABELS.exportBackup}
          </TextButton>
        </div>
        {exportErrorMessage ? (
          <p className={styles.settingsPanel__error}>{exportErrorMessage}</p>
        ) : null}
        {exportInfoMessage ? (
          <p className={styles.settingsPanel__hint}>{exportInfoMessage}</p>
        ) : null}
      </div>
      <div className={styles.settingsPanel__section}>
        <div className={styles.settingsPanel__copy}>
          <p className={styles.settingsPanel__eyebrow}>Views</p>
          <p className={styles.settingsPanel__message}>
            Review processed items by destination after they leave the inbox.
          </p>
        </div>
        <div className={styles.settingsPanel__list}>
          <TextButton href="/notes" variant="secondary">
            {LABELS.openNotes}
          </TextButton>
          <TextButton href="/incubate" variant="secondary">
            {LABELS.openIncubate}
          </TextButton>
        </div>
      </div>
    </section>
  );
}
