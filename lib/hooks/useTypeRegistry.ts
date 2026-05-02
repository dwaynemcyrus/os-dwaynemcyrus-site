"use client";

import { useEffect, useState } from "react";
import { getAllTypeRegistryEntries } from "@/lib/db/typeRegistryRepository";
import { getItemCountsByRegistryType } from "@/lib/items/itemQueries";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import type { LocalTypeRegistryEntry, TypeRegistryKind } from "@/lib/items/itemTypes";
import { ensureSeedTypeRegistry } from "@/lib/registry/typeRegistryCommands";

export type TypeRegistryCount = {
  activeCount: number;
  archivedCount: number;
};

export function useTypeRegistry() {
  const [counts, setCounts] = useState<
    Record<TypeRegistryKind, Map<string, TypeRegistryCount>>
  >({
    creation: new Map(),
    log: new Map(),
    reference: new Map(),
  });
  const [entries, setEntries] = useState<LocalTypeRegistryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRegistry() {
      await ensureSeedTypeRegistry();
      const [nextEntries, referenceCounts, creationCounts, logCounts] =
        await Promise.all([
          getAllTypeRegistryEntries(),
          getItemCountsByRegistryType("reference"),
          getItemCountsByRegistryType("creation"),
          getItemCountsByRegistryType("log"),
        ]);

      if (cancelled) {
        return;
      }

      setEntries(nextEntries.filter((entry) => !entry.needsRemoteDelete));
      setCounts({
        creation: creationCounts,
        log: logCounts,
        reference: referenceCounts,
      });
      setIsLoading(false);
    }

    void loadRegistry();

    const unsubscribe = subscribeToItemChanges(() => {
      void loadRegistry();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    counts,
    entries,
    isLoading,
  };
}
