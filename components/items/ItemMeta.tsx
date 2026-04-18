import type { SyncState } from "@/lib/items/itemTypes";
import styles from "./ItemMeta.module.css";

type ItemMetaProps = {
  syncState: SyncState;
};

const LABELS: Record<SyncState, string> = {
  pending_sync: "pending",
  sync_error: "failed",
  synced: "synced",
};

export function ItemMeta({ syncState }: ItemMetaProps) {
  return <p className={styles.itemMeta}>{LABELS[syncState]}</p>;
}
