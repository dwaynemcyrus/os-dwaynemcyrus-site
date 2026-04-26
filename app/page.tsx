"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell/AppShell";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { OpenListButton } from "@/components/navigation/OpenListButton";
import { OpenProjectsButton } from "@/components/navigation/OpenProjectsButton";
import { OpenProcessButton } from "@/components/navigation/OpenProcessButton";
import { OpenSettingsButton } from "@/components/navigation/OpenSettingsButton";
import { OpenTasksButton } from "@/components/navigation/OpenTasksButton";
import { OpenTrashButton } from "@/components/navigation/OpenTrashButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function Home() {
  const router = useRouter();
  const captureDialog = useCaptureDialog();
  const { hasSession, isLoading } = useAuthSession();
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();

  useRetrySync();

  useEffect(() => {
    if (!isLoading && !hasSession) {
      router.replace("/login");
    }
  }, [isLoading, hasSession, router]);

  if (isLoading || !hasSession) {
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
      <OpenSettingsButton />
      <OpenProcessButton />
      <OpenListButton />
      <OpenTasksButton />
      <OpenProjectsButton />
      <OpenTrashButton />
    </AppShell>
  );
}
