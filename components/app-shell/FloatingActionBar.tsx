import { TextButton } from "@/components/primitives/TextButton";
import styles from "./FloatingActionBar.module.css";

type FloatingActionBarProps = {
  disabled?: boolean;
  label: string;
  onPress?: () => void;
};

export function FloatingActionBar({
  disabled = false,
  label,
  onPress,
}: FloatingActionBarProps) {
  return (
    <div className={styles.floatingActionBar}>
      <TextButton disabled={disabled} onPress={onPress} variant="fab">
        {label}
      </TextButton>
    </div>
  );
}
