"use client";

import { AuthGate } from "@/components/auth/AuthGate";
import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { EmptyState } from "@/components/items/EmptyState";
import { ItemList } from "@/components/items/ItemList";
import { BackButton } from "@/components/navigation/BackButton";
import { SyncStatusBar } from "@/components/sync/SyncStatusBar";
import { LABELS } from "@/lib/constants/labels";
import { getWritingItemRoute } from "@/lib/constants/routes";
import { useCalendarItems } from "@/lib/hooks/useCalendarItems";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";
import { useRefreshSync, useSyncStatus } from "@/lib/hooks/useSyncStatus";
import { useRetrySync } from "@/lib/hooks/useRetrySync";
import { getWritingItemMetaLabel } from "@/lib/writing/itemMeta";

export default function CalendarPage() {
  const captureDialog = useCaptureDialog();
  const { items, isLoading } = useCalendarItems();
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
        title={LABELS.calendar}
      >
        <SyncStatusBar
          label={label}
          onRefresh={refreshSync}
          refreshDisabled={isSyncing}
          showRefresh={true}
        />
        {isLoading ? null : items.length > 0 ? (
          <ItemList
            getItemHref={(item) => getWritingItemRoute(item.id)}
            getMetaLabel={getWritingItemMetaLabel}
            items={items}
            presentation="processed"
          />
        ) : (
          <EmptyState label={LABELS.emptyCalendarState} />
        )}
      </AppShell>
    </AuthGate>
  );
}
