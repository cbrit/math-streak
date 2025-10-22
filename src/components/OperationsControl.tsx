import type { Operation } from '@/lib/types';
import styles from '@/styles/SettingsControls.module.css';

interface OperationsControlProps {
  selected: Operation[];
  onChange: (operations: Operation[]) => void;
}

// Operation display configuration
const OPERATIONS: Array<{ value: Operation; label: string; symbol: string }> = [
  { value: 'addition', label: 'Addition', symbol: '+' },
  { value: 'subtraction', label: 'Subtraction', symbol: '−' },
  { value: 'multiplication', label: 'Multiplication', symbol: '×' },
  { value: 'division', label: 'Division', symbol: '÷' },
];

/**
 * Control for selecting which math operations to include in the game.
 *
 * Features:
 * - Multiple selection via checkboxes
 * - Prevents unchecking the last selected operation (minimum 1 required)
 * - Keyboard accessible with proper ARIA labels
 * - Clear visual feedback for selected operations
 */
export function OperationsControl({ selected, onChange }: OperationsControlProps) {
  const handleCheckboxChange = (operation: Operation) => {
    const isCurrentlySelected = selected.includes(operation);

    if (isCurrentlySelected) {
      // Prevent unchecking if this is the last selected operation
      if (selected.length === 1) {
        return;
      }

      // Remove this operation from selected list
      onChange(selected.filter(op => op !== operation));
    } else {
      // Add this operation to selected list
      onChange([...selected, operation]);
    }
  };

  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Math Operations</legend>
      <div className={styles.checkboxGroup}>
        {OPERATIONS.map(({ value, label, symbol }) => {
          const isSelected = selected.includes(value);
          const isDisabled = isSelected && selected.length === 1;

          return (
            <label
              key={value}
              className={`${styles.checkboxLabel} ${isDisabled ? styles.disabled : ''}`}
              title={isDisabled ? 'At least one operation must be selected' : ''}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCheckboxChange(value)}
                disabled={isDisabled}
                className={styles.checkbox}
                aria-label={`${label} (${symbol})`}
              />
              <span className={styles.labelText}>
                {label} <span className={styles.symbol}>({symbol})</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
