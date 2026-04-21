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
  const { isLoading, items } = useProcessingItems();
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();

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
      <ProcessProgress remainingCount={items.length} />
      <ProcessWizard
        isLoading={isLoading}
        item={items[0] ?? null}
        key={items[0]?.id ?? "empty"}
      />
    </AppShell>
  );
}
