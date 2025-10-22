# Math Streak - Kindergarten Math Practice Game

## Project Overview
A React-based math practice game designed for kindergarten students to build arithmetic fluency through quick repetitions. The game tracks streaks of correct answers and maintains a high score to encourage practice.

## Implementation Status
- **Version:** 1.0 - Production Ready
- **Test Coverage:** 31/31 Playwright tests passing (100%)
- **Dev Server:** `bun run dev` → http://localhost:5173/
- **Last Updated:** 2025-10-22

## Tech Stack
- **React** with TypeScript
- **Vite** for development and building
- **Bun** as package manager (use `bun` commands, NOT npm)
- **CSS Modules** for component styling
- **Web Audio API** for sound feedback

## State Management
- Use React's built-in hooks ONLY (useState, useReducer, useContext)
- NO external state management libraries (no Zustand, Redux, etc.)
- Custom hooks for reusable logic

## Architecture Principles

### Extensibility
The game must be architected to easily support future enhancements:
- Different math operations (subtraction, multiplication, division)
- Different unknown positions (e.g., "? + 3 = 7" or "4 + ? = 7")
- Variable number of operands (2+)
- Different difficulty levels
- Configurable constraints (max result, operand ranges)

### Core Data Structures
See `src/lib/types.ts` for complete type definitions. Key interfaces:
- `Problem` - Math problem with operation, operands, unknown position, answer
- `DifficultyConfig` - Configuration for operations, operand count, constraints
- `GameState` - Current game state (problem, answer, streak, high score, feedback)

### Key Architectural Decisions

**State Management Pattern:**
- **Why:** useReducer provides predictable state transitions for complex game flow
- **Principle:** Single source of truth with immutable updates via dispatch actions
- **Critical Gotcha:** High score updates require BOTH `setHighScore()` (localStorage) AND `dispatch({ type: 'SET_HIGH_SCORE' })` to sync UI state. Missing dispatch will cause stale UI until reload.

**Dual Input System (Touch + Keyboard):**
- **Why:** Kindergarten users need both touch and keyboard to feel equally responsive
- **Principle:** All input methods should provide immediate visual feedback
- **Implementation:** `useKeyboardInput` hook captures keyboard events and returns `activeKey` for 150ms to highlight corresponding button
- **Pattern:** Keyboard input disabled during feedback modal to prevent accidental submissions

**Sound System:**
- **Why:** Programmatic tones (Web Audio API oscillators) avoid dependency on audio files
- **Principle:** Graceful degradation - app works perfectly without audio
- **Gotcha:** AudioContext may be suspended on first load due to browser autoplay policy. Context resumes on first user interaction.
- **Sound Design:** Success = ascending tones (C5→E5), Error = gentle single tone (A3)

**Problem Generation:**
- **Why:** Separate generator functions per operation for maintainability and extensibility
- **Principle:** Config-driven system allows enabling/disabling operations without code changes
- **Safety Pattern:** 100-attempt limit prevents infinite loops in impossible constraint configurations
- **Extensibility:** All 4 operations (addition, subtraction, multiplication, division) already implemented

## Component Structure
**Actual Implementation** (flat structure in `src/components/`):
```
App
├── ScoreDisplay (streak + high score)
├── ProblemDisplay (math problem)
├── AnswerDisplay (user input)
├── NumberPad (0-9, backspace, submit buttons)
└── FeedbackModal (correct/incorrect feedback)
```

**Note:** Components are flat, not nested. ConfigPanel (parent controls) not yet implemented.

## User Experience Requirements

### Input
- Large touch-friendly number buttons (0-9)
- Keyboard support with visual feedback on button press
- Backspace and submit buttons
- Clear hover/active states

### Feedback Behavior
**Correct Answer:**
- Show celebration animation with colors
- Play success sound
- Auto-advance to next problem after ~1.5 seconds
- Increment streak

**Incorrect Answer:**
- Show correct answer prominently
- Display final streak count
- Show "New High Score!" if applicable
- Play gentle "try again" sound
- Show "Next" button (wait for user interaction)
- Reset streak to 0

### Visual Design
- Minimal and focused interface during problem-solving
- Large, readable fonts for kindergarten age
- Subtle colors for UI elements
- Burst of color/animation ONLY on correct answers
- Calm, clear display on incorrect answers

## Coding Standards

### TypeScript
- Strict mode enabled
- Proper type definitions for all functions and components
- No `any` types
- Export interfaces and types from `lib/types.ts`

### React
- Functional components only
- Custom hooks for complex logic
- Props interfaces for all components
- Meaningful component and variable names

### File Organization
```
src/
├── components/     # React components
├── hooks/          # Custom hooks
├── lib/            # Core logic, types, constants
├── styles/         # CSS modules
├── assets/sounds/  # Audio files
├── App.tsx
└── main.tsx
```

### Accessibility
- Keyboard navigation support
- ARIA labels for screen readers
- Focus management
- High contrast for readability

## Development Workflow

### Using Sub-Agents
The development workflow uses specialized sub-agents orchestrated by the main agent:

**Standard Feature Development Flow:**
1. **Main Agent** receives feature request from user
2. **Main Agent** spawns `coder.md` agent(s) to implement feature(s) in parallel
3. **Coder Agent** implements feature and reports back to Main Agent
4. **Main Agent** spawns `ui-tester.md` agent to test the implementation
5. **UI Tester Agent** runs Playwright tests and reports results to Main Agent
6. **If tests PASS:**
   - **Main Agent** spawns `code-reviewer.md` agent to review code
   - **Code Reviewer** provides feedback and reports back to Main Agent
   - Feature complete
7. **If tests FAIL:**
   - **Main Agent** spawns new `coder.md` agent with bug fix task
   - **Coder Agent** fixes issues and reports back to Main Agent
   - **Main Agent** re-runs `ui-tester.md` agent
   - Repeat until tests pass, then proceed to code review

**Important Rules:**
- Sub-agents do NOT spawn other sub-agents
- Sub-agents always report back to the calling agent (Main Agent)
- Multiple features can be developed in parallel by spawning multiple coder agents
- Each feature follows the complete flow: code → test → fix (if needed) → review

### Available Sub-Agents
- **`coder.md`** - Implements features following project architecture
- **`ui-tester.md`** - Automated UI testing with Playwright (all functionality, keyboard, accessibility, UX)
- **`code-reviewer.md`** - Code review for quality, standards, and extensibility

### Testing
- **Automated:** Comprehensive Playwright test suite (31 tests covering all features)
- **Run Tests:** Use `ui-tester.md` agent via Main Agent orchestration
- **Test Categories:** Core functionality, keyboard support, correct/incorrect flows, accessibility, visual/UX
- **Pass Criteria:** All 31 tests must pass before deployment
- **Test Artifacts:** Saved to `tests/playwright/` (scripts) and `tests/artifacts/` (screenshots)
- **Manual:** User verification for final acceptance and subjective UX validation

## Extending the Game

### Adding New Operations
All operations are already implemented in `src/lib/problemGenerator.ts`:
- **Available:** Addition, Subtraction, Multiplication, Division
- **Currently Enabled:** Addition only
- **To Enable Others:** Modify `DEFAULT_CONFIG.operations` array in `src/lib/constants.ts`
- **No code changes needed** - just update configuration

Example:
```typescript
// In src/lib/constants.ts
export const DEFAULT_CONFIG: DifficultyConfig = {
  name: 'Mixed Operations',
  operations: ['addition', 'subtraction'], // Add operations here
  operandCount: 2,
  unknownPositions: ['result'],
  constraints: {
    maxResult: 20,
    minOperand: 0,
    maxOperand: 20,
  },
};
```

### Changing Difficulty
All difficulty parameters are configurable via `DifficultyConfig`:
- **Operations:** Which operations to include
- **Operand Count:** Number of operands (currently 2, supports 2+)
- **Unknown Positions:** Where the "?" appears ('result' or 'operand-0', 'operand-1', etc.)
- **Constraints:** Max result, min/max operand values

**Pattern:** The system supports multiple configs. Future: pass config as prop or use ConfigContext.

### Critical Patterns for New Features

**When updating game state:**
1. Always use dispatch actions (never mutate state directly)
2. For persisted state (like high score), update BOTH storage AND state:
   ```typescript
   setHighScore(newValue);                              // Update localStorage
   dispatch({ type: 'SET_HIGH_SCORE', score: newValue }); // Update UI state
   ```
3. See `useGameState` hook (lines 116-121) for reference implementation

**When adding input methods:**
- Provide visual feedback (keyboard input highlights buttons for 150ms)
- Disable input during feedback modal to prevent double-submission
- See `useKeyboardInput` hook for pattern

**When modifying feedback timing:**
- All timing values centralized in `TIMING` constant (`src/lib/constants.ts`)
- Auto-advance: 1500ms (TIMING.AUTO_ADVANCE_DELAY)
- Celebration: 1200ms (TIMING.CELEBRATION_DURATION)

## Development Commands
```bash
bun run dev      # Start development server (http://localhost:5173/)
bun run build    # Build for production (output to dist/)
bun run preview  # Preview production build
bunx tsc         # Type check without building
```

## Current Configuration
- **Operation:** Addition only
- **Operand Count:** 2
- **Unknown Position:** Result (right side of equation)
- **Constraints:** Sum ≤ 10, operands 0-10
- **Location:** `DEFAULT_CONFIG` in `src/lib/constants.ts`
