"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { TextButton } from "@/components/primitives/TextButton";
import type { LocalItem } from "@/lib/items/itemTypes";
import { LABELS } from "@/lib/constants/labels";
import styles from "./DeleteItemDialog.module.css";

type DeleteItemDialogProps = {
  isDeleting: boolean;
  item: LocalItem | null;
  onConfirm: () => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function DeleteItemDialog({
  isDeleting,
  item,
  onConfirm,
  onOpenChange,
  open,
}: DeleteItemDialogProps) {
  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.deleteItemDialog__overlay} />
        <Dialog.Content className={styles.deleteItemDialog__content}>
          <Dialog.Title className={styles.deleteItemDialog__title}>
            Delete permanently
          </Dialog.Title>
          <Dialog.Description className={styles.deleteItemDialog__description}>
            {item
              ? "This removes the item from the app immediately and deletes it from Supabase in the background. This action cannot be undone."
              : "Select a trashed item before trying to delete it permanently."}
          </Dialog.Description>
          {item ? (
            <p className={styles.deleteItemDialog__preview}>{item.content}</p>
          ) : null}
          <div className={styles.deleteItemDialog__actions}>
            <TextButton onPress={() => onOpenChange(false)} variant="ghost">
              {LABELS.back}
            </TextButton>
            <TextButton
              disabled={!item || isDeleting}
              onPress={() => {
                void onConfirm();
              }}
              variant="danger"
            >
              {LABELS.delete}
            </TextButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
