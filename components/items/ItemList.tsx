import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemRow } from "./ItemRow";
import styles from "./ItemList.module.css";

type ItemListProps = {
  items: LocalItem[];
  onTrash: (id: string) => Promise<void> | void;
};

export function ItemList({ items, onTrash }: ItemListProps) {
  return (
    <div className={styles.itemList}>
      {items.map((item) => (
        <ItemRow item={item} key={item.id} onTrash={onTrash} />
      ))}
    </div>
  );
}
