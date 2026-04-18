import type { ReactNode } from "react";
import { FloatingActionBar } from "./FloatingActionBar";
import { Header } from "./Header";
import { ScrollRegion } from "./ScrollRegion";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
  dialogSlot?: ReactNode;
  fabDisabled?: boolean;
  fabLabel: string;
  onFabPress?: () => void;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
  title: string;
};

export function AppShell({
  children,
  dialogSlot,
  fabDisabled = false,
  fabLabel,
  headerLeft,
  headerRight,
  onFabPress,
  title,
}: AppShellProps) {
  return (
    <div className={styles.shell}>
      <Header left={headerLeft} right={headerRight} title={title} />
      <ScrollRegion>{children}</ScrollRegion>
      <FloatingActionBar
        disabled={fabDisabled}
        label={fabLabel}
        onPress={onFabPress}
      />
      {dialogSlot ? <div className={styles.shell__dialog}>{dialogSlot}</div> : null}
    </div>
  );
}
