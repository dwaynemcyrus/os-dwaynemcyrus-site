import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemRow } from "./ItemRow";
import styles from "./ItemList.module.css";

type ItemListProps = {
  items: LocalItem[];
  onDelete?: (id: string) => Promise<void> | void;
  onTrash?: (id: string) => Promise<void> | void;
};

export function ItemList({ items, onDelete, onTrash }: ItemListProps) {
  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <ItemRow item={item} key={item.id} onDelete={onDelete} onTrash={onTrash} />
      ))}
    </div>
  );
}
