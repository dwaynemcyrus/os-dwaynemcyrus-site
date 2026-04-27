"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import { getWritableItemById } from "@/lib/items/itemQueries";
import type { LocalItem } from "@/lib/items/itemTypes";

export function useWritingItem(itemId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<LocalItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItem() {
      const nextItem = await getWritableItemById(itemId);

      if (cancelled) {
        return;
      }

      setItem(nextItem);
      setIsLoading(false);
    }

    void loadItem();

    const unsubscribe = subscribeToItemChanges(() => {
      void loadItem();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [itemId]);

  return {
    isLoading,
    item,
  };
}
