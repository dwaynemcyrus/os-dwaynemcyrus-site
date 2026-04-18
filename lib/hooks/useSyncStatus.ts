"use client";

import { useEffect, useState } from "react";
import { LABELS, type SyncStatusLabel } from "@/lib/constants/labels";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import {
  deriveSyncStatusLabel,
  getSyncCounts,
} from "@/lib/items/itemQueries";
import { getCurrentSession, subscribeToAuthStateChanges } from "@/lib/supabase/auth";
import { isOnline, subscribeToNetworkChanges } from "@/lib/sync/networkState";
import { getIsSyncing, subscribeToSyncQueue } from "@/lib/sync/syncQueue";

type SyncStatusState = {
  failedCount: number;
  hasAuthSession: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  label: SyncStatusLabel;
  pendingCount: number;
};

function createDefaultState(): SyncStatusState {
  return {
    failedCount: 0,
    hasAuthSession: false,
    isOnline: isOnline(),
    isSyncing: getIsSyncing(),
    label: LABELS.allSynced,
    pendingCount: 0,
  };
}

async function readSyncStatusState(): Promise<SyncStatusState> {
  const counts = await getSyncCounts();
  const session = await getCurrentSession();
  const isCurrentlyOnline = isOnline();
  const isCurrentlySyncing = getIsSyncing();
  const hasAuthSession = Boolean(session);

  return {
    failedCount: counts.failedCount,
    hasAuthSession,
    isOnline: isCurrentlyOnline,
    isSyncing: isCurrentlySyncing,
    label: deriveSyncStatusLabel({
      failedCount: counts.failedCount,
      hasAuthSession,
      isOnline: isCurrentlyOnline,
      isSyncing: isCurrentlySyncing,
      pendingCount: counts.pendingCount,
    }),
    pendingCount: counts.pendingCount,
  };
}

export function useSyncStatus() {
  const [state, setState] = useState<SyncStatusState>(() => createDefaultState());

  useEffect(() => {
    let cancelled = false;

    async function refreshStatus() {
      const nextState = await readSyncStatusState();

      if (cancelled) {
        return;
      }

      setState(nextState);
    }

    void refreshStatus();

    const unsubscribeItems = subscribeToItemChanges(() => {
      void refreshStatus();
    });

    const unsubscribeQueue = subscribeToSyncQueue(() => {
      void refreshStatus();
    });

    const unsubscribeNetwork = subscribeToNetworkChanges(() => {
      void refreshStatus();
    });

    const unsubscribeAuth = subscribeToAuthStateChanges(() => {
      void refreshStatus();
    });

    return () => {
      cancelled = true;
      unsubscribeItems();
      unsubscribeQueue();
      unsubscribeNetwork();
      unsubscribeAuth();
    };
  }, []);

  return state;
}
