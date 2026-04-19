"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";

export default function SettingsPage() {
  const captureDialog = useCaptureDialog();

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
    </AppShell>
  );
}
