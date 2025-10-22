import styles from '@/styles/ScoreDisplay.module.css';

interface ScoreDisplayProps {
  streak: number;
  highScore: number;
}

export function ScoreDisplay({ streak, highScore }: ScoreDisplayProps) {
  return (
    <div className={styles.scoreDisplay}>
      <div className={styles.scoreItem}>
        <span className={styles.label}>Streak:</span>
        <span className={styles.value} data-testid="streak">{streak}</span>
      </div>
      <div className={styles.scoreItem}>
        <span className={styles.label}>High Score:</span>
        <span className={styles.value} data-testid="high-score">{highScore}</span>
      </div>
    </div>
  );
}
