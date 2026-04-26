"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useItemsByTypes } from "@/lib/hooks/useItemsByTypes";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function NotesPage() {
  const captureDialog = useCaptureDialog();
  const { hasSession, isReady } = useAuthGuard();
  const { items, isLoading } = useItemsByTypes(["reference"]);
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();

  useRetrySync();

  if (!isReady) {
    return null;
  }

  return (
    <AppShell
      dialogSlot={
        <CaptureDialog
          onOpenChange={captureDialog.setOpen}
          open={captureDialog.open}
        />
      }
      fabLabel={LABELS.capture}
      headerLeft={<BackButton />}
      onFabPress={captureDialog.openDialog}
      title={LABELS.notes}
    >
      <SyncStatusBar
        label={label}
        onRefresh={refreshSync}
        refreshDisabled={isSyncing}
        showRefresh={hasSession}
      />
      {isLoading ? null : items.length > 0 ? (
        <ItemList items={items} />
      ) : (
        <EmptyState label={LABELS.emptyNotesState} />
      )}
    </AppShell>
  );
}
