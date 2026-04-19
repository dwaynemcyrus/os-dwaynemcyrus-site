import type { RemoteItemRecord } from "@/lib/items/itemMappers";
import { getAuthenticatedUserId } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type ExportBackupItem = {
  content: string;
  createdAt: string;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  id: string;
  isTrashed: boolean;
  lastSyncedAt: string | null;
  status: string;
  syncState: string;
  trashedAt: string | null;
  type: string;
  updatedAt: string;
  userId: string;
};

export type ExportBackupPayload = {
  exportedAt: string;
  format: "psa-backup.v1";
  items: ExportBackupItem[];
  source: "supabase";
  userId: string;
};

export type ExportBackupResult = {
  exportedAt: string;
  filename: string;
  itemCount: number;
};

const EXPORT_COLUMNS = [
  "id",
  "user_id",
  "content",
  "type",
  "status",
  "created_at",
  "updated_at",
  "device_created_at",
  "device_updated_at",
  "sync_state",
  "last_synced_at",
  "is_trashed",
  "trashed_at",
].join(", ");

function mapRemoteRecordToExportItem(record: RemoteItemRecord): ExportBackupItem {
  return {
    content: record.content,
    createdAt: record.created_at,
    deviceCreatedAt: record.device_created_at,
    deviceUpdatedAt: record.device_updated_at,
    id: record.id,
    isTrashed: record.is_trashed,
    lastSyncedAt: record.last_synced_at,
    status: record.status,
    syncState: record.sync_state,
    trashedAt: record.trashed_at,
    type: record.type,
    updatedAt: record.updated_at,
    userId: record.user_id,
  };
}

function createBackupFilename(exportedAt: string) {
  const timestamp = exportedAt
    .replaceAll(":", "")
    .replaceAll(".", "")
    .replace("T", "-");

  return `psa-backup-${timestamp}.json`;
}

function downloadBackupPayload(filename: string, payload: ExportBackupPayload) {
  if (typeof document === "undefined" || typeof URL === "undefined") {
    throw new Error("Backup export is only available in the browser.");
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

export async function exportAuthenticatedBackup(): Promise<ExportBackupResult> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error("You must be signed in to export a backup.");
  }

  const { data, error } = await supabase
    .from("items")
    .select(EXPORT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .returns<RemoteItemRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  const exportedAt = new Date().toISOString();
  const records = data ?? [];
  const payload: ExportBackupPayload = {
    exportedAt,
    format: "psa-backup.v1",
    items: records.map(mapRemoteRecordToExportItem),
    source: "supabase",
    userId,
  };
  const filename = createBackupFilename(exportedAt);

  downloadBackupPayload(filename, payload);

  return {
    exportedAt,
    filename,
    itemCount: payload.items.length,
  };
}
