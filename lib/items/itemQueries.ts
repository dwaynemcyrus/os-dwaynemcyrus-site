import { LABELS } from "@/lib/constants/labels";
import type { SyncStatusLabel } from "@/lib/constants/labels";
import {
  getItemsBySyncState,
  getTrashedItems,
  getVisibleItems,
} from "@/lib/db/itemRepository";

export function getVisibleBacklogItems() {
  return getVisibleItems();
}

export function getTrashedBacklogItems() {
  return getTrashedItems();
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
