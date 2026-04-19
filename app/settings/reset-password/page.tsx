"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { CaptureDialog } from "@/components/capture/CaptureDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { ResetPasswordPanel } from "@/components/settings/ResetPasswordPanel";
import { LABELS } from "@/lib/constants/labels";
import { useCaptureDialog } from "@/lib/hooks/useCaptureDialog";

export default function ResetPasswordPage() {
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
      headerLeft={<BackButton href="/settings" />}
      onFabPress={captureDialog.openDialog}
      title={LABELS.resetPassword}
    >
      <ResetPasswordPanel />
    </AppShell>
  );
}
