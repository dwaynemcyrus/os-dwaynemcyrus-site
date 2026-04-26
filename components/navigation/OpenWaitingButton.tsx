import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenWaitingButton.module.css";

export function OpenWaitingButton() {
  return (
    <TextButton className={styles.openWaitingButton} href="/waiting" variant="primary">
      {LABELS.openWaiting}
    </TextButton>
  );
}
