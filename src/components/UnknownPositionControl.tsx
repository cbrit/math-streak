import type { UnknownPosition } from '@/lib/types';
import styles from '@/styles/SettingsControls.module.css';

interface UnknownPositionControlProps {
  selected: UnknownPosition[];
  onChange: (positions: UnknownPosition[]) => void;
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
 * - Multiple selection via checkboxes
 * - At least one position must always be selected
 * - Examples showing how each position looks
 * - Keyboard accessible with proper ARIA labels
 * - Clear visual feedback for selected positions
 */
export function UnknownPositionControl({ selected, onChange }: UnknownPositionControlProps) {
  const handleToggle = (position: UnknownPosition) => {
    const isCurrentlySelected = selected.includes(position);

    if (isCurrentlySelected) {
      // Only allow deselection if there are other positions selected
      if (selected.length > 1) {
        onChange(selected.filter(p => p !== position));
      }
      // If this is the last selected position, do nothing (keep at least one selected)
    } else {
      // Add to selection
      onChange([...selected, position]);
    }
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Unknown Position</legend>
      <div className={styles.checkboxGroup}>
        {POSITIONS.map(({ value, label, example }) => {
          const isSelected = selected.includes(value);

          return (
            <label
              key={value}
              className={`${styles.checkboxLabel} ${isSelected ? styles.selected : ''}`}
            >
              <input
                type="checkbox"
                name="unknown-position"
                value={value}
                checked={isSelected}
                onChange={() => handleToggle(value)}
                className={styles.checkbox}
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
