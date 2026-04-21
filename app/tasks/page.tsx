"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useItemsByTypes } from "@/lib/hooks/useItemsByTypes";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";

export default function TasksPage() {
  const captureDialog = useCaptureDialog();
  const { hasSession } = useAuthSession();
  const { items, isLoading } = useItemsByTypes(["task", "project"]);
  const { isSyncing, label } = useSyncStatus();
  const refreshSync = useRefreshSync();
  const nextActionItems = items.filter((item) => item.type === "task");
  const projectItems = items.filter((item) => item.type === "project");

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
      headerLeft={<BackButton href="/settings" />}
      onFabPress={captureDialog.openDialog}
      title={LABELS.tasks}
    >
      <SyncStatusBar
        label={label}
        onRefresh={refreshSync}
        refreshDisabled={isSyncing}
        showRefresh={hasSession}
      />
      {isLoading ? null : items.length > 0 ? (
        <>
          {nextActionItems.length > 0 ? (
            <>
              <p>Next Actions</p>
              <ItemList items={nextActionItems} />
            </>
          ) : null}
          {projectItems.length > 0 ? (
            <>
              <p>Projects</p>
              <ItemList items={projectItems} />
            </>
          ) : null}
        </>
      ) : (
        <EmptyState label={LABELS.emptyTasksState} />
      )}
    </AppShell>
  );
}
