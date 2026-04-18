"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./TextButton.module.css";

type TextButtonVariant = "danger" | "fab" | "ghost" | "primary" | "secondary";

type TextButtonProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  onPress?: () => void;
  type?: "button" | "submit";
  variant?: TextButtonVariant;
};

function getClassName(
  variant: TextButtonVariant,
  disabled: boolean,
  className?: string,
) {
  return [
    styles.button,
    styles[`button--${variant}`],
    disabled ? styles["button--disabled"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function TextButton({
  ariaLabel,
  children,
  className,
  disabled = false,
  href,
  onPress,
  type = "button",
  variant = "primary",
}: TextButtonProps) {
  const resolvedClassName = getClassName(variant, disabled, className);

  if (href) {
    return (
      <Link aria-label={ariaLabel} className={resolvedClassName} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={resolvedClassName}
      disabled={disabled}
      onClick={onPress}
      type={type}
    >
      {children}
    </button>
  );
}
