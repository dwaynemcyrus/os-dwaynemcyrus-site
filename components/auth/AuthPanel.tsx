"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { exportAuthenticatedBackup } from "@/lib/export/exportBackup";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./AuthPanel.module.css";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function AuthPanel() {
  const {
    createAccount,
    errorMessage,
    hasSession,
    infoMessage,
    isLoading,
    isSubmitting,
    requestPasswordReset,
    signIn,
    signOut,
    user,
  } = useAuthSession();
  const [email, setEmail] = useState("");
  const [exportErrorMessage, setExportErrorMessage] = useState("");
  const [exportInfoMessage, setExportInfoMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [password, setPassword] = useState("");

  const normalizedEmail = normalizeEmail(email);
  const isDisabled =
    isLoading || isSubmitting || normalizedEmail.length === 0 || password.length < 8;
  const isRecoveryDisabled =
    isLoading || isSubmitting || normalizedEmail.length === 0;

  async function handleExportBackup() {
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

  if (hasSession && user) {
    return (
      <section className={styles.authPanel}>
        <div className={styles.authPanel__copy}>
          <p className={styles.authPanel__eyebrow}>Account</p>
          <p className={styles.authPanel__message}>{user.email}</p>
          <p className={styles.authPanel__hint}>
            Sync is available while this session stays active.
          </p>
        </div>
        <div className={styles.authPanel__actions}>
          <TextButton
            disabled={isLoading || isExporting}
            onPress={() => {
              void handleExportBackup();
            }}
          >
            {isExporting ? LABELS.exportingBackup : LABELS.exportBackup}
          </TextButton>
          <TextButton href="/settings" variant="secondary">
            {LABELS.settings}
          </TextButton>
          <TextButton
            disabled={isSubmitting || isExporting}
            onPress={() => {
              void signOut();
            }}
            variant="secondary"
          >
            {LABELS.signOut}
          </TextButton>
        </div>
        {exportErrorMessage ? (
          <p className={styles.authPanel__error}>{exportErrorMessage}</p>
        ) : null}
        {exportInfoMessage ? (
          <p className={styles.authPanel__hint}>{exportInfoMessage}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className={styles.authPanel}>
      <div className={styles.authPanel__copy}>
        <p className={styles.authPanel__eyebrow}>Account</p>
        <p className={styles.authPanel__message}>
          Create your account or sign in to enable sync.
        </p>
        <p className={styles.authPanel__hint}>
          Local capture still works while signed out.
        </p>
      </div>
      <div className={styles.authPanel__fields}>
        <label className={styles.authPanel__field}>
          <span>Email</span>
          <input
            autoCapitalize="none"
            autoComplete="email"
            className={styles.authPanel__input}
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className={styles.authPanel__field}>
          <span>Password</span>
          <input
            autoComplete="new-password"
            className={styles.authPanel__input}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
      </div>
      <div className={styles.authPanel__actions}>
        <TextButton
          disabled={isDisabled}
          onPress={() => {
            void signIn({
              email: normalizedEmail,
              password,
            });
          }}
        >
          {LABELS.signIn}
        </TextButton>
        <TextButton
          disabled={isDisabled}
          onPress={() => {
            void createAccount({
              email: normalizedEmail,
              password,
            });
          }}
          variant="secondary"
        >
          {LABELS.createAccount}
        </TextButton>
      </div>
      <TextButton
        className={styles.authPanel__utilityAction}
        disabled={isRecoveryDisabled}
        onPress={() => {
          void requestPasswordReset(normalizedEmail);
        }}
        variant="ghost"
      >
        {LABELS.forgotPassword}
      </TextButton>
      {errorMessage ? (
        <p className={styles.authPanel__error}>{errorMessage}</p>
      ) : null}
      {infoMessage ? (
        <p className={styles.authPanel__hint}>{infoMessage}</p>
      ) : null}
    </section>
  );
}
