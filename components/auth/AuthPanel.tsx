"use client";

import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./AuthPanel.module.css";

export function AuthPanel() {
  const { isSubmitting, signOut, user } = useAuthSession();

  return (
    <section className={styles.authPanel}>
      <div className={styles.authPanel__copy}>
        <p className={styles.authPanel__eyebrow}>Account</p>
        <p className={styles.authPanel__message}>{user?.email}</p>
        <p className={styles.authPanel__hint}>
          Sync is available while this session stays active.
        </p>
      </div>
      <div className={styles.authPanel__actions}>
        <TextButton
          disabled={isSubmitting}
          onPress={() => {
            void signOut();
          }}
          variant="secondary"
        >
          {LABELS.signOut}
        </TextButton>
      </div>
    </section>
  );
}
