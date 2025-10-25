import { useMemo, useState, useEffect } from 'react';
import type { Operation } from '@/lib/types';
import styles from '@/styles/TenFrame.module.css';

interface TenFrameProps {
  operands: number[];
  operation: Operation;
  enabled?: boolean;
}

// Bright, high-contrast colors for the ten-frame
const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
] as const;

/**
 * Randomly selects two distinct colors from the palette
 */
function selectColors(): [string, string] {
  const shuffled = [...COLOR_PALETTE].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

/**
 * TenFrame - Visual learning aid for addition problems
 *
 * Displays a row of 10 squares with:
 * - First operand colored with color 1
 * - Second operand colored with color 2
 * - Remaining squares unfilled (white)
 * - Thicker divider between squares 5 and 6
 * - Hidden by default with "Show hint" button to reveal
 *
 * Only renders for addition problems with sum ≤ 10
 */
export function TenFrame({ operands, operation, enabled = true }: TenFrameProps) {
  // Don't render if disabled or not addition
  if (!enabled || operation !== 'addition') {
    return null;
  }

  // Don't render if we can't properly display (edge cases)
  if (operands.length !== 2) {
    return null;
  }

  // Track visibility of the ten-frame
  const [isVisible, setIsVisible] = useState(false);

  // Reset visibility when problem changes (operands change)
  useEffect(() => {
    setIsVisible(false);
  }, [operands[0], operands[1]]);

  // Generate random colors once per problem render
  const [color1, color2] = useMemo(() => selectColors(), [operands[0], operands[1]]);

  const squares = [];
  let filledCount = 0;

  for (let i = 0; i < 10; i++) {
    let backgroundColor = 'white';

    // Fill first operand with color 1
    if (filledCount < operands[0]) {
      backgroundColor = color1;
    }
    // Fill second operand with color 2
    else if (filledCount < operands[0] + operands[1]) {
      backgroundColor = color2;
    }

    filledCount++;

    // Add thicker border between 5th and 6th squares (centered)
    const hasThickDividerRight = i === 4; // Right side of 5th square
    const hasThickDividerLeft = i === 5;  // Left side of 6th square

    const classNames = [styles.square];
    if (hasThickDividerRight) classNames.push(styles.thickDivider);
    if (hasThickDividerLeft) classNames.push(styles.thickDividerStart);

    squares.push(
      <div
        key={i}
        className={classNames.join(' ')}
        style={{ backgroundColor }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={styles.tenFrameContainer}>
      {!isVisible ? (
        <button
          className={styles.hintButton}
          onClick={() => setIsVisible(true)}
          type="button"
          aria-label="Show hint using ten-frame"
        >
          Show hint
        </button>
      ) : (
        <div className={styles.tenFrame} role="img" aria-label={`Ten frame showing ${operands[0]} plus ${operands[1]}`}>
          {squares}
        </div>
      )}
    </div>
  );
}
