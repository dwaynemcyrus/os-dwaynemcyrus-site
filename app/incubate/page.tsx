"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useItemsByTypes } from "@/lib/hooks/useItemsByTypes";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function IncubatePage() {
  const captureDialog = useCaptureDialog();
  const { items, isLoading } = useItemsByTypes(["incubate"]);
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();

  useRetrySync();

  return (
    <AuthGate>
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
        title={LABELS.incubate}
      >
        <SyncStatusBar
          label={label}
          onRefresh={refreshSync}
          refreshDisabled={isSyncing}
          showRefresh={true}
        />
        {isLoading ? null : items.length > 0 ? (
          <ItemList items={items} presentation="processed" />
        ) : (
          <EmptyState label={LABELS.emptyIncubateState} />
        )}
      </AppShell>
    </AuthGate>
  );
}
