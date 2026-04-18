import type { SyncStatusLabel } from "@/lib/constants/labels";
import styles from "./SyncStatusBar.module.css";

type SyncStatusBarProps = {
  label: SyncStatusLabel;
};

export function SyncStatusBar({ label }: SyncStatusBarProps) {
  return <p className={styles.syncStatusBar}>{label}</p>;
}
