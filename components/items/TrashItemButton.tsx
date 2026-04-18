"use client";

import { LABELS } from "@/lib/constants/labels";
import { TextButton } from "@/components/primitives/TextButton";

type TrashItemButtonProps = {
  onTrash: () => Promise<void> | void;
};

export function TrashItemButton({ onTrash }: TrashItemButtonProps) {
  return (
    <TextButton onPress={() => void onTrash()} variant="ghost">
      {LABELS.trash}
    </TextButton>
  );
}
