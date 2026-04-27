export const DEFAULT_ITEM_TYPE = "unknown";
export const DEFAULT_ITEM_STATUS = "backlog";
export const DEFAULT_SYNC_STATE = "pending_sync";
export const LOCAL_USER_ID = "local-user";
export const WRITING_OS_TYPES = [
  "task",
  "project",
  "reference",
  "media",
  "incubate",
] as const;
export const WRITING_OS_STATUSES = ["backlog", "waiting"] as const;
export const WRITING_ITEM_SUBTYPES = [
  "article",
  "book",
  "note",
  "podcast",
  "video",
] as const;

export type ItemType =
  | "content"
  | "idea"
  | "incubate"
  | "journal"
  | "media"
  | "project"
  | "reference"
  | "task"
  | "unknown";

export type ItemSubtype = "article" | "book" | "note" | "podcast" | "video";

export type ItemStatus = "backlog" | "waiting";

export type SyncState = "pending_sync" | "sync_error" | "synced";

export type LocalItem = {
  content: string;
  createdAt: string;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  documentFrontmatter: string | null;
  endAt: string | null;
  id: string;
  isTrashed: boolean;
  lastSyncedAt: string | null;
  needsRemoteCreate: boolean;
  needsRemoteDelete: boolean;
  needsRemoteUpdate: boolean;
  startAt: string | null;
  status: ItemStatus;
  subtype: ItemSubtype | null;
  syncErrorMessage: string | null;
  syncState: SyncState;
  trashedAt: string | null;
  type: ItemType;
  updatedAt: string;
  userId: string;
};

export type CreateLocalItemInput = {
  content: string;
};

export function normalizeItemType(value: string): ItemType {
  switch (value) {
    case "content":
    case "idea":
    case "incubate":
    case "journal":
    case "media":
    case "project":
    case "reference":
    case "task":
    case "unknown":
      return value;
    case "someday":
      return "incubate";
    default:
      return "unknown";
  }
}

export function normalizeItemSubtype(value: string | null | undefined): ItemSubtype | null {
  switch (value) {
    case "article":
    case "book":
    case "note":
    case "podcast":
    case "video":
      return value;
    default:
      return null;
  }
}

export function normalizeItemStatus(value: string | null | undefined): ItemStatus {
  switch (value) {
    case "waiting":
      return "waiting";
    default:
      return "backlog";
  }
}
