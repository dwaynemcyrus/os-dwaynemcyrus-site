import { ITEM_STORE_NAME, getDatabase } from "@/lib/db/indexedDb";
import {
  deriveV8FieldsFromLegacyType,
  normalizeItemKind,
  normalizeItemStatus,
  normalizeItemSubtype,
  normalizeItemType,
  normalizeMetadata,
  type LocalItem,
  type SyncState,
} from "@/lib/items/itemTypes";

type StoredLocalItem = Partial<LocalItem> & {
  content: string;
  createdAt: string;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  id: string;
  isTrashed: boolean;
  lastSyncedAt: string | null;
  needsRemoteCreate: boolean;
  needsRemoteDelete?: boolean;
  needsRemoteUpdate: boolean;
  status: string;
  syncState: SyncState;
  trashedAt: string | null;
  type?: string | null;
  updatedAt: string;
  userId: string;
};

function withV8Defaults(item: StoredLocalItem): LocalItem {
  const derived = deriveV8FieldsFromLegacyType({
    status: item.status,
    subtype: item.subtype,
    type: item.type,
  });

  return {
    archivedAt: item.archivedAt ?? null,
    completedAt: item.completedAt ?? null,
    content: item.content,
    createdAt: item.createdAt,
    delegatedTo: item.delegatedTo ?? null,
    deviceCreatedAt: item.deviceCreatedAt,
    deviceUpdatedAt: item.deviceUpdatedAt,
    documentFrontmatter: item.documentFrontmatter ?? null,
    endAt: item.endAt ?? null,
    id: item.id,
    incubatedAt:
      item.incubatedAt ??
      (normalizeItemStatus(item.status) === "incubate" ? item.updatedAt : null),
    isArchived: item.isArchived ?? false,
    isTrashed: item.isTrashed,
    kind: normalizeItemKind(item.kind) === "capture" && item.kind === undefined
      ? derived.kind
      : normalizeItemKind(item.kind),
    lastSyncedAt: item.lastSyncedAt,
    metadata: {
      ...derived.metadata,
      ...normalizeMetadata(item.metadata),
    },
    needsRemoteCreate: item.needsRemoteCreate,
    needsRemoteDelete: item.needsRemoteDelete ?? false,
    needsRemoteUpdate: item.needsRemoteUpdate,
    parentId: item.parentId ?? null,
    startAt: item.startAt ?? null,
    status: normalizeItemStatus(
      item.kind === undefined ? derived.status : item.status,
    ),
    subtype: normalizeItemSubtype(item.subtype),
    syncErrorMessage: item.syncErrorMessage ?? null,
    syncState: item.syncState,
    trashedAt: item.trashedAt,
    type: item.kind === undefined ? derived.type : normalizeItemType(item.type),
    updatedAt: item.updatedAt,
    userId: item.userId,
    waitingReason: item.waitingReason ?? null,
  };
}

export async function getItemById(id: string) {
  const database = await getDatabase();
  const item = await database.get(ITEM_STORE_NAME, id);
  return item ? withV8Defaults(item as StoredLocalItem) : undefined;
}

export async function getAllItems() {
  const database = await getDatabase();
  const items = await database.getAll(ITEM_STORE_NAME);
  return items.map((item) => withV8Defaults(item as StoredLocalItem));
}

export async function getVisibleItems() {
  const items = await getAllItems();

  return items
    .filter((item) => !item.isTrashed && !item.needsRemoteDelete)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function getTrashedItems() {
  const items = await getAllItems();

  return items
    .filter((item) => item.isTrashed && !item.needsRemoteDelete)
    .sort((left, right) => {
      const leftTimestamp = left.trashedAt ?? left.updatedAt;
      const rightTimestamp = right.trashedAt ?? right.updatedAt;
      return rightTimestamp.localeCompare(leftTimestamp);
    });
}

export async function createItem(item: LocalItem) {
  const database = await getDatabase();
  await database.put(ITEM_STORE_NAME, item);
  return item;
}

export async function removeItem(id: string) {
  const database = await getDatabase();
  await database.delete(ITEM_STORE_NAME, id);
}

export function saveItem(item: LocalItem) {
  return createItem(item);
}

export async function updateItem(id: string, patch: Partial<LocalItem>) {
  const database = await getDatabase();
  const storedItem = await database.get(ITEM_STORE_NAME, id);

  if (!storedItem) {
    throw new Error(`Item ${id} was not found.`);
  }

  const item = withV8Defaults(storedItem as StoredLocalItem);
  const nextItem = {
    ...item,
    ...patch,
  };

  await database.put(ITEM_STORE_NAME, nextItem);

  return nextItem;
}

export async function markItemTrashed(id: string, trashedAt: string) {
  return updateItem(id, {
    isTrashed: true,
    needsRemoteUpdate: true,
    needsRemoteDelete: false,
    syncState: "pending_sync",
    trashedAt,
    updatedAt: trashedAt,
  });
}

export async function markItemPendingRemoteDelete(id: string, deletedAt: string) {
  return updateItem(id, {
    needsRemoteCreate: false,
    needsRemoteDelete: true,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "pending_sync",
    updatedAt: deletedAt,
  });
}

export function markItemRemotelyTrashed(id: string, observedAt: string) {
  return updateItem(id, {
    isTrashed: true,
    lastSyncedAt: observedAt,
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "synced",
    trashedAt: observedAt,
    updatedAt: observedAt,
  });
}

export async function getItemsBySyncState(syncState: SyncState) {
  const database = await getDatabase();
  return database.getAllFromIndex(ITEM_STORE_NAME, "by-sync-state", syncState);
}

export function getPendingSyncItems() {
  return getItemsBySyncState("pending_sync");
}

export function getFailedSyncItems() {
  return getItemsBySyncState("sync_error");
}

export function setItemSynced(
  id: string,
  syncedAt: string,
  userId: string,
) {
  return updateItem(id, {
    lastSyncedAt: syncedAt,
    needsRemoteCreate: false,
    needsRemoteDelete: false,
    needsRemoteUpdate: false,
    syncErrorMessage: null,
    syncState: "synced",
    userId,
  });
}

export function setItemSyncError(id: string, message: string) {
  return updateItem(id, {
    syncErrorMessage: message,
    syncState: "sync_error",
  });
}
