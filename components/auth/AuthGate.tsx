"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/hooks/useAuthSession";
import styles from "./AuthGate.module.css";

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasSession, isLoading } = useAuthSession();

  useEffect(() => {
    if (!isLoading && !hasSession) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, hasSession, pathname, router]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <p className={styles.loading__message}>Loading</p>
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return <>{children}</>;
}
