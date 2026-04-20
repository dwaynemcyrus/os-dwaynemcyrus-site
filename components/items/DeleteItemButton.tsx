"use client";

import { TextButton } from "@/components/primitives/TextButton";
import { LABELS } from "@/lib/constants/labels";

type DeleteItemButtonProps = {
  onDelete: () => Promise<void> | void;
};

export function DeleteItemButton({ onDelete }: DeleteItemButtonProps) {
  return (
    <TextButton onPress={() => void onDelete()} variant="danger">
      {LABELS.delete}
    </TextButton>
  );
}
