import {
  BACKUP_REMOTE_COLUMNS,
  PSA_BACKUP_FORMAT,
  type BackupItem,
  type BackupPayload,
} from "@/lib/backup/backupTypes";
import { getAllItems, saveItem } from "@/lib/db/itemRepository";
import { notifyItemsChanged } from "@/lib/items/itemEvents";
import {
  mapRemoteRecordToLocalItem,
  type RemoteItemRecord,
} from "@/lib/items/itemMappers";
import type { LocalItem } from "@/lib/items/itemTypes";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { runSyncQueue } from "@/lib/sync/syncQueue";

type RestoreBackupSummary = {
  fileName: string;
  itemCount: number;
  payload: BackupPayload;
};

export type RestoreBackupResult = {
  backupItemCount: number;
  importedCount: number;
  queuedForSyncCount: number;
  skippedEqualLocalCount: number;
  skippedNewerLocalCount: number;
  skippedNewerRemoteCount: number;
  syncedParityCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isBackupItem(value: unknown): value is BackupItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.id) &&
    isString(value.userId) &&
    isString(value.content) &&
    isString(value.type) &&
    isString(value.status) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isString(value.deviceCreatedAt) &&
    isString(value.deviceUpdatedAt) &&
    isString(value.syncState) &&
    isNullableString(value.lastSyncedAt) &&
    isBoolean(value.isTrashed) &&
    isNullableString(value.trashedAt)
  );
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.format === PSA_BACKUP_FORMAT &&
    value.source === "supabase" &&
    isString(value.exportedAt) &&
    isString(value.userId) &&
    Array.isArray(value.items) &&
    value.items.every(isBackupItem)
  );
}

function isNewerTimestamp(left: string, right: string) {
  return left.localeCompare(right) > 0;
}

function mapBackupItemToPendingLocalItem(
  item: BackupItem,
  userId: string,
  remoteRecord: RemoteItemRecord | null,
): LocalItem {
  return {
    content: item.content,
    createdAt: item.createdAt,
    deviceCreatedAt: item.deviceCreatedAt,
    deviceUpdatedAt: item.deviceUpdatedAt,
    id: item.id,
    isTrashed: item.isTrashed,
    lastSyncedAt: remoteRecord?.last_synced_at ?? item.lastSyncedAt,
    needsRemoteCreate: remoteRecord === null,
    needsRemoteDelete: false,
    needsRemoteUpdate: remoteRecord !== null,
    status: item.status,
    syncErrorMessage: null,
    syncState: "pending_sync",
    trashedAt: item.trashedAt,
    type: item.type,
    updatedAt: item.updatedAt,
    userId,
  };
}

async function getRemoteItems(userId: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("items")
    .select(BACKUP_REMOTE_COLUMNS)
    .eq("user_id", userId)
    .returns<RemoteItemRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((item) => [item.id, item]));
}

export async function previewBackupFile(file: File): Promise<RestoreBackupSummary> {
  const content = await file.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  if (!isBackupPayload(parsed)) {
    throw new Error("The selected file is not a valid PSA backup.");
  }

  return {
    fileName: file.name,
    itemCount: parsed.items.length,
    payload: parsed,
  };
}

export async function restoreAuthenticatedBackup(
  payload: BackupPayload,
): Promise<RestoreBackupResult> {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to restore a backup.");
  }

  const [localItems, remoteItems] = await Promise.all([
    getAllItems(),
    getRemoteItems(userId),
  ]);

  const localItemsById = new Map(localItems.map((item) => [item.id, item]));
  const backupItemCount = payload.items.length;
  let importedCount = 0;
  let queuedForSyncCount = 0;
  let skippedEqualLocalCount = 0;
  let skippedNewerLocalCount = 0;
  let skippedNewerRemoteCount = 0;
  let syncedParityCount = 0;

  for (const backupItem of payload.items) {
    const localItem = localItemsById.get(backupItem.id);
    const remoteItem = remoteItems.get(backupItem.id) ?? null;

    if (localItem && backupItem.updatedAt === localItem.updatedAt) {
      skippedEqualLocalCount += 1;
      continue;
    }

    if (localItem && isNewerTimestamp(localItem.updatedAt, backupItem.updatedAt)) {
      skippedNewerLocalCount += 1;
      continue;
    }

    if (remoteItem && isNewerTimestamp(remoteItem.updated_at, backupItem.updatedAt)) {
      skippedNewerRemoteCount += 1;
      continue;
    }

    if (remoteItem && remoteItem.updated_at === backupItem.updatedAt) {
      if (localItem) {
        skippedEqualLocalCount += 1;
        continue;
      }

      await saveItem(mapRemoteRecordToLocalItem(remoteItem));
      importedCount += 1;
      syncedParityCount += 1;
      continue;
    }

    const nextItem = mapBackupItemToPendingLocalItem(backupItem, userId, remoteItem);

    await saveItem(nextItem);
    localItemsById.set(nextItem.id, nextItem);
    importedCount += 1;
    queuedForSyncCount += 1;
  }

  if (importedCount > 0) {
    notifyItemsChanged();
  }

  if (queuedForSyncCount > 0) {
    void runSyncQueue("restore");
  }

  return {
    backupItemCount,
    importedCount,
    queuedForSyncCount,
    skippedEqualLocalCount,
    skippedNewerLocalCount,
    skippedNewerRemoteCount,
    syncedParityCount,
  };
}
