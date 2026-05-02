"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { ProcessWizard } from "@/components/processing/ProcessWizard";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { AuthGate } from "@/components/auth/AuthGate";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useProcessingItems } from "@/lib/hooks/useProcessingItems";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function ProcessPage() {
  const captureDialog = useCaptureDialog();
  const { errorMessage, isLoading, items, refreshItems } = useProcessingItems();
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
        title={LABELS.processInbox}
      >
        <SyncStatusBar
          label={label}
          onRefresh={refreshSync}
          refreshDisabled={isSyncing}
          showRefresh={true}
        />
        <ProcessWizard
          errorMessage={errorMessage}
          isLoading={isLoading}
          items={items}
          onRetryLoad={() => {
            void refreshItems();
          }}
        />
      </AppShell>
    </AuthGate>
  );
}
