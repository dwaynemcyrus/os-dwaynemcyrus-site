import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenSettingsButton.module.css";

export function OpenSettingsButton() {
  return (
    <TextButton
      className={styles.openSettingsButton}
      href="/settings"
      variant="primary"
    >
      {LABELS.settings}
    </TextButton>
  );
}
