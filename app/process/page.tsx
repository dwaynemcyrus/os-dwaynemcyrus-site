"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { ProcessProgress } from "@/components/processing/ProcessProgress";
import { ProcessWizard } from "@/components/processing/ProcessWizard";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useProcessingItems } from "@/lib/hooks/useProcessingItems";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function ProcessPage() {
  const captureDialog = useCaptureDialog();
  const { hasSession } = useAuthSession();
  const { errorMessage, isLoading, items, refreshItems } = useProcessingItems();
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();
  const currentItem = items[0] ?? null;
  const showProgress = !isLoading && !(errorMessage && !currentItem);

  useRetrySync();

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
      title={LABELS.processInbox}
    >
      <SyncStatusBar
        label={label}
        onRefresh={refreshSync}
        refreshDisabled={isSyncing}
        showRefresh={hasSession}
      />
      {showProgress ? <ProcessProgress remainingCount={items.length} /> : null}
      <ProcessWizard
        errorMessage={errorMessage}
        isLoading={isLoading}
        item={currentItem}
        key={currentItem?.id ?? "empty"}
        onRetryLoad={() => {
          void refreshItems();
        }}
      />
    </AppShell>
  );
}
