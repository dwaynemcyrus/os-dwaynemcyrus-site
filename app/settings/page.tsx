"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { RestoreBackupPanel } from "@/components/settings/RestoreBackupPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { LABELS } from "@/lib/constants/labels";
import { useAuthGuard } from "@/lib/hooks/useAuthGuard";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";

export default function SettingsPage() {
  const captureDialog = useCaptureDialog();
  const { isReady } = useAuthGuard();

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
      title={LABELS.settings}
    >
      <SettingsPanel />
      <RestoreBackupPanel />
    </AppShell>
  );
}
