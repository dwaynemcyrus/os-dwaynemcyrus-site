import type { LocalItem } from "@/lib/items/itemTypes";

export function getWritingItemMetaLabel(item: LocalItem) {
  const typeLabel = item.type ?? item.kind;
  return item.status === "waiting" ? `${typeLabel} · waiting` : typeLabel;
}
