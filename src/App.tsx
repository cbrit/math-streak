import { useEffect, useState, useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useSound } from '@/hooks/useSound';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerDisplay } from '@/components/AnswerDisplay';
import { NumberPad } from '@/components/NumberPad';
import { TenFrame } from '@/components/TenFrame';
import { SettingsButton } from '@/components/SettingsButton';
import { SettingsPanel } from '@/components/SettingsPanel';
import { FEATURES, TIMING, DEFAULT_CONFIG, STORAGE_KEYS } from '@/lib/constants';
import styles from '@/styles/App.module.css';
import '@/styles/global.css';

export default function App() {
  // Settings state
  const [maxResult, setMaxResult] = useLocalStorage(STORAGE_KEYS.MAX_RESULT, 10);
  const [allowZero, setAllowZero] = useLocalStorage(STORAGE_KEYS.ALLOW_ZERO, true);
  const [enableHints, setEnableHints] = useLocalStorage(STORAGE_KEYS.ENABLE_HINTS, true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Create game config based on settings
  const gameConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    constraints: {
      ...DEFAULT_CONFIG.constraints,
      maxResult,
      // Force allowZero = true when maxResult = 1 (only valid pairs include 0)
      allowZero: maxResult === 1 ? true : allowZero,
    },
  }), [maxResult, allowZero]);

  // Initialize game state with custom config
  const { state, actions } = useGameState(gameConfig);

  // Initialize sound system
  const { playSuccess } = useSound();

  // Handle answer submission
  const handleSubmit = () => {
    actions.submitAnswer();
  };

  // Keyboard input integration - disable during celebration
  const { activeKey } = useKeyboardInput({
    onNumberKey: actions.updateAnswer,
    onBackspace: actions.deleteLastDigit,
    onEnter: handleSubmit,
    enabled: state.celebrationPhase === null,
  });

  // Track animation states for slide transition
  const [isSlideOut, setIsSlideOut] = useState(false);
  const [isSlideIn, setIsSlideIn] = useState(false);
  const [showAnswerInPlace, setShowAnswerInPlace] = useState(false);
  const [slidingOutProblem, setSlidingOutProblem] = useState<typeof state.currentProblem | null>(null);
  const [wasLastAnswerCorrect, setWasLastAnswerCorrect] = useState(false);

  // Play sound only when answer is correct
  useEffect(() => {
    if (state.isAnswerCorrect === true) {
      playSuccess();
    }
    // No sound for incorrect answers
  }, [state.isAnswerCorrect, playSuccess]);

  // Orchestrate transition flow for both correct and incorrect answers
  useEffect(() => {
    if (state.celebrationPhase === 'revealing') {
      const isCorrect = state.isAnswerCorrect === true;

      // Track whether this answer was correct for slide-out animation
      setWasLastAnswerCorrect(isCorrect);

      // Only show the answer for correct answers
      if (isCorrect) {
        setShowAnswerInPlace(true);
      }

      // For correct: wait for reveal animation. For incorrect: small delay to ensure slide is visible
      const revealDelay = isCorrect ? TIMING.ANSWER_REVEAL_DURATION : 50;

      // After reveal animation (or small delay for incorrect), start slide-out
      const slideTimer = setTimeout(() => {
        // Save the current problem for slide-out animation
        setSlidingOutProblem(state.currentProblem);
        setIsSlideOut(true);
        setShowAnswerInPlace(false); // Hide answer as slide-out starts

        // Load new problem immediately so it's ready to slide in
        actions.nextProblem();
        setIsSlideIn(true);

        // Reset animation states after slide completes
        // DON'T add to cleanup array so it always completes even if effect re-runs
        setTimeout(() => {
          setIsSlideOut(false);
          setIsSlideIn(false);
          setSlidingOutProblem(null);
        }, TIMING.TRANSITION_DURATION);
      }, revealDelay);

      // Only cleanup the first timer if effect re-runs before it fires
      return () => clearTimeout(slideTimer);
    }
  }, [state.celebrationPhase, state.isAnswerCorrect, actions]);

  return (
    <div className={styles.app}>
      <SettingsButton onClick={() => setIsSettingsOpen(true)} />

      <div className={styles.container}>
        <div style={{ position: 'relative', minHeight: '120px' }}>
          {/* Show sliding out problem during transition (without test ID to avoid conflicts) */}
          {isSlideOut && slidingOutProblem && (
            <ProblemDisplay
              displayString={slidingOutProblem.displayString}
              showAnswer={wasLastAnswerCorrect}
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
          enabled={enableHints}
        />

        <AnswerDisplay
          answer={state.currentAnswer}
        />

        <NumberPad
          onNumberClick={actions.updateAnswer}
          onBackspace={actions.deleteLastDigit}
          onSubmit={handleSubmit}
          disabled={state.celebrationPhase !== null}
          activeKey={activeKey}
        />
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        maxResult={maxResult}
        onMaxResultChange={setMaxResult}
        allowZero={allowZero}
        onAllowZeroChange={setAllowZero}
        enableHints={enableHints}
        onEnableHintsChange={setEnableHints}
      />
    </div>
  );
}
