import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemMeta } from "./ItemMeta";
import { TrashItemButton } from "./TrashItemButton";
import styles from "./ItemRow.module.css";

type ItemRowProps = {
  item: LocalItem;
  onTrash: (id: string) => Promise<void> | void;
};

export function ItemRow({ item, onTrash }: ItemRowProps) {
  return (
    <article className={styles.itemRow}>
      <p className={styles.itemRow__content}>{item.content}</p>
      <div className={styles.itemRow__footer}>
        <ItemMeta syncState={item.syncState} />
        <TrashItemButton onTrash={() => onTrash(item.id)} />
      </div>
    </article>
  );
}
