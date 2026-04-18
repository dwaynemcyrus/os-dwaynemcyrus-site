export const DEFAULT_ITEM_TYPE = "unknown";
export const DEFAULT_ITEM_STATUS = "backlog";
export const DEFAULT_SYNC_STATE = "pending_sync";
export const LOCAL_USER_ID = "local-user";

export type ItemType =
  | "content"
  | "idea"
  | "journal"
  | "reference"
  | "someday"
  | "task"
  | "unknown";

export type ItemStatus = "backlog";

export type SyncState = "pending_sync" | "sync_error" | "synced";

export type LocalItem = {
  content: string;
  createdAt: string;
  deviceCreatedAt: string;
  deviceUpdatedAt: string;
  id: string;
  isTrashed: boolean;
  lastSyncedAt: string | null;
  needsRemoteCreate: boolean;
  needsRemoteUpdate: boolean;
  status: ItemStatus;
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
