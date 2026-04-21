import styles from "./ProcessProgress.module.css";

type ProcessProgressProps = {
  remainingCount: number;
};

export function ProcessProgress({ remainingCount }: ProcessProgressProps) {
  return (
    <div className={styles.progress}>
      <p className={styles.progress__eyebrow}>Inbox</p>
      <p className={styles.progress__message}>
        {remainingCount} {remainingCount === 1 ? "item" : "items"} remaining.
      </p>
    </div>
  );
}
