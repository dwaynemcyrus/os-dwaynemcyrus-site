import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenListButton.module.css";

export function OpenListButton() {
  return (
    <TextButton className={styles.openListButton} href="/list" variant="primary">
      {LABELS.openInbox}
    </TextButton>
  );
}
