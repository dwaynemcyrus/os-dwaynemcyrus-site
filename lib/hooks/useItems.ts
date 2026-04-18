"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import type { LocalItem } from "@/lib/items/itemTypes";
import { getVisibleBacklogItems } from "@/lib/items/itemQueries";

export function useItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);

  async function refreshItems() {
    const nextItems = await getVisibleBacklogItems();
    setItems(nextItems);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialItems() {
      const nextItems = await getVisibleBacklogItems();

      if (cancelled) {
        return;
      }

      setItems(nextItems);
      setIsLoading(false);
    }

    void loadInitialItems();

    const unsubscribe = subscribeToItemChanges(() => {
      void refreshItems();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    isLoading,
    items,
    refreshItems,
  };
}
