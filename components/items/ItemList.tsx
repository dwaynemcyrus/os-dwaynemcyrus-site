import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemRow } from "./ItemRow";
import styles from "./ItemList.module.css";

export type ItemListPresentation = "processed" | "raw";

type ItemListProps = {
  getItemHref?: (item: LocalItem) => string;
  getMetaLabel?: (item: LocalItem) => string | undefined;
  items: LocalItem[];
  onDelete?: (id: string) => Promise<void> | void;
  presentation?: ItemListPresentation;
  onTrash?: (id: string) => Promise<void> | void;
};

export function ItemList({
  getItemHref,
  getMetaLabel,
  items,
  onDelete,
  presentation = "raw",
  onTrash,
}: ItemListProps) {
  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <ItemRow
          href={getItemHref?.(item)}
          item={item}
          key={item.id}
          metaLabel={getMetaLabel?.(item)}
          onDelete={onDelete}
          onTrash={onTrash}
          presentation={presentation}
        />
      ))}
    </div>
  );
}
