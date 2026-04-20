import { ITEM_STORE_NAME, getDatabase } from "@/lib/db/indexedDb";
import type { LocalItem, SyncState } from "@/lib/items/itemTypes";

export async function getItemById(id: string) {
  const database = await getDatabase();
  return database.get(ITEM_STORE_NAME, id);
}

export async function getAllItems() {
  const database = await getDatabase();
  return database.getAll(ITEM_STORE_NAME);
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
  const item = await database.get(ITEM_STORE_NAME, id);

  if (!item) {
    throw new Error(`Item ${id} was not found.`);
  }

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
