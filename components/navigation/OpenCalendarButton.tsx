import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenCalendarButton.module.css";

export function OpenCalendarButton() {
  return (
    <TextButton className={styles.openCalendarButton} href="/calendar" variant="primary">
      {LABELS.openCalendar}
    </TextButton>
  );
}
