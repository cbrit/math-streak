import styles from '@/styles/ProblemDisplay.module.css';

interface ProblemDisplayProps {
  displayString: string;
  showAnswer?: boolean;
  answer?: number;
  isRevealing?: boolean;
  isTransitioning?: boolean;
  isSlideIn?: boolean;
  includeTestId?: boolean;
}

export function ProblemDisplay({
  displayString,
  showAnswer = false,
  answer,
  isRevealing = false,
  isTransitioning = false,
  isSlideIn = false,
  includeTestId = true
}: ProblemDisplayProps) {
  // Parse the display string to replace "?" with answer if needed
  const parts = displayString.split('?');

  // Determine classes for the container
  const containerClasses = [
    styles.problemDisplay,
    isTransitioning && styles.slideOut,
    isSlideIn && styles.slideIn,
  ].filter(Boolean).join(' ');

  // Determine classes for the answer
  const answerClasses = [
    styles.answerValue,
    isRevealing && styles.answerRevealed,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...(includeTestId && { 'data-testid': 'problem' })}>
      {parts[0]}
      {showAnswer && answer !== undefined ? (
        <span className={answerClasses}>{answer}</span>
      ) : (
        <span>?</span>
      )}
      {parts[1]}
    </div>
  );
}
