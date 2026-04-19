"use client";

import { useEffect, useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import {
  getCurrentSession,
  signOutCurrentUser,
  subscribeToAuthEvents,
  updateCurrentUserPassword,
} from "@/lib/supabase/auth";
import styles from "./ResetPasswordPanel.module.css";

function hasRecoveryMarker() {
  if (typeof window === "undefined") {
    return false;
  }

  const currentUrl = new URL(window.location.href);
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""));

  return (
    currentUrl.searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery"
  );
}

export function ResetPasswordPanel() {
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isCheckingRecovery, setIsCheckingRecovery] = useState(true);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecoveryState() {
      const session = await getCurrentSession();

      if (cancelled) {
        return;
      }

      setIsRecoveryReady(Boolean(hasRecoveryMarker() && session?.user));
      setIsCheckingRecovery(false);
    }

    void loadRecoveryState();

    const unsubscribe = subscribeToAuthEvents((event, session) => {
      if (cancelled) {
        return;
      }

      if (event === "PASSWORD_RECOVERY") {
        setErrorMessage("");
        setInfoMessage("");
        setIsRecoveryReady(Boolean(session?.user));
        setIsCheckingRecovery(false);
        return;
      }

      if (event === "SIGNED_OUT" && !hasRecoveryMarker()) {
        setIsRecoveryReady(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  async function handleResetPassword() {
    if (password.length < 8) {
      setErrorMessage("Use a password with at least 8 characters.");
      setInfoMessage("");
      return;
    }

    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      await updateCurrentUserPassword(password);
      await signOutCurrentUser();

      setPassword("");
      setIsRecoveryReady(false);
      setInfoMessage("Password updated. Return home and sign in with your new password.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not reset your password.";

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingRecovery) {
    return (
      <section className={styles.resetPanel}>
        <div className={styles.resetPanel__copy}>
          <p className={styles.resetPanel__eyebrow}>Reset password</p>
          <p className={styles.resetPanel__message}>Checking your recovery link...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.resetPanel}>
      <div className={styles.resetPanel__copy}>
        <p className={styles.resetPanel__eyebrow}>Reset password</p>
        <p className={styles.resetPanel__message}>
          {isRecoveryReady
            ? "Set a new password for your account."
            : "Open this page from your password-reset email to continue."}
        </p>
      </div>
      <div className={styles.resetPanel__fields}>
        <label className={styles.resetPanel__field}>
          <span>New password</span>
          <input
            autoComplete="new-password"
            className={styles.resetPanel__input}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>
      </div>
      <div className={styles.resetPanel__actions}>
        <TextButton
          disabled={!isRecoveryReady || isSubmitting}
          onPress={() => {
            void handleResetPassword();
          }}
        >
          {LABELS.saveNewPassword}
        </TextButton>
        <TextButton href="/" variant="secondary">
          Back home
        </TextButton>
      </div>
      {errorMessage ? <p className={styles.resetPanel__error}>{errorMessage}</p> : null}
      {infoMessage ? <p className={styles.resetPanel__hint}>{infoMessage}</p> : null}
    </section>
  );
}
