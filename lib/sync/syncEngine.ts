import {
  getAllItems,
  getFailedSyncItems,
  getItemById,
  getPendingSyncItems,
  markItemRemotelyTrashed,
  removeItem,
  saveItem,
  setItemSynced,
  setItemSyncError,
} from "@/lib/db/itemRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import {
  mapLocalItemToRemoteRecord,
  mapRemoteRecordToLocalItem,
  type RemoteItemRecord,
} from "@/lib/items/itemMappers";
import type { LocalItem } from "@/lib/items/itemTypes";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createTimestamp } from "@/lib/utils/datetime";

export type SyncSkipReason = "missing-auth" | "missing-env" | "offline" | null;
export type SyncRunReason =
  | "app-load"
  | "capture"
  | "delete"
  | "foreground"
  | "manual"
  | "reconnect"
  | "restore"
  | "retry"
  | "trash";

export type SyncRunResult = {
  attemptedCount: number;
  failedCount: number;
  skippedReason: SyncSkipReason;
  syncedCount: number;
};

function sortSyncCandidates(items: LocalItem[]) {
  return [...items].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

function mergeUniqueItems(items: LocalItem[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

function isNewerTimestamp(left: string, right: string) {
  return left.localeCompare(right) > 0;
}

function shouldKeepLocalVersion(
  localItem: LocalItem,
  remoteRecord: RemoteItemRecord,
) {
  if (localItem.needsRemoteDelete) {
    return true;
  }

  const localIsUnsynced =
    localItem.syncState === "pending_sync" || localItem.syncState === "sync_error";

  if (!localIsUnsynced) {
    return false;
  }

  return isNewerTimestamp(localItem.updatedAt, remoteRecord.updated_at);
}

async function pullRemoteItems(
  userId: string,
  reason: SyncRunReason,
): Promise<{ failedCount: number; pulledCount: number }> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      failedCount: 0,
      pulledCount: 0,
    };
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      failedCount: 1,
      pulledCount: 0,
    };
  }

  const remoteRecords = (data ?? []) as RemoteItemRecord[];
  let pulledCount = 0;

  for (const remoteRecord of remoteRecords) {
    const localItem = await getItemById(remoteRecord.id);

    if (localItem && shouldKeepLocalVersion(localItem, remoteRecord)) {
      continue;
    }

    const nextItem = mapRemoteRecordToLocalItem(remoteRecord);
    const shouldWrite =
      !localItem || remoteRecord.updated_at.localeCompare(localItem.updatedAt) >= 0;

    if (!shouldWrite) {
      continue;
    }

    await saveItem(nextItem);
    pulledCount += 1;
  }

  if (reason === "manual") {
    const localItems = await getAllItems();
    const remoteIds = new Set(remoteRecords.map((item) => item.id));

    for (const localItem of localItems) {
      if (localItem.userId !== userId) {
        continue;
      }

      if (remoteIds.has(localItem.id)) {
        continue;
      }

      const localIsUnsynced =
        localItem.syncState === "pending_sync" ||
        localItem.syncState === "sync_error" ||
        localItem.needsRemoteDelete ||
        localItem.needsRemoteCreate ||
        localItem.needsRemoteUpdate;

      if (localIsUnsynced || localItem.isTrashed) {
        continue;
      }

      await markItemRemotelyTrashed(localItem.id, createTimestamp());
      pulledCount += 1;
    }
  }

  return {
    failedCount: 0,
    pulledCount,
  };
}

async function syncPendingDeletes(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      failedCount: 0,
      syncedCount: 0,
    };
  }

  const localItems = await getAllItems();
  const deleteCandidates = localItems.filter((item) => item.needsRemoteDelete);
  let failedCount = 0;
  let syncedCount = 0;

  for (const item of deleteCandidates) {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", item.id)
      .eq("user_id", userId);

    if (error) {
      failedCount += 1;
      await setItemSyncError(item.id, error.message);
      continue;
    }

    await removeItem(item.id);
    syncedCount += 1;
  }

  return {
    failedCount,
    syncedCount,
  };
}

export async function runSyncEngine(reason: SyncRunReason): Promise<SyncRunResult> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      attemptedCount: 0,
      failedCount: 0,
      skippedReason: "missing-env",
      syncedCount: 0,
    };
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return {
      attemptedCount: 0,
      failedCount: 0,
      skippedReason: "missing-auth",
      syncedCount: 0,
    };
  }

  const deleteResult = await syncPendingDeletes(userId);
  const pullResult = await pullRemoteItems(userId, reason);

  const [failedItems, pendingItems] = await Promise.all([
    getFailedSyncItems(),
    getPendingSyncItems(),
  ]);

  const items = sortSyncCandidates(
    mergeUniqueItems([...pendingItems, ...failedItems]).filter(
      (item) => !item.needsRemoteDelete,
    ),
  );
  let failedCount = pullResult.failedCount + deleteResult.failedCount;
  let syncedCount = deleteResult.syncedCount;

  for (const item of items) {
    const syncedAt = createTimestamp();
    const payload = mapLocalItemToRemoteRecord(item, userId, syncedAt);
    const { error } = await supabase
      .from("items")
      .upsert(payload, { onConflict: "id" });

    if (error) {
      failedCount += 1;
      await setItemSyncError(item.id, error.message);
      continue;
    }

    syncedCount += 1;
    await setItemSynced(item.id, syncedAt, userId);
  }

  if (items.length > 0 || pullResult.pulledCount > 0 || deleteResult.syncedCount > 0) {
    notifyItemsChanged();
  }

  return {
    attemptedCount: items.length,
    failedCount,
    skippedReason: null,
    syncedCount,
  };
}
