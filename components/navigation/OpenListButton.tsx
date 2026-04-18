import { TextButton } from "@/components/primitives/TextButton";
import styles from "./OpenListButton.module.css";

export function OpenListButton() {
  return (
    <TextButton className={styles.openListButton} href="/list" variant="primary">
      Open List
    </TextButton>
  );
}
