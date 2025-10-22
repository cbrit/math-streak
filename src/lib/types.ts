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
  };
}

// Celebration animation phases
export type CelebrationPhase = null | 'revealing' | 'transitioning';

// Game state
export interface GameState {
  currentProblem: Problem;
  currentAnswer: string;
  streak: number;
  highScore: number;
  isAnswerCorrect: boolean | null;
  showFeedback: boolean;
  celebrationPhase: CelebrationPhase;
}

// Feedback types
export type FeedbackType = 'correct' | 'incorrect' | null;

// User settings interface
export interface UserSettings {
  operations: Operation[];
  unknownPositions: UnknownPosition[];
  soundEnabled: boolean;
  darkMode: boolean;
}

// Session statistics interface (not persisted)
export interface SessionStats {
  problemsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  sessionStartTime: number; // timestamp
}
