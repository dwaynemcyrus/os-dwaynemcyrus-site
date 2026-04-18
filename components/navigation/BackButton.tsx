import { TextButton } from "@/components/primitives/TextButton";
import styles from "./BackButton.module.css";

export function BackButton() {
  return (
    <TextButton className={styles.backButton} href="/" variant="ghost">
      Back
    </TextButton>
  );
}
