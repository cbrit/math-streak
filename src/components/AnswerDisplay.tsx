import styles from '@/styles/AnswerDisplay.module.css';

interface AnswerDisplayProps {
  answer: string;
}

export function AnswerDisplay({ answer }: AnswerDisplayProps) {
  return (
    <div
      className={styles.answerDisplay}
      data-testid="answer-display"
    >
      {answer || <span className={styles.placeholder}>?</span>}
    </div>
  );
}
