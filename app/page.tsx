"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { OpenCalendarButton } from "@/components/navigation/OpenCalendarButton";
import { OpenListButton } from "@/components/navigation/OpenListButton";
import { OpenMediaButton } from "@/components/navigation/OpenMediaButton";
import { OpenProjectsButton } from "@/components/navigation/OpenProjectsButton";
import { OpenProcessButton } from "@/components/navigation/OpenProcessButton";
import { OpenReferenceButton } from "@/components/navigation/OpenReferenceButton";
import { OpenSettingsButton } from "@/components/navigation/OpenSettingsButton";
import { OpenTasksButton } from "@/components/navigation/OpenTasksButton";
import { OpenTrashButton } from "@/components/navigation/OpenTrashButton";
import { OpenWaitingButton } from "@/components/navigation/OpenWaitingButton";
import { OpenWritingButton } from "@/components/navigation/OpenWritingButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function Home() {
  const captureDialog = useCaptureDialog();
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
        onFabPress={captureDialog.openDialog}
        title="Home"
      >
        <SyncStatusBar
          label={label}
          onRefresh={refreshSync}
          refreshDisabled={isSyncing}
          showRefresh={true}
        />
        <OpenSettingsButton />
        <OpenProcessButton />
        <OpenListButton />
        <OpenTasksButton />
        <OpenProjectsButton />
        <OpenWaitingButton />
        <OpenCalendarButton />
        <OpenReferenceButton />
        <OpenMediaButton />
        <OpenWritingButton />
        <OpenTrashButton />
      </AppShell>
    </AuthGate>
  );
}
