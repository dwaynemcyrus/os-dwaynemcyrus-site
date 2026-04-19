import { TextButton } from "@/components/primitives/TextButton";
import styles from "./SettingsPanel.module.css";

export function SettingsPanel() {
  return (
    <section className={styles.settingsPanel}>
      <div className={styles.settingsPanel__copy}>
        <p className={styles.settingsPanel__eyebrow}>Settings</p>
        <p className={styles.settingsPanel__message}>
          Account-recovery routes live here. Use the reset-password screen only
          when you arrive from a recovery email.
        </p>
      </div>
      <div className={styles.settingsPanel__list}>
        <TextButton href="/settings/reset-password" variant="secondary">
          Reset password
        </TextButton>
      </div>
    </section>
  );
}
