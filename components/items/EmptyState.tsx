import { LABELS } from "@/lib/constants/labels";
import styles from "./EmptyState.module.css";

export function EmptyState() {
  return <p className={styles.emptyState}>{LABELS.emptyState}</p>;
}
