"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./LoginPage.module.css";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function LoginPage() {
  const router = useRouter();
  const {
    createAccount,
    errorMessage,
    hasSession,
    infoMessage,
    isLoading,
    isSubmitting,
    signIn,
  } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const normalizedEmail = normalizeEmail(email);
  const isDisabled =
    isLoading || isSubmitting || normalizedEmail.length === 0 || password.length < 8;

  useEffect(() => {
    if (!isLoading && hasSession) {
      router.replace("/");
    }
  }, [isLoading, hasSession, router]);

  if (isLoading || hasSession) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.form}>
        <p className={styles.title}>Sign in</p>
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>Email</span>
            <input
              autoCapitalize="none"
              autoComplete="email"
              className={styles.input}
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input
              autoComplete="current-password"
              className={styles.input}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <TextButton
            disabled={isDisabled}
            onPress={() => {
              void signIn({ email: normalizedEmail, password });
            }}
          >
            {LABELS.signIn}
          </TextButton>
          <TextButton
            disabled={isDisabled}
            onPress={() => {
              void createAccount({ email: normalizedEmail, password });
            }}
            variant="secondary"
          >
            {LABELS.createAccount}
          </TextButton>
        </div>
        {errorMessage ? (
          <p className={styles.error}>{errorMessage}</p>
        ) : null}
        {infoMessage ? (
          <p className={styles.hint}>{infoMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
