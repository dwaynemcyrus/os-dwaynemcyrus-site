export const LABELS = {
  allSynced: "All synced",
  back: "Back",
  capture: "Capture",
  changePassword: "Change password",
  confirmPassword: "Confirm password",
  createAccount: "Create account",
  delete: "Delete",
  emptyState: "No captured items yet.",
  emptyTrashState: "No trashed items.",
  exportBackup: "Export backup",
  exportingBackup: "Exporting...",
  failed: "Failed",
  importRestore: "Import / restore",
  newPassword: "New password",
  offline: "Offline",
  openList: "Open List",
  openTrash: "Open Trash",
  refreshSync: "Refresh sync",
  restoreBackup: "Restore backup",
  save: "Save",
  signIn: "Sign in",
  signInToSync: "Sign in to sync",
  signOut: "Sign out",
  settings: "Settings",
  syncing: "Syncing",
  trash: "Trash",
} as const;

export type SyncStatusLabel =
  | typeof LABELS.allSynced
  | typeof LABELS.failed
  | typeof LABELS.offline
  | typeof LABELS.signInToSync
  | typeof LABELS.syncing;
