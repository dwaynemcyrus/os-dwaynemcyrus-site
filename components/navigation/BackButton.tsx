import { TextButton } from "@/components/primitives/TextButton";
import styles from "./BackButton.module.css";

type BackButtonProps = {
  href?: string;
};

export function BackButton({ href = "/" }: BackButtonProps) {
  return (
    <TextButton className={styles.backButton} href={href} variant="ghost">
      Back
    </TextButton>
  );
}
