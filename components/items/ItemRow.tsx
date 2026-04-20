import { DeleteItemButton } from "./DeleteItemButton";
import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemMeta } from "./ItemMeta";
import { TrashItemButton } from "./TrashItemButton";
import styles from "./ItemRow.module.css";

type ItemRowProps = {
  item: LocalItem;
  onDelete?: (id: string) => Promise<void> | void;
  onTrash?: (id: string) => Promise<void> | void;
};

export function ItemRow({ item, onDelete, onTrash }: ItemRowProps) {
  return (
    <article className={styles.itemRow}>
      <p className={styles.itemRow__content}>{item.content}</p>
      <div className={styles.itemRow__footer}>
        <ItemMeta syncState={item.syncState} />
        <div className={styles.itemRow__actions}>
          {onTrash ? <TrashItemButton onTrash={() => onTrash(item.id)} /> : null}
          {onDelete ? <DeleteItemButton onDelete={() => onDelete(item.id)} /> : null}
        </div>
      </div>
    </article>
  );
}
