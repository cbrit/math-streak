import type { DifficultyConfig, Problem, Operation, UnknownPosition } from './types';

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
 * Generate a math problem using simple, straightforward logic
 *
 * Algorithm:
 * 1. Generate two random numbers
 * 2. Pick a random operation from enabled operations
 * 3. If subtraction, ensure larger number is first (no negatives)
 * 4. Calculate the answer
 * 5. Pick a random position to hide (operand-0, operand-1, or result)
 * 6. The hidden value becomes the answer the user must provide
 */
export function generateProblem(config: DifficultyConfig): Problem {
  const { constraints, operations, unknownPositions } = config;
  const { minOperand = 0, maxOperand = 10 } = constraints;

  // Step 1: Randomly select operator
  const operation = getRandomElement(operations);

  // Step 2: Generate first number N (0-10 inclusive)
  let num1 = getRandomInt(minOperand, maxOperand);

  // Step 3: Generate second number M (0-10 inclusive)
  let num2 = getRandomInt(minOperand, maxOperand);

  // Step 4: Apply operator-specific logic
  let result: number;

  if (operation === 'addition') {
    // For addition: clamp num2 so that num1 + num2 <= 10
    num2 = Math.min(num2, maxOperand - num1);
    result = num1 + num2;
  } else if (operation === 'subtraction') {
    // For subtraction: if num2 > num1, swap them (larger number first)
    if (num2 > num1) {
      [num1, num2] = [num2, num1];
    }
    result = num1 - num2;
  } else if (operation === 'multiplication') {
    // For multiplication (future use)
    result = num1 * num2;
  } else {
    // For division (future use)
    if (num2 === 0) {
      num2 = 1; // Avoid division by zero
    }
    result = num1 / num2;
    // If not a whole number, adjust num1 to make it whole
    if (!Number.isInteger(result)) {
      num1 = num2 * getRandomInt(minOperand, Math.min(maxOperand, Math.floor(maxOperand / num2)));
      result = num1 / num2;
    }
  }

  // Store all three values in an array: [operand1, operand2, result]
  const allValues = [num1, num2, result];

  // Step 5: Pick random unknown position from enabled positions
  const unknownPosition = getRandomElement(unknownPositions);

  // Step 6: Determine which value is the answer based on unknown position
  let answer: number;
  let displayNum1: number | string;
  let displayNum2: number | string;
  let displayResult: number | string;

  if (unknownPosition === 'operand-0') {
    // First number is unknown
    answer = num1;
    displayNum1 = '?';
    displayNum2 = num2;
    displayResult = result;
  } else if (unknownPosition === 'operand-1') {
    // Second number is unknown
    answer = num2;
    displayNum1 = num1;
    displayNum2 = '?';
    displayResult = result;
  } else {
    // Result is unknown (default)
    answer = result;
    displayNum1 = num1;
    displayNum2 = num2;
    displayResult = '?';
  }

  // Build display string
  const symbol = getOperationSymbol(operation);
  const displayString = `${displayNum1} ${symbol} ${displayNum2} = ${displayResult}`;

  return {
    operation,
    operands: [num1, num2],
    unknownPosition,
    answer,
    displayString,
  };
}
