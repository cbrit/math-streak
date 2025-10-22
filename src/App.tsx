import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerDisplay } from '@/components/AnswerDisplay';
import { NumberPad } from '@/components/NumberPad';
import { FeedbackModal } from '@/components/FeedbackModal';
import { TenFrame } from '@/components/TenFrame';
import { FEATURES, TIMING } from '@/lib/constants';
import styles from '@/styles/App.module.css';
import '@/styles/global.css';

export default function App() {
  // Initialize game state
  const { state, actions } = useGameState();

  // Initialize sound system
  const { playSuccess, playError } = useSound();

  // Handle answer submission
  const handleSubmit = () => {
    actions.submitAnswer();
  };

  // Handle next problem
  const handleNext = () => {
    setShowAnswerInPlace(false); // Ensure answer is hidden for new problem
    actions.nextProblem();
  };

  // Keyboard input integration - disable during celebration
  const { activeKey } = useKeyboardInput({
    onNumberKey: actions.updateAnswer,
    onBackspace: actions.deleteLastDigit,
    onEnter: handleSubmit,
    enabled: !state.showFeedback && state.celebrationPhase === null,
  });

  // Track animation states for slide transition
  const [isSlideOut, setIsSlideOut] = useState(false);
  const [isSlideIn, setIsSlideIn] = useState(false);
  const [showAnswerInPlace, setShowAnswerInPlace] = useState(false);
  const [slidingOutProblem, setSlidingOutProblem] = useState<typeof state.currentProblem | null>(null);

  // Play sound when answer is checked
  useEffect(() => {
    if (state.isAnswerCorrect === true) {
      playSuccess();
    } else if (state.isAnswerCorrect === false) {
      playError();
    }
  }, [state.isAnswerCorrect, playSuccess, playError]);

  // Orchestrate celebration flow for correct answers
  useEffect(() => {
    if (state.celebrationPhase === 'revealing') {
      const timers: NodeJS.Timeout[] = [];

      // Show the answer immediately
      setShowAnswerInPlace(true);

      // After reveal animation, start slide-out and prepare new problem
      timers.push(setTimeout(() => {
        // Save the current problem for slide-out animation
        setSlidingOutProblem(state.currentProblem);
        setIsSlideOut(true);
        setShowAnswerInPlace(false); // Hide answer as slide-out starts

        // Load new problem immediately so it's ready to slide in
        actions.nextProblem();
        setIsSlideIn(true);

        // Reset slide-in after animation completes
        timers.push(setTimeout(() => {
          setIsSlideOut(false);
          setIsSlideIn(false);
          setSlidingOutProblem(null);
        }, TIMING.TRANSITION_DURATION));
      }, TIMING.ANSWER_REVEAL_DURATION));

      return () => timers.forEach(clearTimeout);
    }
  }, [state.celebrationPhase, actions]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <ScoreDisplay
          streak={state.streak}
          highScore={state.highScore}
        />

        <div style={{ position: 'relative', minHeight: '120px' }}>
          {/* Show sliding out problem during transition (without test ID to avoid conflicts) */}
          {isSlideOut && slidingOutProblem && (
            <ProblemDisplay
              displayString={slidingOutProblem.displayString}
              showAnswer={true}
              answer={slidingOutProblem.answer}
              isRevealing={false}
              isTransitioning={true}
              isSlideIn={false}
              includeTestId={false}
            />
          )}

          {/* Show current problem (with slide-in animation if transitioning) */}
          {(!isSlideOut || isSlideIn) && (
            <ProblemDisplay
              displayString={state.currentProblem.displayString}
              showAnswer={showAnswerInPlace}
              answer={state.currentProblem.answer}
              isRevealing={showAnswerInPlace && !isSlideOut}
              isTransitioning={false}
              isSlideIn={isSlideIn}
              includeTestId={true}
            />
          )}
        </div>

        <TenFrame
          operands={state.currentProblem.operands}
          operation={state.currentProblem.operation}
          enabled={FEATURES.TEN_FRAME_ENABLED}
        />

        <AnswerDisplay
          answer={state.currentAnswer}
        />

        <NumberPad
          onNumberClick={actions.updateAnswer}
          onBackspace={actions.deleteLastDigit}
          onSubmit={handleSubmit}
          disabled={state.showFeedback || state.celebrationPhase !== null}
          activeKey={activeKey}
        />

        <FeedbackModal
          isVisible={state.showFeedback}
          isCorrect={state.isAnswerCorrect ?? false}
          correctAnswer={state.currentProblem.answer}
          currentStreak={state.streak}
          isNewHighScore={state.streak === state.highScore && state.streak > 0}
          problemDisplayString={state.currentProblem.displayString}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
