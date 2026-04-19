import type { LocalItem } from "@/lib/items/itemTypes";

export type RemoteItemRecord = {
  content: string;
  created_at: string;
  device_created_at: string;
  device_updated_at: string;
  id: string;
  is_trashed: boolean;
  last_synced_at: string | null;
  status: LocalItem["status"];
  sync_state: LocalItem["syncState"];
  trashed_at: string | null;
  type: LocalItem["type"];
  updated_at: string;
  user_id: string;
};

export function mapLocalItemToRemoteRecord(
  item: LocalItem,
  userId: string,
  syncedAt: string,
): RemoteItemRecord {
  return {
    content: item.content,
    created_at: item.createdAt,
    device_created_at: item.deviceCreatedAt,
    device_updated_at: item.deviceUpdatedAt,
    id: item.id,
    is_trashed: item.isTrashed,
    last_synced_at: syncedAt,
    status: item.status,
    sync_state: "synced",
    trashed_at: item.trashedAt,
    type: item.type,
    updated_at: item.updatedAt,
    user_id: userId,
  };
}

export function mapRemoteRecordToLocalItem(record: RemoteItemRecord): LocalItem {
  return {
    content: record.content,
    createdAt: record.created_at,
    deviceCreatedAt: record.device_created_at,
    deviceUpdatedAt: record.device_updated_at,
    id: record.id,
    isTrashed: record.is_trashed,
    lastSyncedAt: record.last_synced_at,
    needsRemoteCreate: false,
    needsRemoteUpdate: false,
    status: record.status,
    syncErrorMessage: null,
    syncState: "synced",
    trashedAt: record.trashed_at,
    type: record.type,
    updatedAt: record.updated_at,
    userId: record.user_id,
  };
}
