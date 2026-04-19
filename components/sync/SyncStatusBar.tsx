import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";
import type { SyncStatusLabel } from "@/lib/constants/labels";
import styles from "./SyncStatusBar.module.css";

type SyncStatusBarProps = {
  label: SyncStatusLabel;
  onRefresh?: () => Promise<unknown> | void;
  refreshDisabled?: boolean;
  showRefresh?: boolean;
};

export function SyncStatusBar({
  label,
  onRefresh,
  refreshDisabled = false,
  showRefresh = false,
}: SyncStatusBarProps) {
  return (
    <div className={styles.syncStatusBar}>
      <p className={styles.syncStatusBar__label}>{label}</p>
      {showRefresh ? (
        <TextButton
          disabled={refreshDisabled}
          onPress={() => {
            void onRefresh?.();
          }}
          variant="ghost"
        >
          {LABELS.refreshSync}
        </TextButton>
      ) : null}
    </div>
  );
}
