import type { DifficultyConfig, Problem, Operation } from './types';

/**
 * Pre-computed lookup table: maps each sum to all valid number pairs that add up to it
 * For addition problems with operands 0-10
 */
const ADDITION_PAIRS_BY_SUM: Record<number, [number, number][]> = {
  1: [[0, 1], [1, 0]],
  2: [[0, 2], [2, 0], [1, 1]],
  3: [[0, 3], [3, 0], [1, 2], [2, 1]],
  4: [[0, 4], [4, 0], [1, 3], [3, 1], [2, 2]],
  5: [[0, 5], [5, 0], [1, 4], [4, 1], [2, 3], [3, 2]],
  6: [[0, 6], [6, 0], [1, 5], [5, 1], [2, 4], [4, 2], [3, 3]],
  7: [[0, 7], [7, 0], [1, 6], [6, 1], [2, 5], [5, 2], [3, 4], [4, 3]],
  8: [[0, 8], [8, 0], [1, 7], [7, 1], [2, 6], [6, 2], [3, 5], [5, 3], [4, 4]],
  9: [[0, 9], [9, 0], [1, 8], [8, 1], [2, 7], [7, 2], [3, 6], [6, 3], [4, 5], [5, 4]],
  10: [[0, 10], [10, 0], [1, 9], [9, 1], [2, 8], [8, 2], [3, 7], [7, 3], [4, 6], [6, 4], [5, 5]],
};

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

  // For 2 operands (most common case), use lookup table for instant generation
  if (operandCount === 2) {
    // Pick a random sum from 1 to maxResult
    const sum = getRandomInt(1, maxResult);

    // Lookup all valid pairs for this sum
    const pairs = ADDITION_PAIRS_BY_SUM[sum];

    // Pick a random pair
    const [operand1, operand2] = getRandomElement(pairs);

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
 * For future use: first operand - second operand = result, where result >= 0
 */
function generateSubtractionOperands(config: DifficultyConfig): number[] {
  const { operandCount, constraints } = config;
  const { maxResult, minOperand = 0, maxOperand = 10 } = constraints;

  if (operandCount !== 2) {
    throw new Error('Subtraction currently only supports 2 operands');
  }

  // Generate result first (what we want the answer to be)
  const result = getRandomInt(minOperand, maxResult);

  // Generate subtrahend (number being subtracted)
  const subtrahend = getRandomInt(minOperand, maxOperand);

  // Calculate minuend ensuring it doesn't exceed maxOperand
  const minuend = Math.min(result + subtrahend, maxOperand);

  return [minuend, subtrahend];
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
 * Main export: Generate a complete problem based on difficulty configuration
 */
export function generateProblem(config: DifficultyConfig): Problem {
  // 1. Select random operation from available operations
  const operation = getRandomElement(config.operations);

  // 2. Select random unknown position from available positions
  const unknownPosition = getRandomElement(config.unknownPositions);

  // 3. Generate operands that satisfy constraints
  const operands = generateOperands(config, operation);

  // 4. Calculate the answer
  const answer = calculateAnswer(operation, operands);

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
