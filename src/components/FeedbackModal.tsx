import { useEffect } from 'react';
import styles from '@/styles/FeedbackModal.module.css';
import { TIMING } from '@/lib/constants';

interface FeedbackModalProps {
  isVisible: boolean;
  isCorrect: boolean;
  correctAnswer: number;
  currentStreak: number;
  isNewHighScore: boolean;
  problemDisplayString: string;
  onNext: () => void;
}

export function FeedbackModal({
  isVisible,
  isCorrect,
  correctAnswer,
  currentStreak,
  isNewHighScore,
  problemDisplayString,
  onNext,
}: FeedbackModalProps) {
  // Focus Next button when incorrect answer is shown
  useEffect(() => {
    if (isVisible && !isCorrect) {
      const nextButton = document.querySelector<HTMLButtonElement>('[data-testid="next-button"]');
      if (nextButton) {
        // Small delay to ensure modal is fully rendered
        setTimeout(() => nextButton.focus(), 100);
      }
    }
  }, [isVisible, isCorrect]);

  // Modal only shows for incorrect answers now
  if (!isVisible) return null;
  if (isCorrect) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="correct-answer-label"
    >
      <div className={`${styles.modal} ${styles.incorrect}`}>
        <div className={styles.errorContent}>
          <div
            id="correct-answer-label"
            className={styles.correctAnswerLabel}
            aria-label={`Correct equation: ${problemDisplayString.replace('?', String(correctAnswer))}`}
          >
            {problemDisplayString.split('?')[0]}
            <span className={styles.correctAnswerValue}>
              {correctAnswer}
            </span>
            {problemDisplayString.split('?')[1]}
          </div>

          <div
            className={styles.streakInfo}
            role="status"
          >
            Streak: {currentStreak}
          </div>

          {isNewHighScore && (
            <div
              className={styles.highScoreBadge}
              role="status"
              aria-live="polite"
            >
              New High Score!
            </div>
          )}

          <button
            className={styles.nextButton}
            onClick={onNext}
            data-testid="next-button"
            aria-label="Continue to next problem"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
