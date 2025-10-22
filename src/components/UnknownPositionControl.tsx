import type { UnknownPosition } from '@/lib/types';
import styles from '@/styles/SettingsControls.module.css';

interface UnknownPositionControlProps {
  selected: UnknownPosition;
  onChange: (position: UnknownPosition) => void;
}

// Unknown position display configuration
const POSITIONS: Array<{ value: UnknownPosition; label: string; example: string }> = [
  { value: 'result', label: 'Result', example: '3 + 4 = ?' },
  { value: 'operand-0', label: 'First Number', example: '? + 4 = 7' },
  { value: 'operand-1', label: 'Second Number', example: '3 + ? = 7' },
];

/**
 * Control for selecting where the unknown (?) appears in the math problem.
 *
 * Features:
 * - Single selection via radio buttons
 * - Examples showing how each position looks
 * - Keyboard accessible with proper ARIA labels
 * - Clear visual feedback for selected position
 */
export function UnknownPositionControl({ selected, onChange }: UnknownPositionControlProps) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Unknown Position</legend>
      <div className={styles.radioGroup}>
        {POSITIONS.map(({ value, label, example }) => {
          const isSelected = selected === value;

          return (
            <label
              key={value}
              className={`${styles.radioLabel} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="radio"
                name="unknown-position"
                value={value}
                checked={isSelected}
                onChange={() => onChange(value)}
                className={styles.radio}
                aria-label={`${label}: ${example}`}
              />
              <span className={styles.labelContent}>
                <span className={styles.labelText}>{label}</span>
                <span className={styles.example}>{example}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
