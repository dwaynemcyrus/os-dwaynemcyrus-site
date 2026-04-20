"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import type { LocalItem } from "@/lib/items/itemTypes";
import { getTrashedBacklogItems } from "@/lib/items/itemQueries";

export function useTrashedItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);

  async function refreshItems() {
    const nextItems = await getTrashedBacklogItems();
    setItems(nextItems);
    setIsLoading(false);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialItems() {
      const nextItems = await getTrashedBacklogItems();

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
