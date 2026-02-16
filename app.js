// Application Logic
// Handles UI interactions, game state, timer, and user input

const SudokuApp = {
  // Game state
  puzzle: null,
  solution: null,
  currentGrid: null,
  initialGrid: null,
  selectedCell: null,
  moveHistory: [],

  // Timer state
  timerInterval: null,
  timerSeconds: 0,
  timerPaused: false,
  timerStarted: false,

  // DOM elements
  elements: {},

  // Initialize the application
  init() {
    this.cacheElements();
    this.createGrid();
    this.attachEventListeners();

    // Initialize I18n
    I18n.init();

    this.startNewGame();
  },

  // Cache DOM elements
  cacheElements() {
    this.elements = {
      grid: document.getElementById('sudokuGrid'),
      timer: document.getElementById('timer'),
      difficulty: document.getElementById('difficulty'),
      newGameBtn: document.getElementById('newGameBtn'),
      hintBtn: document.getElementById('hintBtn'),
      undoBtn: document.getElementById('undoBtn'),
      pauseBtn: document.getElementById('pauseBtn'),
      hintMessage: document.getElementById('hintMessage'),
      hintTechnique: document.getElementById('hintTechnique'),
      hintExplanation: document.getElementById('hintExplanation'),
      closeHintBtn: document.getElementById('closeHintBtn'),
      victoryMessage: document.getElementById('victoryMessage'),
      victoryTimeText: document.getElementById('victoryTimeText'),
      newGameFromVictoryBtn: document.getElementById('newGameFromVictoryBtn'),
      languageSelector: document.getElementById('languageSelector')
    };
  },

  // Create the 9x9 grid
  createGrid() {
    this.elements.grid.innerHTML = '';

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.setAttribute('tabindex', '0');
        this.elements.grid.appendChild(cell);
      }
    }
  },

  // Attach event listeners
  attachEventListeners() {
    // Cell click events
    this.elements.grid.addEventListener('click', (e) => {
      if (e.target.classList.contains('cell')) {
        this.selectCell(e.target);
      }
    });

    // Keyboard input
    document.addEventListener('keydown', (e) => {
      if (this.selectedCell && !this.timerPaused) {
        this.handleKeyPress(e);
      }
    });

    // Button events
    this.elements.newGameBtn.addEventListener('click', () => this.startNewGame());
    this.elements.hintBtn.addEventListener('click', () => this.showHint());
    this.elements.undoBtn.addEventListener('click', () => this.undo());
    this.elements.pauseBtn.addEventListener('click', () => this.togglePause());
    this.elements.closeHintBtn.addEventListener('click', () => this.hideHint());
    this.elements.newGameFromVictoryBtn.addEventListener('click', () => {
      this.hideVictory();
      this.startNewGame();
    });

    // Language selector
    this.elements.languageSelector.addEventListener('change', (e) => {
      I18n.setLocale(e.target.value);
      this.updateDynamicText();
    });

    // Digit button events
    document.querySelectorAll('.digit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.selectedCell && !this.timerPaused) {
          const row = parseInt(this.selectedCell.dataset.row);
          const col = parseInt(this.selectedCell.dataset.col);
          const isGiven = this.initialGrid[row][col] !== 0;

          // Don't allow editing given cells
          if (isGiven) {
            return;
          }

          const digit = parseInt(btn.dataset.digit);

          // Start timer on first move
          if (!this.timerStarted) {
            this.startTimer();
          }

          this.makeMove(row, col, digit);
        }
      });
    });
  },

  // Start a new game
  startNewGame() {
    const difficulty = this.elements.difficulty.value;
    const { puzzle, solution } = Sudoku.generatePuzzle(difficulty);

    this.puzzle = puzzle;
    this.solution = solution;
    this.currentGrid = puzzle.map(row => [...row]);
    this.initialGrid = puzzle.map(row => [...row]);
    this.moveHistory = [];
    this.selectedCell = null;

    this.resetTimer();
    this.hideHint();
    this.hideVictory();
    this.renderGrid();
    this.updateUndoButton();
  },

  // Render the grid
  renderGrid() {
    const cells = this.elements.grid.querySelectorAll('.cell');

    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const value = this.currentGrid[row][col];
      const isGiven = this.initialGrid[row][col] !== 0;

      cell.textContent = value === 0 ? '' : value;
      cell.className = 'cell';

      if (isGiven) {
        cell.classList.add('given');
      } else if (value !== 0) {
        cell.classList.add('user-entered');
      }

      if (this.selectedCell === cell) {
        cell.classList.add('selected');
      }

      // Highlight row and column of selected cell
      if (this.selectedCell) {
        const selectedRow = parseInt(this.selectedCell.dataset.row);
        const selectedCol = parseInt(this.selectedCell.dataset.col);

        if (row === selectedRow || col === selectedCol) {
          if (this.selectedCell !== cell) {
            cell.classList.add('row-col-highlight');
          }
        }

        // Highlight matching numbers
        const selectedValue = this.currentGrid[selectedRow][selectedCol];
        if (selectedValue !== 0 && value === selectedValue && this.selectedCell !== cell) {
          cell.classList.add('matching-number');
        }
      }

      // Check for invalid moves
      if (value !== 0 && !Sudoku.isValid(this.currentGrid, row, col, value)) {
        cell.classList.add('invalid');
      }
    });

    this.updateDigitButtons();
  },

  // Update digit button states
  updateDigitButtons() {
    const digitButtons = document.querySelectorAll('.digit-btn');
    let baseDisable = !this.selectedCell || this.timerPaused;

    // Check if selected cell is given
    let isSelectedGiven = false;
    if (this.selectedCell) {
      const row = parseInt(this.selectedCell.dataset.row);
      const col = parseInt(this.selectedCell.dataset.col);
      isSelectedGiven = this.initialGrid[row][col] !== 0;
    }

    // Count occurrences of each digit on the board
    const digitCounts = Array(10).fill(0);
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = this.currentGrid[row][col];
        if (value !== 0) {
          digitCounts[value]++;
        }
      }
    }

    digitButtons.forEach(btn => {
      const digit = parseInt(btn.dataset.digit);

      // Clear button (0) is always enabled unless base conditions fail or cell is given
      if (digit === 0) {
        btn.disabled = baseDisable || isSelectedGiven;
      } else {
        // Digit buttons (1-9) disabled if:
        // - Base conditions (no selection or paused)
        // - Selected cell is given
        // - All 9 instances of this digit are already on the board
        btn.disabled = baseDisable || isSelectedGiven || digitCounts[digit] >= 9;
      }
    });
  },

  // Select a cell
  selectCell(cell) {
    this.selectedCell = cell;
    this.renderGrid(); // Re-render to update highlights
    cell.focus();
  },

  // Handle keyboard input
  handleKeyPress(e) {
    const row = parseInt(this.selectedCell.dataset.row);
    const col = parseInt(this.selectedCell.dataset.col);
    const isGiven = this.initialGrid[row][col] !== 0;

    // Arrow keys for navigation (always allowed)
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      this.navigateGrid(e.key);
      return;
    }

    // Don't allow editing given cells
    if (isGiven) {
      return;
    }

    // Start timer on first move
    if (!this.timerStarted) {
      this.startTimer();
    }

    // Number keys (1-9)
    if (e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const num = parseInt(e.key);
      this.makeMove(row, col, num);
    }
    // Backspace or Delete to clear
    else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this.makeMove(row, col, 0);
    }
  },

  // Make a move
  makeMove(row, col, num) {
    const previousValue = this.currentGrid[row][col];

    // Don't record if value is the same
    if (previousValue === num) {
      return;
    }

    // Record move in history
    this.moveHistory.push({
      row,
      col,
      previousValue,
      newValue: num,
      timestamp: Date.now()
    });

    // Update grid
    this.currentGrid[row][col] = num;

    // Clear hint message
    this.hideHint();

    // Render and check for validity
    this.renderGrid();
    this.updateUndoButton();

    // Highlight conflicts if invalid
    if (num !== 0 && !Sudoku.isValid(this.currentGrid, row, col, num)) {
      this.highlightConflicts(row, col, num);
    }

    // Check for completion
    if (Sudoku.isComplete(this.currentGrid)) {
      this.handleVictory();
    }
  },

  // Highlight conflicting cells
  highlightConflicts(row, col, num) {
    const conflicts = Sudoku.findConflicts(this.currentGrid, row, col, num);
    const cells = this.elements.grid.querySelectorAll('.cell');

    // Remove previous conflict highlights
    cells.forEach(cell => cell.classList.remove('conflict'));

    // Add conflict highlights
    conflicts.forEach(conflict => {
      const cell = this.elements.grid.querySelector(
        `[data-row="${conflict.row}"][data-col="${conflict.col}"]`
      );
      if (cell) {
        cell.classList.add('conflict');
      }
    });

    // Remove highlights after 2 seconds
    setTimeout(() => {
      cells.forEach(cell => cell.classList.remove('conflict'));
    }, 2000);
  },

  // Navigate grid with arrow keys
  navigateGrid(key) {
    const row = parseInt(this.selectedCell.dataset.row);
    const col = parseInt(this.selectedCell.dataset.col);
    let newRow = row;
    let newCol = col;

    switch (key) {
      case 'ArrowUp':
        newRow = Math.max(0, row - 1);
        break;
      case 'ArrowDown':
        newRow = Math.min(8, row + 1);
        break;
      case 'ArrowLeft':
        newCol = Math.max(0, col - 1);
        break;
      case 'ArrowRight':
        newCol = Math.min(8, col + 1);
        break;
    }

    const newCell = this.elements.grid.querySelector(
      `[data-row="${newRow}"][data-col="${newCol}"]`
    );
    if (newCell) {
      this.selectCell(newCell);
    }
  },

  // Undo last move
  undo() {
    if (this.moveHistory.length === 0) {
      return;
    }

    const lastMove = this.moveHistory.pop();
    this.currentGrid[lastMove.row][lastMove.col] = lastMove.previousValue;

    this.hideHint();
    this.renderGrid();
    this.updateUndoButton();
  },

  // Update undo button state
  updateUndoButton() {
    this.elements.undoBtn.disabled = this.moveHistory.length === 0;
  },

  // Show hint
  showHint() {
    const hint = Sudoku.getHint(this.currentGrid, this.solution);

    if (!hint) {
      this.elements.hintTechnique.textContent = I18n.t('app.hints.no_hints_title');
      this.elements.hintExplanation.textContent = I18n.t('app.hints.no_hints_msg');
      this.elements.hintMessage.classList.remove('hidden');
      return;
    }

    // Display hint message
    this.elements.hintTechnique.textContent = I18n.t(hint.techniqueKey);
    this.elements.hintExplanation.textContent = I18n.t(hint.explanationKey, hint.params);
    this.elements.hintMessage.classList.remove('hidden');

    // Highlight the cell
    const cell = this.elements.grid.querySelector(
      `[data-row="${hint.row}"][data-col="${hint.col}"]`
    );

    if (cell) {
      // Remove previous highlights
      this.elements.grid.querySelectorAll('.hint-highlight').forEach(c => {
        c.classList.remove('hint-highlight');
      });

      // Add highlight
      cell.classList.add('hint-highlight');

      // Auto-select the cell
      this.selectCell(cell);

      // Remove highlight after animation
      setTimeout(() => {
        cell.classList.remove('hint-highlight');
      }, 3000);
    }
  },

  // Hide hint message
  hideHint() {
    this.elements.hintMessage.classList.add('hidden');
  },

  // Timer functions
  startTimer() {
    if (this.timerStarted) {
      return;
    }

    this.timerStarted = true;
    this.timerSeconds = 0;
    this.timerInterval = setInterval(() => {
      if (!this.timerPaused) {
        this.timerSeconds++;
        this.updateTimerDisplay();
      }
    }, 1000);
  },

  resetTimer() {
    this.stopTimer();
    this.timerSeconds = 0;
    this.timerStarted = false;
    this.timerPaused = false;
    this.updateTimerDisplay();
    this.elements.pauseBtn.innerHTML = `<span class="btn-icon">⏸</span><span data-i18n="app.pause">${I18n.t('app.pause')}</span>`;
  },

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  togglePause() {
    if (!this.timerStarted) {
      return;
    }

    this.timerPaused = !this.timerPaused;

    if (this.timerPaused) {
      this.elements.pauseBtn.innerHTML = `<span class="btn-icon">▶</span><span data-i18n="app.resume">${I18n.t('app.resume')}</span>`;
      this.elements.grid.style.opacity = '0.5';
      this.elements.grid.style.pointerEvents = 'none';
    } else {
      this.elements.pauseBtn.innerHTML = `<span class="btn-icon">⏸</span><span data-i18n="app.pause">${I18n.t('app.pause')}</span>`;
      this.elements.grid.style.opacity = '1';
      this.elements.grid.style.pointerEvents = 'auto';
    }
  },

  updateTimerDisplay() {
    const hours = Math.floor(this.timerSeconds / 3600);
    const minutes = Math.floor((this.timerSeconds % 3600) / 60);
    const seconds = this.timerSeconds % 60;

    let display;
    if (hours > 0) {
      display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    this.elements.timer.textContent = display;
  },

  // Handle victory
  handleVictory() {
    this.stopTimer();
    const time = this.elements.timer.textContent;
    this.elements.victoryTimeText.textContent = I18n.t('app.victory.time', { time });
    this.elements.victoryMessage.classList.remove('hidden');
  },

  // Hide victory message
  hideVictory() {
    this.elements.victoryMessage.classList.add('hidden');
  },

  // Update dynamic text that isn't handled by data-i18n automatically
  // (e.g., button states that change)
  updateDynamicText() {
    // Re-render pause button state
    if (this.timerPaused) {
      this.elements.pauseBtn.innerHTML = `<span class="btn-icon">▶</span><span data-i18n="app.resume">${I18n.t('app.resume')}</span>`;
    } else {
      this.elements.pauseBtn.innerHTML = `<span class="btn-icon">⏸</span><span data-i18n="app.pause">${I18n.t('app.pause')}</span>`;
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SudokuApp.init());
} else {
  SudokuApp.init();
}
