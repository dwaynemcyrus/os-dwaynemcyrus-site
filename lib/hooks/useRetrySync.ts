"use client";

import { useEffect } from "react";
import { subscribeToAuthStateChanges } from "@/lib/supabase/auth";
import { subscribeToNetworkChanges } from "@/lib/sync/networkState";
import { runSyncQueue } from "@/lib/sync/syncQueue";

export function useRetrySync() {
  useEffect(() => {
    void runSyncQueue("app-load");

    const unsubscribe = subscribeToNetworkChanges((isCurrentlyOnline) => {
      if (!isCurrentlyOnline) {
        return;
      }

      void runSyncQueue("reconnect");
    });

    const unsubscribeAuth = subscribeToAuthStateChanges((session) => {
      if (!session) {
        return;
      }

      void runSyncQueue("app-load");
    });

    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") {
        return;
      }

      void runSyncQueue("foreground");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubscribe();
      unsubscribeAuth();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
}
