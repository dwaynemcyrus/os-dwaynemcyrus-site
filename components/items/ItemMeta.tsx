import type { SyncState } from "@/lib/items/itemTypes";
import styles from "./ItemMeta.module.css";

type ItemMetaProps = {
  detail?: string;
  syncState: SyncState;
};

const LABELS: Record<SyncState, string> = {
  pending_sync: "pending",
  sync_error: "failed",
  synced: "synced",
};

export function ItemMeta({ detail, syncState }: ItemMetaProps) {
  return <p className={styles.itemMeta}>{detail ? `${detail} · ${LABELS[syncState]}` : LABELS[syncState]}</p>;
}
