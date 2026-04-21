import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenTrashButton.module.css";

export function OpenTrashButton() {
  return (
    <TextButton className={styles.openTrashButton} href="/trash" variant="primary">
      {LABELS.openTrash}
    </TextButton>
  );
}
