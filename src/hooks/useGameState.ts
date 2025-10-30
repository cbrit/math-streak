import { useReducer, useCallback } from 'react';
import { generateProblem } from '@/lib/problemGenerator';
import { DEFAULT_CONFIG, UI } from '@/lib/constants';
import type { GameState, DifficultyConfig, Problem } from '@/lib/types';

// Action types for game state updates
type GameAction =
  | { type: 'UPDATE_ANSWER'; digit: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_PROBLEM'; problem: Problem }
  | { type: 'START_CELEBRATION' }
  | { type: 'TRANSITION_TO_NEXT' }
  | { type: 'COMPLETE_TRANSITION' };

/**
 * Reducer function to handle game state transitions
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_ANSWER': {
      // Only add digit if we haven't reached max length
      if (state.currentAnswer.length >= UI.MAX_ANSWER_LENGTH) {
        return state;
      }

      // Only allow numeric digits
      if (!/^\d$/.test(action.digit)) {
        return state;
      }

      return {
        ...state,
        currentAnswer: state.currentAnswer + action.digit,
      };
    }

    case 'DELETE_DIGIT': {
      return {
        ...state,
        currentAnswer: state.currentAnswer.slice(0, -1),
      };
    }

    case 'SUBMIT_ANSWER': {
      // Don't submit if answer is empty
      if (state.currentAnswer === '') {
        return state;
      }

      // Don't allow re-submission during celebration
      if (state.celebrationPhase !== null) {
        return state;
      }

      // Convert current answer to number and check if correct
      const userAnswer = parseInt(state.currentAnswer, 10);
      const isCorrect = userAnswer === state.currentProblem.answer;

      return {
        ...state,
        isAnswerCorrect: isCorrect,
        celebrationPhase: 'revealing', // Always trigger animation flow
      };
    }

    case 'START_CELEBRATION': {
      return {
        ...state,
        celebrationPhase: 'revealing',
      };
    }

    case 'TRANSITION_TO_NEXT': {
      return {
        ...state,
        celebrationPhase: 'transitioning',
      };
    }

    case 'COMPLETE_TRANSITION': {
      return {
        ...state,
        celebrationPhase: null,
      };
    }

    case 'NEXT_PROBLEM': {
      return {
        ...state,
        currentProblem: action.problem,
        currentAnswer: '',
        isAnswerCorrect: null,
        celebrationPhase: null,
      };
    }

    default:
      return state;
  }
}

/**
 * Main game state management hook
 *
 * Manages the complete game state including:
 * - Current problem and user answer
 * - Answer checking and feedback state
 *
 * @param config - Difficulty configuration (defaults to DEFAULT_CONFIG)
 * @returns Game state and action functions
 */
export function useGameState(config: DifficultyConfig = DEFAULT_CONFIG) {
  // Initialize game state with first problem
  const [state, dispatch] = useReducer(gameReducer, {
    currentProblem: generateProblem(config),
    currentAnswer: '',
    isAnswerCorrect: null,
    celebrationPhase: null,
  });

  /**
   * Add a digit to the current answer
   */
  const updateAnswer = useCallback((digit: string) => {
    dispatch({ type: 'UPDATE_ANSWER', digit });
  }, []);

  /**
   * Remove the last digit from the current answer
   */
  const deleteLastDigit = useCallback(() => {
    dispatch({ type: 'DELETE_DIGIT' });
  }, []);

  /**
   * Submit the current answer for checking
   * Updates streak and triggers feedback display
   */
  const submitAnswer = useCallback(() => {
    dispatch({ type: 'SUBMIT_ANSWER' });
  }, []);

  /**
   * Generate and move to the next problem
   * Resets answer and feedback state
   */
  const nextProblem = useCallback(() => {
    const newProblem = generateProblem(config, state.currentProblem);
    dispatch({ type: 'NEXT_PROBLEM', problem: newProblem });
  }, [config, state.currentProblem]);

  return {
    state,
    actions: {
      updateAnswer,
      deleteLastDigit,
      submitAnswer,
      nextProblem,
    },
  };
}
