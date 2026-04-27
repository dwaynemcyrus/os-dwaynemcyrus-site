import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemRow } from "./ItemRow";
import styles from "./ItemList.module.css";

export type ItemListPresentation = "processed" | "raw";

type ItemListProps = {
  items: LocalItem[];
  onDelete?: (id: string) => Promise<void> | void;
  presentation?: ItemListPresentation;
  onTrash?: (id: string) => Promise<void> | void;
};

export function ItemList({
  items,
  onDelete,
  presentation = "raw",
  onTrash,
}: ItemListProps) {
  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <ItemRow
          item={item}
          key={item.id}
          onDelete={onDelete}
          onTrash={onTrash}
          presentation={presentation}
        />
      ))}
    </div>
  );
}
