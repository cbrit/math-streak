import styles from '@/styles/ProblemDisplay.module.css';

interface ProblemDisplayProps {
  displayString: string;
}

export function ProblemDisplay({ displayString }: ProblemDisplayProps) {
  return (
    <div className={styles.problemDisplay} data-testid="problem">
      {displayString}
    </div>
  );
}
