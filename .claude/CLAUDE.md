# Math Streak - Kindergarten Math Practice Game

## Project Overview
A React-based math practice game designed for kindergarten students to build arithmetic fluency through quick repetitions. The game tracks streaks of correct answers and maintains a high score to encourage practice.

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
```typescript
interface Problem {
  operation: Operation;
  operands: number[];
  unknownPosition: 'result' | `operand-${number}`;
  answer: number;
}

interface DifficultyConfig {
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
```

## Component Structure
```
App
├── GameBoard
│   ├── ProblemDisplay
│   ├── NumberPad
│   └── AnswerDisplay
├── ScoreDisplay
│   ├── CurrentStreak
│   └── HighScore
├── FeedbackModal
└── ConfigPanel (parent controls)
```

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
- **Automated:** UI testing via Playwright (functionality, keyboard, accessibility, visual/UX)
- **Manual:** User verification for final acceptance
- Ensure both keyboard and touch input work
- Test artifacts saved to `tests/playwright/` and `tests/artifacts/`

## Current Starting Configuration
- **Operation:** Addition only
- **Operand Count:** 2
- **Unknown Position:** Result (right side of equation)
- **Constraints:** Sum ≤ 10, operands 0-10

This configuration is controlled by parent and should be easily adjustable without code changes.
