export const LABELS = {
  allSynced: "All synced",
  back: "Back",
  capture: "Capture",
  createAccount: "Create account",
  emptyState: "No captured items yet.",
  failed: "Failed",
  offline: "Offline",
  openList: "Open List",
  refreshSync: "Refresh sync",
  save: "Save",
  signIn: "Sign in",
  signInToSync: "Sign in to sync",
  signOut: "Sign out",
  syncing: "Syncing",
  trash: "Trash",
} as const;

export type SyncStatusLabel =
  | typeof LABELS.allSynced
  | typeof LABELS.failed
  | typeof LABELS.offline
  | typeof LABELS.signInToSync
  | typeof LABELS.syncing;
