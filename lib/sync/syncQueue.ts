import { isOnline } from "@/lib/sync/networkState";
import {
  runSyncEngine,
  type SyncRunReason,
  type SyncRunResult,
} from "@/lib/sync/syncEngine";

type SyncListener = (isSyncing: boolean) => void;

let activeRun: Promise<SyncRunResult> | null = null;
const listeners = new Set<SyncListener>();

function notifyListeners() {
  const isSyncing = activeRun !== null;

  listeners.forEach((listener) => {
    listener(isSyncing);
  });
}

export function getIsSyncing() {
  return activeRun !== null;
}

export function subscribeToSyncQueue(listener: SyncListener) {
  listeners.add(listener);
  listener(getIsSyncing());

  return () => {
    listeners.delete(listener);
  };
}

export function runSyncQueue(reason: SyncRunReason) {
  if (activeRun) {
    return activeRun;
  }

  if (!isOnline()) {
    return Promise.resolve({
      attemptedCount: 0,
      failedCount: 0,
      skippedReason: "offline" as const,
      syncedCount: 0,
    });
  }

  activeRun = runSyncEngine(reason).finally(() => {
    activeRun = null;
    notifyListeners();
  });

  notifyListeners();

  return activeRun;
}
