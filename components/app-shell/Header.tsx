import type { ReactNode } from "react";
import styles from "./Header.module.css";

type HeaderProps = {
  left?: ReactNode;
  right?: ReactNode;
  title: string;
};

export function Header({ left, right, title }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.header__side}>{left}</div>
      <h1 className={styles.header__title}>{title}</h1>
      <div className={styles.header__side}>{right}</div>
    </header>
  );
}
