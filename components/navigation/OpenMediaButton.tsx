import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenMediaButton.module.css";

export function OpenMediaButton() {
  return (
    <TextButton className={styles.openMediaButton} href="/media" variant="primary">
      {LABELS.openMedia}
    </TextButton>
  );
}
