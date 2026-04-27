import type { LocalItem } from "@/lib/items/itemTypes";

export function getWritingItemMetaLabel(item: LocalItem) {
  return item.status === "waiting" ? `${item.type} · waiting` : item.type;
}
