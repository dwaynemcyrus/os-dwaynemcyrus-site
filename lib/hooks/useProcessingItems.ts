"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToItemChanges } from "@/lib/items/itemEvents";
import { getInboxItemsForProcessing } from "@/lib/items/itemQueries";
import type { LocalItem } from "@/lib/items/itemTypes";

export function useProcessingItems() {
  const isMountedRef = useRef(true);
  const itemCountRef = useRef(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<LocalItem[]>([]);

  async function refreshItems() {
    if (itemCountRef.current === 0) {
      setIsLoading(true);
    }

    try {
      const nextItems = await getInboxItemsForProcessing();

      if (!isMountedRef.current) {
        return;
      }

      itemCountRef.current = nextItems.length;
      setItems(nextItems);
      setErrorMessage("");
    } catch (error) {
      if (!isMountedRef.current) {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Could not load the inbox.";

      setErrorMessage(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialItems() {
      try {
        const nextItems = await getInboxItemsForProcessing();

        if (cancelled) {
          return;
        }

        itemCountRef.current = nextItems.length;
        setItems(nextItems);
        setErrorMessage("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Could not load the inbox.";

        setErrorMessage(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialItems();

    const unsubscribe = subscribeToItemChanges(() => {
      void refreshItems();
    });

    return () => {
      cancelled = true;
      isMountedRef.current = false;
      unsubscribe();
    };
  }, []);

  return {
    errorMessage,
    isLoading,
    items,
    refreshItems,
  };
}
