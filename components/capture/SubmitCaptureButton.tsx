"use client";

import { LABELS } from "@/lib/constants/labels";
import { TextButton } from "@/components/primitives/TextButton";

type SubmitCaptureButtonProps = {
  disabled?: boolean;
};

export function SubmitCaptureButton({
  disabled = false,
}: SubmitCaptureButtonProps) {
  return (
    <TextButton disabled={disabled} type="submit" variant="primary">
      {LABELS.save}
    </TextButton>
  );
}
