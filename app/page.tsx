"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { OpenListButton } from "@/components/navigation/OpenListButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function Home() {
  const captureDialog = useCaptureDialog();
  const { hasSession } = useAuthSession();
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
      onFabPress={captureDialog.openDialog}
      title="Home"
    >
      <SyncStatusBar
        label={label}
        onRefresh={refreshSync}
        refreshDisabled={isSyncing}
        showRefresh={hasSession}
      />
      <AuthPanel />
      <OpenListButton />
    </AppShell>
  );
}
