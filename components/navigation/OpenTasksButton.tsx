import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenTasksButton.module.css";

export function OpenTasksButton() {
  return (
    <TextButton className={styles.openTasksButton} href="/tasks" variant="primary">
      {LABELS.openTasks}
    </TextButton>
  );
}
