"use client";

import { useState, useTransition } from "react";
import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { DeleteItemDialog } from "@/components/items/DeleteItemDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useRetrySync } from "@/lib/hooks/useRetrySync";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useTrashedItems } from "@/lib/hooks/useTrashedItems";
import { hardDeleteItem } from "@/lib/items/itemCommands";
import type { LocalItem } from "@/lib/items/itemTypes";

export default function TrashPage() {
  const captureDialog = useCaptureDialog();
  const { hasSession, isReady } = useAuthGuard();
  const { isLoading, items, refreshItems } = useTrashedItems();
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();
  const [pendingDeleteItem, setPendingDeleteItem] = useState<LocalItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  useRetrySync();

  if (!isReady) {
    return null;
  }

  return (
    <AppShell
      dialogSlot={
        <>
          <CaptureDialog
            onCaptured={refreshItems}
            onOpenChange={captureDialog.setOpen}
            open={captureDialog.open}
          />
          <DeleteItemDialog
            isDeleting={isDeleting}
            item={pendingDeleteItem}
            onConfirm={() => {
              if (!pendingDeleteItem) {
                return;
              }

              startDeleteTransition(() => {
                void hardDeleteItem(pendingDeleteItem.id).then(() => {
                  setPendingDeleteItem(null);
                  void refreshItems();
                });
              });
            }}
            onOpenChange={(open) => {
              if (!open) {
                setPendingDeleteItem(null);
              }
            }}
            open={pendingDeleteItem !== null}
          />
        </>
      }
      fabLabel={LABELS.capture}
      headerLeft={<BackButton href="/settings" />}
      onFabPress={captureDialog.openDialog}
      title={LABELS.trash}
    >
      <SyncStatusBar
        label={label}
        onRefresh={refreshSync}
        refreshDisabled={isSyncing}
        showRefresh={hasSession}
      />
      {isLoading ? null : items.length > 0 ? (
        <ItemList
          items={items}
          onDelete={(id) => {
            const item = items.find((entry) => entry.id === id) ?? null;
            setPendingDeleteItem(item);
          }}
        />
      ) : (
        <EmptyState label={LABELS.emptyTrashState} />
      )}
    </AppShell>
  );
}
