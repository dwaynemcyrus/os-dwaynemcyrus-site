"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "./useAuthSession";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { hasSession, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !hasSession) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, hasSession, pathname, router]);

  return {
    hasSession,
    isReady: !isLoading && hasSession,
  };
}
