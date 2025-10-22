import styles from '@/styles/NumberPad.module.css';

interface NumberPadProps {
  onNumberClick: (digit: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  disabled?: boolean;
  activeKey?: string | null;
}

export function NumberPad({
  onNumberClick,
  onBackspace,
  onSubmit,
  disabled = false,
  activeKey = null
}: NumberPadProps) {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className={styles.numberPad}>
      {numbers.map(num => {
        const isActive = activeKey === String(num);
        return (
          <button
            key={num}
            className={`${styles.button} ${styles.numberButton} ${isActive ? styles.keyboardActive : ''}`}
            onClick={() => onNumberClick(String(num))}
            disabled={disabled}
            data-testid={`number-${num}`}
            aria-label={`Number ${num}`}
          >
            {num}
          </button>
        );
      })}

      <button
        className={`${styles.button} ${styles.actionButton} ${activeKey === 'Backspace' ? styles.keyboardActive : ''}`}
        onClick={onBackspace}
        disabled={disabled}
        data-testid="backspace"
        aria-label="Backspace"
      >
        ⌫
      </button>

      <button
        className={`${styles.button} ${styles.numberButton} ${activeKey === '0' ? styles.keyboardActive : ''}`}
        onClick={() => onNumberClick('0')}
        disabled={disabled}
        data-testid="number-0"
        aria-label="Number 0"
      >
        0
      </button>

      <button
        className={`${styles.button} ${styles.actionButton} ${activeKey === 'Enter' ? styles.keyboardActive : ''}`}
        onClick={onSubmit}
        disabled={disabled}
        data-testid="submit"
        aria-label="Submit answer"
      >
        ✓
      </button>
    </div>
  );
}
