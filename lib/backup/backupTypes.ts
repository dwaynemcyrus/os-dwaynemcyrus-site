import type { ItemStatus, ItemType, SyncState } from "@/lib/items/itemTypes";

export const LEGACY_PSA_BACKUP_FORMAT = "psa-backup.v1";
export const PSA_BACKUP_V2_FORMAT = "psa-backup.v2";
export const PSA_BACKUP_V3_FORMAT = "psa-backup.v3";
export const PSA_BACKUP_FORMAT = "psa-backup.v4";
export type BackupFormat =
  | typeof LEGACY_PSA_BACKUP_FORMAT
  | typeof PSA_BACKUP_V2_FORMAT
  | typeof PSA_BACKUP_V3_FORMAT
  | typeof PSA_BACKUP_FORMAT;
export const BACKUP_REMOTE_COLUMNS = [
  "id",
  "user_id",
  "parent_id",
  "kind",
  "content",
  "type",
  "status",
  "is_archived",
  "waiting_reason",
  "delegated_to",
  "metadata",
  "subtype",
  "start_at",
  "end_at",
  "document_frontmatter",
  "completed_at",
  "created_at",
  "updated_at",
  "device_created_at",
  "device_updated_at",
  "sync_state",
  "last_synced_at",
  "is_trashed",
  "trashed_at",
  "archived_at",
  "incubated_at",
].join(", ");

export type BackupItem = {
  archivedAt?: string | null;
  completedAt?: string | null;
  content: string;
  createdAt: string;
  delegatedTo?: string | null;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  documentFrontmatter?: string | null;
  endAt?: string | null;
  id: string;
  incubatedAt?: string | null;
  isArchived?: boolean;
  isTrashed: boolean;
  kind?: string;
  lastSyncedAt: string | null;
  metadata?: Record<string, unknown>;
  parentId?: string | null;
  startAt?: string | null;
  status: ItemStatus;
  subtype?: string | null;
  syncState: SyncState;
  trashedAt: string | null;
  type: ItemType | "someday" | null;
  updatedAt: string;
  userId: string;
  waitingReason?: string | null;
};

export type BackupPayload = {
  exportedAt: string;
  format: BackupFormat;
  items: BackupItem[];
  source: "supabase";
  userId: string;
};
