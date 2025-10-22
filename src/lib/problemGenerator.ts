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
 * Calculate the value of an unknown operand given the result and other operands
 *
 * This function solves for the missing operand when the unknown position is not the result.
 * For example: "? × 3 = 12" should return 4 (because 4 × 3 = 12)
 *
 * @param operation - The math operation (addition, subtraction, multiplication, division)
 * @param generatedOperands - The operands array from generation (where one position is actually the result)
 * @param unknownIndex - Which operand position is unknown (0 or 1)
 * @param result - The result value (from generatedOperands[unknownIndex])
 * @returns The correct value for the unknown operand
 */
function calculateUnknownOperand(
  operation: Operation,
  generatedOperands: number[],
  unknownIndex: number,
  result: number
): number {
  // Get the known operand (the other one that isn't unknown)
  const knownOperand = generatedOperands[1 - unknownIndex];

  switch (operation) {
    case 'addition':
      // ? + 3 = 7 → answer = 7 - 3 = 4
      // 3 + ? = 7 → answer = 7 - 3 = 4
      return result - knownOperand;

    case 'subtraction':
      if (unknownIndex === 0) {
        // ? - 3 = 4 → answer = 4 + 3 = 7
        return result + knownOperand;
      } else {
        // 10 - ? = 3 → answer = 10 - 3 = 7
        return generatedOperands[0] - result;
      }

    case 'multiplication':
      // ? × 3 = 12 → answer = 12 ÷ 3 = 4
      // 3 × ? = 12 → answer = 12 ÷ 3 = 4
      return result / knownOperand;

    case 'division':
      if (unknownIndex === 0) {
        // ? ÷ 3 = 4 → answer = 4 × 3 = 12
        return result * knownOperand;
      } else {
        // 12 ÷ ? = 4 → answer = 12 ÷ 4 = 3
        return generatedOperands[0] / result;
      }
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
 * Main export: Generate a complete problem based on difficulty configuration
 */
export function generateProblem(config: DifficultyConfig): Problem {
  // 1. Select random operation from available operations
  const operation = getRandomElement(config.operations);

  // 2. Select random unknown position from available positions
  const unknownPosition = getRandomElement(config.unknownPositions);

  // 3. Generate operands that satisfy constraints (assumes result is unknown)
  const generatedOperands = generateOperands(config, operation);

  // 4. Calculate answer based on unknown position
  let answer: number;
  let operands: number[];

  if (unknownPosition === 'result') {
    // Standard case: the result is unknown (e.g., "3 + 4 = ?")
    operands = generatedOperands;
    answer = calculateAnswer(operation, operands);
  } else {
    // Unknown is an operand (e.g., "? × 3 = 12")
    const match = unknownPosition.match(/^operand-(\d+)$/);
    if (!match) {
      throw new Error(`Invalid unknown position: ${unknownPosition}`);
    }

    const unknownIndex = parseInt(match[1], 10);

    // In the generated operands, the position that should be unknown
    // actually contains the result value (because generators assume result is unknown)
    // Example: For "? × 3 = 12", generatedOperands might be [12, 3]
    const result = generatedOperands[unknownIndex];

    // Calculate what the missing operand should be
    // Example: 12 ÷ 3 = 4, so the answer is 4
    answer = calculateUnknownOperand(operation, generatedOperands, unknownIndex, result);

    // Build the correct operands array with the answer in the right position
    operands = [...generatedOperands];
    operands[unknownIndex] = answer;
  }

  // 5. Generate display string
  const displayString = generateDisplayString(operation, operands, unknownPosition, answer);

  // 6. Return complete problem
  return {
    operation,
    operands,
    unknownPosition,
    answer,
    displayString,
  };
}
