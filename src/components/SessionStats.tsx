import type { SessionStats as SessionStatsType } from '@/lib/types';
import styles from '@/styles/SessionStats.module.css';

interface SessionStatsProps {
  stats: SessionStatsType;
  accuracy: number;
  duration: number;
  onReset: () => void;
}

/**
 * SessionStats Component
 *
 * Displays session statistics for parent tracking:
 * - Problems attempted
 * - Correct/incorrect counts with accuracy percentage
 * - Session duration
 * - Reset button to clear stats and start fresh
 *
 * Statistics are session-only and not persisted.
 */
export function SessionStats({ stats, accuracy, duration, onReset }: SessionStatsProps) {
  // Format duration for display
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) {
      return '< 1 min';
    }
    return `${minutes.toFixed(1)} min`;
  };

  return (
    <div className={styles.sessionStats}>
      <h2 className={styles.heading}>Session Statistics</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statRow}>
          <span className={styles.label}>Problems Attempted:</span>
          <span className={styles.value}>{stats.problemsAttempted}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.label}>Correct:</span>
          <span className={styles.value}>
            {stats.correctAnswers}
            {stats.problemsAttempted > 0 && (
              <span className={styles.percentage}> ({accuracy}%)</span>
            )}
          </span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.label}>Incorrect:</span>
          <span className={styles.value}>{stats.incorrectAnswers}</span>
        </div>

        <div className={styles.statRow}>
          <span className={styles.label}>Session Time:</span>
          <span className={styles.value}>{formatDuration(duration)}</span>
        </div>
      </div>

      <button
        className={styles.resetButton}
        onClick={onReset}
        aria-label="Reset session statistics"
      >
        Reset Statistics
      </button>
    </div>
  );
}
