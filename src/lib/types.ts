// Operations the game can support
export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division';

// Position of the unknown value in the problem
export type UnknownPosition = 'result' | `operand-${number}`;

// A math problem to solve
export interface Problem {
  operation: Operation;
  operands: number[];
  unknownPosition: UnknownPosition;
  answer: number;
  displayString: string; // e.g., "3 + 4 = ?"
}

// Configuration for difficulty level
export interface DifficultyConfig {
  name: string;
  operations: Operation[];
  operandCount: number;
  unknownPositions: UnknownPosition[];
  constraints: {
    maxResult: number;
    minOperand?: number;
    maxOperand?: number;
    allowZero?: boolean;
  };
}

// Celebration animation phases
export type CelebrationPhase = null | 'revealing' | 'transitioning';

// Game state
export interface GameState {
  currentProblem: Problem;
  currentAnswer: string;
  isAnswerCorrect: boolean | null;
  celebrationPhase: CelebrationPhase;
}

// Feedback types
export type FeedbackType = 'correct' | 'incorrect' | null;
