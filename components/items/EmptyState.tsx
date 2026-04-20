import { LABELS } from "@/lib/constants/labels";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  label?: string;
};

export function EmptyState({ label = LABELS.emptyState }: EmptyStateProps) {
  return <p className={styles.emptyState}>{label}</p>;
}
