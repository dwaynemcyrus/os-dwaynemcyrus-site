import { LABELS } from "@/lib/constants/labels";
import type { SyncStatusLabel } from "@/lib/constants/labels";
import {
  getAllItems,
  getItemsBySyncState,
  getTrashedItems,
  getVisibleItems,
} from "@/lib/db/itemRepository";
import type { ItemType } from "@/lib/items/itemTypes";

export function getVisibleBacklogItems() {
  return getInboxItems();
}

export function getTrashedBacklogItems() {
  return getTrashedItems();
}

function sortByCreatedAtDescending<
  T extends {
    createdAt: string;
  },
>(items: T[]) {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function sortByCreatedAtAscending<
  T extends {
    createdAt: string;
  },
>(items: T[]) {
  return [...items].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function isVisibleTypedItem(
  item: Awaited<ReturnType<typeof getAllItems>>[number],
  types: ItemType[],
) {
  return !item.isTrashed && !item.needsRemoteDelete && types.includes(item.type);
}

export async function getInboxItems() {
  const items = await getVisibleItems();
  return items.filter((item) => item.type === "unknown");
}

export async function getInboxItemsForProcessing() {
  const items = await getAllItems();

  return sortByCreatedAtAscending(
    items.filter((item) => isVisibleTypedItem(item, ["unknown"])),
  );
}

export async function getItemsByTypes(types: ItemType[]) {
  const items = await getAllItems();

  return sortByCreatedAtDescending(
    items.filter((item) => isVisibleTypedItem(item, types)),
  );
}

export async function getSyncCounts() {
  const [failed, pending] = await Promise.all([
    getItemsBySyncState("sync_error"),
    getItemsBySyncState("pending_sync"),
  ]);

  return {
    failedCount: failed.length,
    pendingCount: pending.length,
  };
}

type DeriveSyncStatusLabelInput = {
  failedCount: number;
  hasAuthSession: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
};

export function deriveSyncStatusLabel({
  failedCount,
  hasAuthSession,
  isOnline,
  isSyncing,
  pendingCount,
}: DeriveSyncStatusLabelInput): SyncStatusLabel {
  if (failedCount > 0) {
    return LABELS.failed;
  }

  if (!isOnline && pendingCount > 0) {
    return LABELS.offline;
  }

  if (!hasAuthSession && pendingCount > 0) {
    return LABELS.signInToSync;
  }

  if (isSyncing || pendingCount > 0) {
    return LABELS.syncing;
  }

  return LABELS.allSynced;
}
