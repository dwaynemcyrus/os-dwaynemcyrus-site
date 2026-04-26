import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import styles from "./OpenProjectsButton.module.css";

export function OpenProjectsButton() {
  return (
    <TextButton
      className={styles.openProjectsButton}
      href="/projects"
      variant="primary"
    >
      {LABELS.openProjects}
    </TextButton>
  );
}
