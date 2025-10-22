import type { DifficultyConfig } from './types';

// Timing constants (in milliseconds)
export const TIMING = {
  AUTO_ADVANCE_DELAY: 1500, // Auto-advance after correct answer
  CELEBRATION_DURATION: 1200, // Celebration animation duration
  FEEDBACK_TRANSITION: 300, // Fade in/out for feedback
} as const;

// UI constants
export const UI = {
  MIN_TOUCH_TARGET: 44, // Minimum button size in pixels (WCAG AAA)
  NUMBER_BUTTON_SIZE: 60, // Number pad button size
  MAX_ANSWER_LENGTH: 3, // Maximum digits for answer
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  HIGH_SCORE: 'math-streak-high-score',
} as const;

// Feature flags
export const FEATURES = {
  TEN_FRAME_ENABLED: true,
} as const;

// Initial difficulty configuration (addition, sum ≤ 10)
export const DEFAULT_CONFIG: DifficultyConfig = {
  name: 'Kindergarten Addition',
  operations: ['addition'],
  operandCount: 2,
  unknownPositions: ['result'],
  constraints: {
    maxResult: 10,
    minOperand: 0,
    maxOperand: 10,
  },
};
