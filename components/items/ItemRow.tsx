import Link from "next/link";
import { DeleteItemButton } from "./DeleteItemButton";
import { useLinkMetadata } from "@/lib/hooks/useLinkMetadata";
import { deriveItemPresentation } from "@/lib/items/itemPresentation";
import type { LocalItem } from "@/lib/items/itemTypes";
import { ItemMeta } from "./ItemMeta";
import { TrashItemButton } from "./TrashItemButton";
import type { ItemListPresentation } from "./ItemList";
import styles from "./ItemRow.module.css";

type ItemRowProps = {
  href?: string;
  item: LocalItem;
  metaLabel?: string;
  onDelete?: (id: string) => Promise<void> | void;
  presentation?: ItemListPresentation;
  onTrash?: (id: string) => Promise<void> | void;
};

function ProcessedItemContent({
  content,
  href,
}: {
  content: string;
  href?: string;
}) {
  const presentation = deriveItemPresentation(content);
  const { title } = useLinkMetadata(presentation.firstLineUrl);
  const displayTitle = title ?? presentation.titleFallback;
  const titleNode = href ? (
    <Link className={styles.itemRow__link} href={href}>
      {displayTitle}
    </Link>
  ) : (
    displayTitle
  );

  return (
    <div className={styles.itemRow__contentGroup}>
      <p className={styles.itemRow__title}>{titleNode}</p>
      {presentation.body ? <p className={styles.itemRow__body}>{presentation.body}</p> : null}
    </div>
  );
}

export function ItemRow({
  href,
  item,
  metaLabel,
  onDelete,
  presentation = "raw",
  onTrash,
}: ItemRowProps) {
  return (
    <article className={styles.itemRow}>
      {presentation === "processed" ? (
        <ProcessedItemContent content={item.content} href={href} />
      ) : (
        <p className={styles.itemRow__content}>{item.content}</p>
      )}
      <div className={styles.itemRow__footer}>
        <ItemMeta detail={metaLabel} syncState={item.syncState} />
        <div className={styles.itemRow__actions}>
          {onTrash ? <TrashItemButton onTrash={() => onTrash(item.id)} /> : null}
          {onDelete ? <DeleteItemButton onDelete={() => onDelete(item.id)} /> : null}
        </div>
      </div>
    </article>
  );
}
