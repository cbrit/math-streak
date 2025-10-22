import { useReducer, useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateProblem } from '@/lib/problemGenerator';
import { DEFAULT_CONFIG, STORAGE_KEYS, UI } from '@/lib/constants';
import type { GameState, DifficultyConfig, Problem } from '@/lib/types';

// Action types for game state updates
type GameAction =
  | { type: 'UPDATE_ANSWER'; digit: string }
  | { type: 'DELETE_DIGIT' }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'NEXT_PROBLEM'; problem: Problem }
  | { type: 'SET_HIGH_SCORE'; score: number }
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

      // Don't allow re-submission while feedback is showing
      if (state.showFeedback) {
        return state;
      }

      // Convert current answer to number and check if correct
      const userAnswer = parseInt(state.currentAnswer, 10);
      const isCorrect = userAnswer === state.currentProblem.answer;

      return {
        ...state,
        isAnswerCorrect: isCorrect,
        showFeedback: !isCorrect, // Only show modal for incorrect answers
        celebrationPhase: isCorrect ? 'revealing' : null,
        // Increment streak on correct answer, keep current streak for display on incorrect
        streak: isCorrect ? state.streak + 1 : state.streak,
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
        showFeedback: false,
        celebrationPhase: null,
        // Reset streak when moving to next problem after incorrect answer
        streak: state.isAnswerCorrect === false ? 0 : state.streak,
      };
    }

    case 'SET_HIGH_SCORE': {
      return {
        ...state,
        highScore: action.score,
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
 * - Streak tracking and high score persistence
 * - Feedback state for correct/incorrect answers
 *
 * @param config - Difficulty configuration (defaults to DEFAULT_CONFIG)
 * @returns Game state and action functions
 */
export function useGameState(config: DifficultyConfig = DEFAULT_CONFIG) {
  // Persist high score to localStorage
  const [highScore, setHighScore] = useLocalStorage(STORAGE_KEYS.HIGH_SCORE, 0);

  // Initialize game state with first problem
  const [state, dispatch] = useReducer(gameReducer, {
    currentProblem: generateProblem(config),
    currentAnswer: '',
    streak: 0,
    highScore,
    isAnswerCorrect: null,
    showFeedback: false,
    celebrationPhase: null,
  });

  // Update high score when streak increases beyond current high score
  useEffect(() => {
    if (state.streak > state.highScore) {
      setHighScore(state.streak);
      dispatch({ type: 'SET_HIGH_SCORE', score: state.streak });
    }
  }, [state.streak, state.highScore, setHighScore]);

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
    const newProblem = generateProblem(config);
    dispatch({ type: 'NEXT_PROBLEM', problem: newProblem });
  }, [config]);

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
