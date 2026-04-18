"use client";

import { useTransition } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useItems } from "@/lib/hooks/useItems";
import { useRetrySync } from "@/lib/hooks/useRetrySync";
import { useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { trashItem } from "@/lib/items/itemCommands";

export default function ListPage() {
  const captureDialog = useCaptureDialog();
  const { isLoading, items, refreshItems } = useItems();
  const { label } = useSyncStatus();
  const [, startTransition] = useTransition();

  useRetrySync();

  return (
    <AppShell
      dialogSlot={
        <CaptureDialog
          onCaptured={refreshItems}
          onOpenChange={captureDialog.setOpen}
          open={captureDialog.open}
        />
      }
      fabLabel={LABELS.capture}
      headerLeft={<BackButton />}
      onFabPress={captureDialog.openDialog}
      title="Captured Items"
    >
      <SyncStatusBar label={label} />
      {isLoading ? null : items.length > 0 ? (
        <ItemList
          items={items}
          onTrash={async (id) => {
            await trashItem(id);
            startTransition(() => {
              void refreshItems();
            });
          }}
        />
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
}
