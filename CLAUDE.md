# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A fully-featured sudoku web application built with vanilla HTML, CSS, and JavaScript. The app runs directly in the browser without requiring any build step or dependencies. It provides an interactive and visually appealing sudoku gaming experience with intelligent features and user-friendly controls.

## Project Requirements

### Core Sudoku Functionality
- **Puzzle Generation**: Generate valid sudoku puzzles using a backtracking algorithm
- **Difficulty Levels**: Three configurable difficulty levels
  - Easy: 40-45 given numbers (36-41 cells removed)
  - Medium: 30-35 given numbers (46-51 cells removed)
  - Hard: 24-29 given numbers (52-57 cells removed)
- **Unique Solutions**: All generated puzzles must have exactly one valid solution
- **Validation**: Real-time checking of moves against sudoku rules (no duplicates in rows, columns, or 3x3 boxes)

### User Interface Requirements
- **Interactive Grid**: 9×9 grid with clear visual separation of 3x3 boxes
- **Cell Selection**: Allow selection of any cell (both given and user-entered)
- **Input Methods**:
  - Keyboard input: Number keys 1-9 to enter digits
  - Keyboard navigation: Arrow keys to move between cells
  - Digit buttons: Clickable buttons 1-9 for touch-friendly input
  - Clear functionality: Backspace/Delete keys or Clear button
- **Visual Feedback**:
  - Distinct styling for given numbers vs user-entered numbers
  - Selected cell highlighting
  - Row and column highlighting for selected cell
  - Matching number highlighting (all instances of the same digit)
  - Invalid move highlighting with conflict indicators
  - Smooth animations and transitions

### Advanced Features
- **Human-Like Hint System**: Provide hints using logical solving techniques
  - Naked Singles: Cells with only one possible value
  - Hidden Singles: Values that can only go in one cell within a unit
  - Fallback: Reveal easiest cell when stuck
  - Explanations: Display reasoning behind each hint
- **Undo System**:
  - Track complete move history
  - Allow reverting moves one at a time
  - Maintain timestamps for each move
- **Timer**:
  - Start automatically on first move
  - Display in MM:SS or HH:MM:SS format
  - Pause/Resume functionality
  - Stop on puzzle completion
- **Smart Digit Buttons**:
  - Auto-disable when all 9 instances of a digit are used
  - Disable when given/fixed cells are selected
  - Disable when game is paused or no cell selected
- **Victory Detection**:
  - Automatically detect puzzle completion
  - Display celebration message with final time
  - Offer to start new game

### User Experience Requirements
- **No Build Step**: Run directly by opening index.html in a browser
- **No Dependencies**: Pure vanilla JavaScript, no frameworks or libraries
- **Responsive Design**: Work well on desktop and mobile devices
- **Visual Polish**: Professional appearance with gradients, shadows, and animations
- **Accessibility**: Keyboard navigation support, clear visual indicators

## Architecture

### File Structure
```
/sudoku
├── index.html      # HTML structure and UI layout
├── styles.css      # Styling, animations, responsive design
├── sudoku.js       # Core sudoku logic (generation, validation, solving)
├── app.js          # Application logic (UI, state, events)
└── CLAUDE.md       # This file
```

### Key Components

#### sudoku.js - Core Logic (~400 lines)
- `generateCompletedGrid()`: Create a valid filled grid using backtracking
- `generatePuzzle(difficulty)`: Remove cells based on difficulty while ensuring unique solution
- `isValid(grid, row, col, num)`: Validate number placement against sudoku rules
- `findConflicts(grid, row, col, num)`: Identify cells that conflict with a placement
- `solve(grid)`: Backtracking solver for validation and hints
- `countSolutions(grid, limit)`: Check for unique solutions
- `getCandidates(grid, row, col)`: Get all possible values for a cell
- `findNakedSingle(grid)`: Hint technique - cells with one possibility
- `findHiddenSingle(grid)`: Hint technique - unique placement in unit
- `getHint(grid, solution)`: Generate human-like hints with explanations
- `isComplete(grid)`: Check if puzzle is solved correctly

#### app.js - Application Logic (~500 lines)
- **Game State Management**:
  - Current grid, solution, initial grid
  - Selected cell tracking
  - Move history stack
  - Timer state
- **UI Rendering**:
  - `renderGrid()`: Update visual state of all cells
  - `updateDigitButtons()`: Enable/disable digit buttons based on state
  - Apply highlighting classes (selected, row-col, matching numbers, invalid, conflicts)
- **Event Handling**:
  - Cell selection clicks
  - Keyboard input and navigation
  - Digit button clicks
  - Control button actions (new game, hint, undo, pause)
- **Game Logic**:
  - `makeMove(row, col, num)`: Record move, update grid, validate
  - `undo()`: Revert last move from history
  - `showHint()`: Display hint with technique explanation
  - `highlightConflicts(row, col, num)`: Show conflicting cells
- **Timer Management**:
  - Start on first move
  - Pause/resume functionality
  - Display formatting
- **Victory Handling**:
  - Detect completion
  - Show celebration modal
  - Display final time

#### styles.css - Styling (~200 lines)
- **Grid Layout**: CSS Grid for 9×9 cells with proper 3×3 box borders
- **Cell States**:
  - `.given`: Pre-filled numbers (dark, on gray background)
  - `.user-entered`: Player input (purple text)
  - `.selected`: Currently selected cell (blue highlight)
  - `.row-col-highlight`: Same row/column as selected (light blue)
  - `.matching-number`: Same digit as selected (bright blue with border)
  - `.invalid`: Rule violation (red background)
  - `.conflict`: Conflicting cell (orange background)
  - `.hint-highlight`: Cell highlighted by hint (yellow, animated)
- **Animations**: Shake, pulse, slide-down, fade-in, scale-in
- **Responsive Design**: Mobile-friendly breakpoints
- **Visual Polish**: Gradients, shadows, hover effects, transitions

#### index.html - Structure (~150 lines)
- Header with title and timer display
- Difficulty selector and New Game button
- 9×9 grid container (cells generated by JavaScript)
- Side controls (Hint, Undo, Pause buttons)
- Digit buttons (1-9 and Clear)
- Hint message display area
- Victory modal overlay
- How to Play instructions

## Development Workflow

### Running the Application
1. Open `index.html` in any modern web browser
2. No build step, compilation, or server required
3. All functionality works from the local file system

### Testing Checklist
- [ ] Generate puzzles at all three difficulty levels
- [ ] Verify different numbers of given cells per difficulty
- [ ] Test invalid move highlighting (enter duplicates)
- [ ] Test row/column highlighting on cell selection
- [ ] Test matching number highlighting
- [ ] Test undo functionality with multiple moves
- [ ] Request hints and verify technique explanations
- [ ] Verify timer starts on first move and stops on completion
- [ ] Test pause/resume functionality
- [ ] Complete a full puzzle to verify victory detection
- [ ] Test digit buttons enable/disable based on count
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test responsive design on mobile devices

### Code Conventions
- **Pure Functions**: Core sudoku logic has no side effects
- **State Management**: Centralized in SudokuApp object
- **Event Delegation**: Efficient handling of grid cell events
- **Separation of Concerns**: Logic (sudoku.js) separate from UI (app.js)
- **Readable Code**: Clear function names, comments for complex algorithms
- **No Magic Numbers**: Named constants for difficulty levels and grid size

## Technical Details

### Puzzle Generation Algorithm
1. Generate a completed valid grid using randomized backtracking
2. Create a copy as the solution
3. Randomly select cells to remove based on difficulty
4. For each removal, verify puzzle still has unique solution
5. Stop when target number of cells removed

### Validation Strategy
- Check row: No duplicates in same row
- Check column: No duplicates in same column
- Check 3×3 box: No duplicates in containing box
- Track conflicts for visual feedback

### Hint System Logic
1. Try Naked Single: Find cells with only one candidate
2. Try Hidden Single: Find digits with only one possible position in a unit
3. Fallback: Find cell with fewest candidates and reveal solution value
4. Provide explanation of reasoning

### State Tracking
- Move history: `{row, col, previousValue, newValue, timestamp}`
- Enables undo functionality
- Could be extended for redo or save/load features

## Future Enhancement Ideas
- Redo functionality (complement to undo)
- Save/load game state to localStorage
- Statistics tracking (games played, average time, best time)
- More advanced hint techniques (Pointing Pairs, X-Wing, etc.)
- Pencil marks / candidate tracking mode
- Keyboard shortcuts for common actions
- Dark mode theme option
- Puzzle difficulty rating display
- Step-by-step solution replay
- Multiplayer mode (race to solve)
- Daily puzzle challenge
- Puzzle import/export functionality
