import {
  normalizeTypeRegistryKind,
  type LocalTypeRegistryEntry,
} from "@/lib/items/itemTypes";

export type RemoteTypeRegistryRecord = {
  created_at: string;
  id: string;
  kind: string;
  name: string;
  updated_at: string;
  user_id: string;
};

export function mapLocalTypeRegistryEntryToRemoteRecord(
  entry: LocalTypeRegistryEntry,
  userId: string,
): RemoteTypeRegistryRecord {
  return {
    created_at: entry.createdAt,
    id: entry.id,
    kind: entry.kind,
    name: entry.name,
    updated_at: entry.updatedAt,
    user_id: userId,
  };
}

export function mapRemoteTypeRegistryRecordToLocalEntry(
  record: RemoteTypeRegistryRecord,
): LocalTypeRegistryEntry | null {
  const kind = normalizeTypeRegistryKind(record.kind);

  if (!kind) {
    return null;
  }

  return {
    createdAt: record.created_at,
    id: record.id,
    kind,
    lastSyncedAt: record.updated_at,
    name: record.name,
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "synced",
    updatedAt: record.updated_at,
    userId: record.user_id,
  };
}
