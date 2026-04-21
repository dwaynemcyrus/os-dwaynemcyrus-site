import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenProcessButton.module.css";

export function OpenProcessButton() {
  return (
    <TextButton
      className={styles.openProcessButton}
      href="/process"
      variant="primary"
    >
      {LABELS.openProcess}
    </TextButton>
  );
}
