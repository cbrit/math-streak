import type { DifficultyConfig, Problem, Operation } from './types';

/**
 * Generate a random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select a random element from an array
 */
function getRandomElement<T>(array: T[]): T {
  return array[getRandomInt(0, array.length - 1)];
}

/**
 * Get the operation symbol for display
 */
function getOperationSymbol(operation: Operation): string {
  switch (operation) {
    case 'addition':
      return '+';
    case 'subtraction':
      return '-';
    case 'multiplication':
      return '×';
    case 'division':
      return '÷';
  }
}

/**
 * Calculate the answer based on operation and operands
 */
function calculateAnswer(operation: Operation, operands: number[]): number {
  switch (operation) {
    case 'addition':
      return operands.reduce((sum, n) => sum + n, 0);
    case 'subtraction':
      return operands.reduce((diff, n, i) => i === 0 ? n : diff - n);
    case 'multiplication':
      return operands.reduce((product, n) => product * n, 1);
    case 'division':
      return operands.reduce((quotient, n, i) => i === 0 ? n : quotient / n);
  }
}

/**
 * Generate operands that satisfy constraints for addition with 'result' unknown
 */
function generateAdditionOperands(config: DifficultyConfig): number[] {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 0, maxOperand = 10 } = constraints;

  // For 2 operands (most common case), use simpler approach for better distribution
  if (operandCount === 2) {
    let operand1: number;
    let operand2: number;
    let attempts = 0;

    // Generate operands until we get a valid combination
    do {
      operand1 = getRandomInt(minOperand, maxOperand);
      operand2 = getRandomInt(minOperand, maxOperand);
      attempts++;

      // Safety check to prevent infinite loop in impossible configurations
      if (attempts > 100) {
        // Fall back to ensuring valid result
        operand1 = getRandomInt(minOperand, Math.min(maxOperand, maxResult));
        operand2 = getRandomInt(minOperand, Math.min(maxOperand, maxResult - operand1));
        break;
      }
    } while (operand1 + operand2 > maxResult);

    return [operand1, operand2];
  }

  // For 3+ operands, use the original sequential generation approach
  const operands: number[] = [];
  let remainingSum = maxResult;

  // Generate operands ensuring the sum doesn't exceed maxResult
  for (let i = 0; i < operandCount; i++) {
    const isLastOperand = i === operandCount - 1;

    if (isLastOperand) {
      // Last operand: use whatever is left, but ensure it's within bounds
      const value = Math.min(remainingSum, maxOperand);
      operands.push(Math.max(minOperand, value));
    } else {
      // Not last operand: pick random value but leave room for remaining operands
      // Each remaining operand needs at least minOperand
      const remainingOperands = operandCount - i - 1;
      const maxPossible = Math.min(
        maxOperand,
        remainingSum - (remainingOperands * minOperand)
      );

      const value = getRandomInt(minOperand, Math.max(minOperand, maxPossible));
      operands.push(value);
      remainingSum -= value;
    }
  }

  // Shuffle to avoid bias toward smaller numbers at the end
  return operands.sort(() => Math.random() - 0.5);
}

/**
 * Generate operands that satisfy constraints for subtraction with 'result' unknown
 * Ensures first operand - second operand = result, where result >= 0 (no negative answers)
 */
function generateSubtractionOperands(config: DifficultyConfig): number[] {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 0, maxOperand = 10 } = constraints;

  if (operandCount !== 2) {
    throw new Error('Subtraction currently only supports 2 operands');
  }

  // Generate result first (what we want the answer to be) - always >= 0
  const result = getRandomInt(minOperand, maxResult);

  // Generate subtrahend (number being subtracted)
  const subtrahend = getRandomInt(minOperand, maxOperand);

  // Calculate minuend to ensure non-negative result
  // minuend - subtrahend = result, so minuend = result + subtrahend
  const minuend = result + subtrahend;

  // Clamp to maxOperand if necessary
  const clampedMinuend = Math.min(minuend, maxOperand);

  // If clamping would make the result negative, adjust subtrahend
  if (clampedMinuend < subtrahend) {
    // Make subtrahend fit within clamped minuend to ensure result >= 0
    const adjustedSubtrahend = Math.min(subtrahend, clampedMinuend);
    return [clampedMinuend, adjustedSubtrahend];
  }

  return [clampedMinuend, subtrahend];
}

/**
 * Generate operands that satisfy constraints for multiplication with 'result' unknown
 * For future use: ensure product <= maxResult
 */
function generateMultiplicationOperands(config: DifficultyConfig): number[] {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 0, maxOperand = 10 } = constraints;

  if (operandCount !== 2) {
    throw new Error('Multiplication currently only supports 2 operands');
  }

  const operands: number[] = [];

  // Generate first operand
  const firstOperand = getRandomInt(minOperand, maxOperand);
  operands.push(firstOperand);

  // Generate second operand ensuring product <= maxResult
  const maxSecondOperand = firstOperand === 0
    ? maxOperand
    : Math.min(maxOperand, Math.floor(maxResult / firstOperand));

  const secondOperand = getRandomInt(minOperand, maxSecondOperand);
  operands.push(secondOperand);

  return operands;
}

/**
 * Generate operands that satisfy constraints for division with 'result' unknown
 * For future use: ensure whole number results and no division by zero
 */
function generateDivisionOperands(config: DifficultyConfig): number[] {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 1, maxOperand = 10 } = constraints;

  if (operandCount !== 2) {
    throw new Error('Division currently only supports 2 operands');
  }

  // Generate quotient (result) first
  const quotient = getRandomInt(Math.max(minOperand, 0), maxResult);

  // Generate divisor (cannot be 0)
  const divisor = getRandomInt(Math.max(minOperand, 1), maxOperand);

  // Calculate dividend to ensure whole number result
  const dividend = quotient * divisor;

  return [dividend, divisor];
}

/**
 * Generate operands based on operation type
 */
function generateOperands(config: DifficultyConfig, operation: Operation): number[] {
  switch (operation) {
    case 'addition':
      return generateAdditionOperands(config);
    case 'subtraction':
      return generateSubtractionOperands(config);
    case 'multiplication':
      return generateMultiplicationOperands(config);
    case 'division':
      return generateDivisionOperands(config);
  }
}

/**
 * Generate display string with unknown position marked as ?
 */
function generateDisplayString(
  operation: Operation,
  operands: number[],
  unknownPosition: string,
  answer: number
): string {
  const symbol = getOperationSymbol(operation);

  // Currently only supports 'result' unknown position
  if (unknownPosition === 'result') {
    // Join operands with operation symbol
    const leftSide = operands.join(` ${symbol} `);
    return `${leftSide} = ?`;
  }

  // Future: Handle operand-N unknown positions
  // Example for 'operand-0': "? + 3 = 7"
  const match = unknownPosition.match(/^operand-(\d+)$/);
  if (match) {
    const unknownIndex = parseInt(match[1], 10);
    const displayParts: string[] = [];

    for (let i = 0; i < operands.length; i++) {
      if (i === unknownIndex) {
        displayParts.push('?');
      } else {
        displayParts.push(operands[i].toString());
      }

      // Add operation symbol after each operand except the last
      if (i < operands.length - 1) {
        displayParts.push(symbol);
      }
    }

    return `${displayParts.join(' ')} = ${answer}`;
  }

  throw new Error(`Unsupported unknown position: ${unknownPosition}`);
}

/**
 * Generate a problem where an operand is unknown (not the result)
 *
 * Strategy: Generate result first, then known operand(s), then calculate unknown operand
 * This ensures all constraints are properly respected
 */
function generateProblemWithUnknownOperand(
  config: DifficultyConfig,
  operation: Operation,
  unknownIndex: number
): { operands: number[]; answer: number } {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 0, maxOperand = 10 } = constraints;

  if (operandCount !== 2) {
    throw new Error('Unknown operand position currently only supports 2 operands');
  }

  let attempts = 0;
  const MAX_ATTEMPTS = 100;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;

    // Step 1: Generate the result (what the equation equals)
    const result = getRandomInt(minOperand, maxResult);

    // Step 2: Generate the known operand
    const knownIndex = 1 - unknownIndex;
    const knownOperand = getRandomInt(minOperand, maxOperand);

    // Step 3: Calculate what the unknown operand must be
    let unknownOperand: number;

    switch (operation) {
      case 'addition':
        // ? + b = r  →  unknown = r - b
        // a + ? = r  →  unknown = r - a
        unknownOperand = result - knownOperand;
        break;

      case 'subtraction':
        if (unknownIndex === 0) {
          // ? - b = r  →  unknown = r + b
          unknownOperand = result + knownOperand;
        } else {
          // a - ? = r  →  unknown = a - r
          unknownOperand = knownOperand - result;
        }
        break;

      case 'multiplication':
        // ? × b = r  →  unknown = r ÷ b
        // a × ? = r  →  unknown = r ÷ a
        if (knownOperand === 0) {
          continue; // Can't divide by zero, try again
        }
        unknownOperand = result / knownOperand;
        // Ensure whole number result
        if (!Number.isInteger(unknownOperand)) {
          continue;
        }
        break;

      case 'division':
        if (unknownIndex === 0) {
          // ? ÷ b = r  →  unknown = r × b
          unknownOperand = result * knownOperand;
        } else {
          // a ÷ ? = r  →  unknown = a ÷ r
          if (result === 0) {
            continue; // Can't divide by zero, try again
          }
          unknownOperand = knownOperand / result;
          // Ensure whole number result
          if (!Number.isInteger(unknownOperand)) {
            continue;
          }
        }
        break;
    }

    // Step 4: Validate that unknown operand is within constraints
    if (unknownOperand < minOperand || unknownOperand > maxOperand) {
      continue; // Out of range, try again
    }

    // Step 5: Build operands array
    const operands: number[] = [];
    operands[unknownIndex] = unknownOperand;
    operands[knownIndex] = knownOperand;

    // Step 6: Verify the equation is correct
    const verification = calculateAnswer(operation, operands);
    if (verification !== result) {
      throw new Error(
        `Generated problem verification failed: ${operands.join(` ${getOperationSymbol(operation)} `)} = ${verification}, expected ${result}`
      );
    }

    return { operands, answer: unknownOperand };
  }

  // Fallback after max attempts
  throw new Error(
    `Could not generate valid problem with unknown at position ${unknownIndex} for ${operation} after ${MAX_ATTEMPTS} attempts. Check constraints.`
  );
}

/**
 * Main export: Generate a complete problem based on difficulty configuration
 */
export function generateProblem(config: DifficultyConfig): Problem {
  // 1. Select random operation from available operations
  const operation = getRandomElement(config.operations);

  // 2. Select random unknown position from available positions
  const unknownPosition = getRandomElement(config.unknownPositions);

  // 3. Generate problem based on unknown position
  let answer: number;
  let operands: number[];

  if (unknownPosition === 'result') {
    // Standard case: the result is unknown (e.g., "3 + 4 = ?")
    operands = generateOperands(config, operation);
    answer = calculateAnswer(operation, operands);
  } else {
    // Unknown is an operand (e.g., "? × 3 = 12")
    const match = unknownPosition.match(/^operand-(\d+)$/);
    if (!match) {
      throw new Error(`Invalid unknown position: ${unknownPosition}`);
    }

    const unknownIndex = parseInt(match[1], 10);
    const generated = generateProblemWithUnknownOperand(config, operation, unknownIndex);
    operands = generated.operands;
    answer = generated.answer;
  }

  // 4. Generate display string
  const displayString = generateDisplayString(operation, operands, unknownPosition, answer);

  // 5. Return complete problem
  return {
    operation,
    operands,
    unknownPosition,
    answer,
    displayString,
  };
}
