import { useEffect } from 'react';
import styles from '@/styles/FeedbackModal.module.css';
import { TIMING } from '@/lib/constants';

interface FeedbackModalProps {
  isVisible: boolean;
  isCorrect: boolean;
  correctAnswer: number;
  currentStreak: number;
  isNewHighScore: boolean;
  onNext: () => void;
}

export function FeedbackModal({
  isVisible,
  isCorrect,
  correctAnswer,
  currentStreak,
  isNewHighScore,
  onNext,
}: FeedbackModalProps) {
  // Auto-advance on correct answer
  useEffect(() => {
    if (isVisible && isCorrect) {
      const timer = setTimeout(() => {
        onNext();
      }, TIMING.AUTO_ADVANCE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isCorrect, onNext]);

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

  if (!isVisible) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={isCorrect ? "celebration-message" : "correct-answer-label"}
    >
      <div className={`${styles.modal} ${isCorrect ? styles.correct : styles.incorrect}`}>
        {isCorrect ? (
          <div className={styles.celebration}>
            <div
              id="celebration-message"
              className={styles.message}
              role="status"
              aria-live="polite"
            >
              Great!
            </div>
          </div>
        ) : (
          <div className={styles.errorContent}>
            <div
              id="correct-answer-label"
              className={styles.correctAnswerLabel}
            >
              The answer is
            </div>
            <div
              className={styles.correctAnswerValue}
              aria-label={`Correct answer: ${correctAnswer}`}
            >
              {correctAnswer}
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
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
