import { useState, useCallback, useMemo } from 'react';
import type { SessionStats } from '@/lib/types';

/**
 * Hook for tracking session statistics
 *
 * Manages statistics for the current play session including:
 * - Problems attempted
 * - Correct/incorrect answer counts
 * - Session duration
 * - Accuracy percentage
 *
 * Statistics are NOT persisted and reset on page reload.
 *
 * @returns Session stats, tracking functions, and computed values
 */
export function useSessionStats() {
  const [stats, setStats] = useState<SessionStats>({
    problemsAttempted: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    sessionStartTime: Date.now(),
  });

  /**
   * Record a problem attempt
   * @param isCorrect - Whether the answer was correct
   */
  const recordAttempt = useCallback((isCorrect: boolean) => {
    setStats(prev => ({
      ...prev,
      problemsAttempted: prev.problemsAttempted + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: isCorrect ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
    }));
  }, []);

  /**
   * Reset all statistics and start a new session
   */
  const resetStats = useCallback(() => {
    setStats({
      problemsAttempted: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      sessionStartTime: Date.now(),
    });
  }, []);

  /**
   * Calculate accuracy percentage
   * Returns 0 if no problems attempted
   */
  const accuracy = useMemo(() => {
    if (stats.problemsAttempted === 0) {
      return 0;
    }
    return Math.round((stats.correctAnswers / stats.problemsAttempted) * 100);
  }, [stats.correctAnswers, stats.problemsAttempted]);

  /**
   * Calculate session duration in minutes
   * Returns fractional minutes (e.g., 1.5 for 1 minute 30 seconds)
   */
  const duration = useMemo(() => {
    const durationMs = Date.now() - stats.sessionStartTime;
    return Math.round((durationMs / 1000 / 60) * 10) / 10; // Round to 1 decimal place
  }, [stats.sessionStartTime]);

  return {
    stats,
    recordAttempt,
    resetStats,
    accuracy,
    duration,
  };
}
