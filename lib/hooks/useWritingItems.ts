"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import { getWritingItems } from "@/lib/items/itemQueries";
import type { LocalItem } from "@/lib/items/itemTypes";

export function useWritingItems() {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      const nextItems = await getWritingItems();

      if (cancelled) {
        return;
      }

      setItems(nextItems);
      setIsLoading(false);
    }

    void loadItems();

    const unsubscribe = subscribeToItemChanges(() => {
      void loadItems();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return {
    isLoading,
    items,
  };
}
