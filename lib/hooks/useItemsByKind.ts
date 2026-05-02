"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import { getItemsByKind } from "@/lib/items/itemQueries";
import type { ItemKind, LocalItem } from "@/lib/items/itemTypes";

export function useItemsByKind(kind: ItemKind) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      const nextItems = await getItemsByKind(kind);

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
  }, [kind]);

  return {
    isLoading,
    items,
  };
}
