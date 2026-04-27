import { DeleteItemButton } from "./DeleteItemButton";
import { useLinkMetadata } from "@/lib/hooks/useLinkMetadata";
import { deriveItemPresentation } from "@/lib/items/itemPresentation";
import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemMeta } from "./ItemMeta";
import { TrashItemButton } from "./TrashItemButton";
import type { ItemListPresentation } from "./ItemList";
import styles from "./ItemRow.module.css";

type ItemRowProps = {
  item: LocalItem;
  onDelete?: (id: string) => Promise<void> | void;
  presentation?: ItemListPresentation;
  onTrash?: (id: string) => Promise<void> | void;
};

function ProcessedItemContent({ content }: { content: string }) {
  const presentation = deriveItemPresentation(content);
  const { title } = useLinkMetadata(presentation.firstLineUrl);
  const displayTitle = title ?? presentation.titleFallback;

  return (
    <div className={styles.itemRow__contentGroup}>
      <p className={styles.itemRow__title}>{displayTitle}</p>
      {presentation.body ? <p className={styles.itemRow__body}>{presentation.body}</p> : null}
    </div>
  );
}

export function ItemRow({
  item,
  onDelete,
  presentation = "raw",
  onTrash,
}: ItemRowProps) {
  return (
    <article className={styles.itemRow}>
      {presentation === "processed" ? (
        <ProcessedItemContent content={item.content} />
      ) : (
        <p className={styles.itemRow__content}>{item.content}</p>
      )}
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
