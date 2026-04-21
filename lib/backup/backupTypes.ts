import type { ItemStatus, ItemType, SyncState } from "@/lib/items/itemTypes";

export const LEGACY_PSA_BACKUP_FORMAT = "psa-backup.v1";
export const PSA_BACKUP_FORMAT = "psa-backup.v2";
export type BackupFormat =
  | typeof LEGACY_PSA_BACKUP_FORMAT
  | typeof PSA_BACKUP_FORMAT;
export const BACKUP_REMOTE_COLUMNS = [
  "id",
  "user_id",
  "content",
  "type",
  "status",
  "created_at",
  "updated_at",
  "device_created_at",
  "device_updated_at",
  "sync_state",
  "last_synced_at",
  "is_trashed",
  "trashed_at",
].join(", ");

export type BackupItem = {
  content: string;
  createdAt: string;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  id: string;
  isTrashed: boolean;
  lastSyncedAt: string | null;
  status: ItemStatus;
  syncState: SyncState;
  trashedAt: string | null;
  type: ItemType | "someday";
  updatedAt: string;
  userId: string;
};

export type BackupPayload = {
  exportedAt: string;
  format: BackupFormat;
  items: BackupItem[];
  source: "supabase";
  userId: string;
};
