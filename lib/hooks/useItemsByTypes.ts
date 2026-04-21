"use client";

import { useEffect, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import { getItemsByTypes } from "@/lib/items/itemQueries";
import type { ItemType, LocalItem } from "@/lib/items/itemTypes";

export function useItemsByTypes(types: ItemType[]) {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);
  const typeKey = types.join("|");

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      const stableTypes = typeKey.split("|") as ItemType[];
      const nextItems = await getItemsByTypes(stableTypes);

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
  }, [typeKey]);

  return {
    isLoading,
    items,
  };
}
