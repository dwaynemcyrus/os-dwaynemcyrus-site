import type { ReactNode } from "react";
import styles from "./ScrollRegion.module.css";

type ScrollRegionProps = {
  children: ReactNode;
};

export function ScrollRegion({ children }: ScrollRegionProps) {
  return (
    <main className={styles.scrollRegion}>
      <div className={styles.scrollRegion__inner}>{children}</div>
    </main>
  );
}
