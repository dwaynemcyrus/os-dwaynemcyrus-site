import {
  getFailedSyncItems,
  getPendingSyncItems,
  setItemSynced,
  setItemSyncError,
} from "@/lib/db/itemRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import { mapLocalItemToRemoteRecord } from "@/lib/items/itemMappers";
import type { LocalItem } from "@/lib/items/itemTypes";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { createTimestamp } from "@/lib/utils/datetime";

export type SyncSkipReason = "missing-auth" | "missing-env" | "offline" | null;

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

export async function runSyncEngine(): Promise<SyncRunResult> {
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

  const [failedItems, pendingItems] = await Promise.all([
    getFailedSyncItems(),
    getPendingSyncItems(),
  ]);

  const items = sortSyncCandidates(mergeUniqueItems([...pendingItems, ...failedItems]));
  let failedCount = 0;
  let syncedCount = 0;

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

  if (items.length > 0) {
    notifyItemsChanged();
  }

  return {
    attemptedCount: items.length,
    failedCount,
    skippedReason: null,
    syncedCount,
  };
}
