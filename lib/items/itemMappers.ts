import {
  normalizeItemStatus,
  normalizeItemSubtype,
  normalizeItemType,
  normalizeMetadata,
  normalizeItemKind,
  type LocalItem,
} from "@/lib/items/itemTypes";

export type RemoteItemRecord = {
  archived_at: string | null;
  completed_at: string | null;
  content: string;
  created_at: string;
  delegated_to: string | null;
  device_created_at: string;
  device_updated_at: string;
  document_frontmatter: string | null;
  end_at: string | null;
  id: string;
  incubated_at: string | null;
  is_archived: boolean;
  is_trashed: boolean;
  kind: string;
  last_synced_at: string | null;
  metadata: unknown;
  parent_id: string | null;
  start_at: string | null;
  status: LocalItem["status"];
  subtype: string | null;
  sync_state: LocalItem["syncState"];
  trashed_at: string | null;
  type: string | null;
  updated_at: string;
  user_id: string;
  waiting_reason: string | null;
};

export function mapLocalItemToRemoteRecord(
  item: LocalItem,
  userId: string,
  syncedAt: string,
): RemoteItemRecord {
  return {
    archived_at: item.archivedAt,
    completed_at: item.completedAt,
    content: item.content,
    created_at: item.createdAt,
    delegated_to: item.delegatedTo,
    device_created_at: item.deviceCreatedAt,
    device_updated_at: item.deviceUpdatedAt,
    document_frontmatter: item.documentFrontmatter,
    end_at: item.endAt,
    id: item.id,
    incubated_at: item.incubatedAt,
    is_archived: item.isArchived,
    is_trashed: item.isTrashed,
    kind: item.kind,
    last_synced_at: syncedAt,
    metadata: item.metadata,
    parent_id: item.parentId,
    start_at: item.startAt,
    status: item.status,
    subtype: item.subtype,
    sync_state: "synced",
    trashed_at: item.trashedAt,
    type: item.type,
    updated_at: item.updatedAt,
    user_id: userId,
    waiting_reason: item.waitingReason,
  };
}

export function mapRemoteRecordToLocalItem(record: RemoteItemRecord): LocalItem {
  return {
    archivedAt: record.archived_at,
    completedAt: record.completed_at,
    content: record.content,
    createdAt: record.created_at,
    delegatedTo: record.delegated_to,
    deviceCreatedAt: record.device_created_at,
    deviceUpdatedAt: record.device_updated_at,
    documentFrontmatter: record.document_frontmatter,
    endAt: record.end_at,
    id: record.id,
    incubatedAt: record.incubated_at,
    isArchived: record.is_archived,
    isTrashed: record.is_trashed,
    kind: normalizeItemKind(record.kind),
    lastSyncedAt: record.last_synced_at,
    metadata: normalizeMetadata(record.metadata),
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    parentId: record.parent_id,
    startAt: record.start_at,
    status: normalizeItemStatus(record.status),
    subtype: normalizeItemSubtype(record.subtype),
    syncErrorMessage: null,
    syncState: "synced",
    trashedAt: record.trashed_at,
    type: normalizeItemType(record.type),
    updatedAt: record.updated_at,
    userId: record.user_id,
    waitingReason: record.waiting_reason,
  };
}
