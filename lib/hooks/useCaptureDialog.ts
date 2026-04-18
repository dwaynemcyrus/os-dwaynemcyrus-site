"use client";

import { useState } from "react";

export function useCaptureDialog() {
  const [open, setOpen] = useState(false);

  return {
    closeDialog: () => setOpen(false),
    open,
    openDialog: () => setOpen(true),
    setOpen,
  };
}
