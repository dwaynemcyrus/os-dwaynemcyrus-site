import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenReferenceButton.module.css";

export function OpenReferenceButton() {
  return (
    <TextButton className={styles.openReferenceButton} href="/reference" variant="primary">
      {LABELS.openReference}
    </TextButton>
  );
}
