"use client";

import { useState } from "react";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
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
    signIn,
    signOut,
    user,
  } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const normalizedEmail = normalizeEmail(email);
  const isDisabled =
    isLoading || isSubmitting || normalizedEmail.length === 0 || password.length < 8;

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
        <TextButton
          disabled={isSubmitting}
          onPress={() => {
            void signOut();
          }}
          variant="secondary"
        >
          {LABELS.signOut}
        </TextButton>
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
      {errorMessage ? (
        <p className={styles.authPanel__error}>{errorMessage}</p>
      ) : null}
      {infoMessage ? (
        <p className={styles.authPanel__hint}>{infoMessage}</p>
      ) : null}
    </section>
  );
}
