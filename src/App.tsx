import { useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { ScoreDisplay } from '@/components/ScoreDisplay';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerDisplay } from '@/components/AnswerDisplay';
import { NumberPad } from '@/components/NumberPad';
import { FeedbackModal } from '@/components/FeedbackModal';
import { TenFrame } from '@/components/TenFrame';
import { FEATURES } from '@/lib/constants';
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
    actions.nextProblem();
  };

  // Keyboard input integration
  const { activeKey } = useKeyboardInput({
    onNumberKey: actions.updateAnswer,
    onBackspace: actions.deleteLastDigit,
    onEnter: handleSubmit,
    enabled: !state.showFeedback, // Disable during feedback
  });

  // Play sound when answer is checked
  useEffect(() => {
    if (state.isAnswerCorrect === true) {
      playSuccess();
    } else if (state.isAnswerCorrect === false) {
      playError();
    }
  }, [state.isAnswerCorrect, playSuccess, playError]);

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <ScoreDisplay
          streak={state.streak}
          highScore={state.highScore}
        />

        <ProblemDisplay
          displayString={state.currentProblem.displayString}
        />

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
          disabled={state.showFeedback}
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
