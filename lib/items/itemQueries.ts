import { LABELS } from "@/lib/constants/labels";
import type { SyncStatusLabel } from "@/lib/constants/labels";
import {
  getAllItems,
  getItemsBySyncState,
  getItemById,
  getTrashedItems,
  getVisibleItems,
} from "@/lib/db/itemRepository";
import { getTypeRegistryEntriesBySyncState } from "@/lib/db/typeRegistryRepository";
import type { ItemKind, ItemType, TypeRegistryKind } from "@/lib/items/itemTypes";

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
  if (types.includes("incubate")) {
    return (
      !item.isTrashed &&
      !item.needsRemoteDelete &&
      item.kind === "capture" &&
      item.status === "incubate"
    );
  }

  if (types.includes("media")) {
    return (
      !item.isTrashed &&
      !item.needsRemoteDelete &&
      item.kind === "reference" &&
      (item.type === "link" || item.type === "literature")
    );
  }

  return (
    !item.isTrashed &&
    !item.needsRemoteDelete &&
    item.kind === "action" &&
    item.type !== null &&
    types.includes(item.type)
  );
}

function isWritableItem(item: Awaited<ReturnType<typeof getAllItems>>[number]) {
  return !item.isTrashed && !item.needsRemoteDelete && item.kind !== "capture";
}

export async function getInboxItems() {
  const items = await getVisibleItems();
  return items.filter((item) => item.kind === "capture" && item.status === "later");
}

export async function getInboxItemsForProcessing() {
  const items = await getAllItems();

  return sortByCreatedAtAscending(
    items.filter(
      (item) =>
        !item.isTrashed &&
        !item.needsRemoteDelete &&
        item.kind === "capture" &&
        item.status === "later",
    ),
  );
}

export async function getItemsByTypes(types: ItemType[]) {
  const items = await getAllItems();

  return sortByCreatedAtDescending(
    items.filter((item) => isVisibleTypedItem(item, types)),
  );
}

export async function getWritingItems() {
  const items = await getAllItems();

  return [...items]
    .filter(isWritableItem)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getWritableItemById(id: string) {
  const item = await getItemById(id);

  if (!item || !isWritableItem(item)) {
    return null;
  }

  return item;
}

export async function getReferenceItems() {
  return getItemsByKind("reference");
}

export async function getMediaItems() {
  return getReferenceItemsByTypes(["link", "literature"]);
}

export async function getItemsByKind(kind: ItemKind) {
  const items = await getAllItems();

  return sortByCreatedAtDescending(
    items.filter(
      (item) => !item.isTrashed && !item.needsRemoteDelete && item.kind === kind,
    ),
  );
}

export async function getReferenceItemsByTypes(types: ItemType[]) {
  const items = await getAllItems();

  return sortByCreatedAtDescending(
    items.filter(
      (item) =>
        !item.isTrashed &&
        !item.needsRemoteDelete &&
        item.kind === "reference" &&
        item.type !== null &&
        types.includes(item.type),
    ),
  );
}

export async function getItemCountsByRegistryType(kind: TypeRegistryKind) {
  if (kind === "log") {
    return new Map<string, { activeCount: number; archivedCount: number }>();
  }

  const items = await getAllItems();
  const counts = new Map<string, { activeCount: number; archivedCount: number }>();

  for (const item of items) {
    if (item.kind !== kind || item.type === null || item.isTrashed) {
      continue;
    }

    const current = counts.get(item.type) ?? {
      activeCount: 0,
      archivedCount: 0,
    };

    if (item.isArchived) {
      current.archivedCount += 1;
    } else {
      current.activeCount += 1;
    }

    counts.set(item.type, current);
  }

  return counts;
}

export async function getWaitingItems() {
  const items = await getAllItems();

  return sortByCreatedAtDescending(
    items.filter(
      (item) => !item.isTrashed && !item.needsRemoteDelete && item.status === "waiting",
    ),
  );
}

export async function getCalendarItems() {
  const items = await getAllItems();

  const scheduled = items.filter(
    (item) =>
      !item.isTrashed &&
      !item.needsRemoteDelete &&
      (item.startAt !== null || item.endAt !== null),
  );

  return scheduled.sort((left, right) => {
    const leftDate = left.startAt ?? left.endAt ?? "";
    const rightDate = right.startAt ?? right.endAt ?? "";
    return leftDate.localeCompare(rightDate);
  });
}

export async function getSyncCounts() {
  const [failed, pending, failedTypes, pendingTypes] = await Promise.all([
    getItemsBySyncState("sync_error"),
    getItemsBySyncState("pending_sync"),
    getTypeRegistryEntriesBySyncState("sync_error"),
    getTypeRegistryEntriesBySyncState("pending_sync"),
  ]);

  return {
    failedCount: failed.length + failedTypes.length,
    pendingCount: pending.length + pendingTypes.length,
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
