// Core Sudoku Logic
// Handles puzzle generation, validation, solving, and hint techniques

const Sudoku = {
  // Generate a completed valid sudoku grid
  generateCompletedGrid() {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    this.fillGrid(grid);
    return grid;
  },

  // Fill grid using backtracking (for generating completed grids)
  fillGrid(grid) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          // Shuffle numbers for randomness
          this.shuffleArray(numbers);

          for (let num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;

              if (this.fillGrid(grid)) {
                return true;
              }

              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  },

  // Generate a puzzle with specified difficulty
  generatePuzzle(difficulty = 'medium') {
    const grid = this.generateCompletedGrid();
    const solution = grid.map(row => [...row]);

    // Determine number of cells to remove based on difficulty
    const cellsToRemove = {
      easy: Math.floor(Math.random() * 6) + 36,    // 36-41 removed (40-45 givens)
      medium: Math.floor(Math.random() * 6) + 46,  // 46-51 removed (30-35 givens)
      hard: Math.floor(Math.random() * 6) + 52     // 52-57 removed (24-29 givens)
    };

    const remove = cellsToRemove[difficulty] || cellsToRemove.medium;
    const positions = [];

    // Create list of all positions
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j]);
      }
    }

    // Shuffle positions
    this.shuffleArray(positions);

    // Remove cells while maintaining unique solution
    let removed = 0;
    for (let [row, col] of positions) {
      if (removed >= remove) break;

      const backup = grid[row][col];
      grid[row][col] = 0;

      // Check if puzzle still has unique solution (simplified check)
      const testGrid = grid.map(r => [...r]);
      if (this.hasUniqueSolution(testGrid)) {
        removed++;
      } else {
        grid[row][col] = backup;
      }
    }

    return { puzzle: grid, solution };
  },

  // Check if a number placement is valid
  isValid(grid, row, col, num) {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) {
        return false;
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) {
        return false;
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) {
          return false;
        }
      }
    }

    return true;
  },

  // Find conflicting cells for a given position and number
  findConflicts(grid, row, col, num) {
    const conflicts = [];

    // Check row
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) {
        conflicts.push({ row, col: c });
      }
    }

    // Check column
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) {
        conflicts.push({ row: r, col });
      }
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num) {
          conflicts.push({ row: r, col: c });
        }
      }
    }

    return conflicts;
  },

  // Solve puzzle using backtracking
  solve(grid) {
    const emptyCell = this.findEmptyCell(grid);

    if (!emptyCell) {
      return true; // Puzzle solved
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        grid[row][col] = num;

        if (this.solve(grid)) {
          return true;
        }

        grid[row][col] = 0;
      }
    }

    return false;
  },

  // Count number of solutions (for uniqueness check)
  countSolutions(grid, limit = 2) {
    let count = 0;

    const solve = (g) => {
      if (count >= limit) return;

      const emptyCell = this.findEmptyCell(g);

      if (!emptyCell) {
        count++;
        return;
      }

      const [row, col] = emptyCell;

      for (let num = 1; num <= 9; num++) {
        if (this.isValid(g, row, col, num)) {
          g[row][col] = num;
          solve(g);
          g[row][col] = 0;

          if (count >= limit) return;
        }
      }
    };

    solve(grid.map(row => [...row]));
    return count;
  },

  // Check if puzzle has a unique solution
  hasUniqueSolution(grid) {
    return this.countSolutions(grid, 2) === 1;
  },

  // Find an empty cell (returns [row, col] or null)
  findEmptyCell(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null;
  },

  // Get all possible candidates for a cell
  getCandidates(grid, row, col) {
    if (grid[row][col] !== 0) {
      return [];
    }

    const candidates = [];
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(grid, row, col, num)) {
        candidates.push(num);
      }
    }
    return candidates;
  },

  // Find naked single (cell with only one possible value)
  findNakedSingle(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const candidates = this.getCandidates(grid, row, col);
          if (candidates.length === 1) {
            return {
              row,
              col,
              value: candidates[0],
              techniqueKey: 'app.hints.naked_single',
              explanationKey: 'app.hints.explanations.naked_single',
              params: { value: candidates[0] }
            };
          }
        }
      }
    }
    return null;
  },

  // Find hidden single (value that can only go in one cell in a unit)
  findHiddenSingle(grid) {
    // Check rows
    for (let row = 0; row < 9; row++) {
      for (let num = 1; num <= 9; num++) {
        const possibleCols = [];
        for (let col = 0; col < 9; col++) {
          if (grid[row][col] === 0 && this.isValid(grid, row, col, num)) {
            possibleCols.push(col);
          }
        }
        if (possibleCols.length === 1) {
          return {
            row,
            col: possibleCols[0],
            value: num,
            techniqueKey: 'app.hints.hidden_single_row',
            explanationKey: 'app.hints.explanations.hidden_single_row',
            params: { value: num, row: row + 1 }
          };
        }
      }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
      for (let num = 1; num <= 9; num++) {
        const possibleRows = [];
        for (let row = 0; row < 9; row++) {
          if (grid[row][col] === 0 && this.isValid(grid, row, col, num)) {
            possibleRows.push(row);
          }
        }
        if (possibleRows.length === 1) {
          return {
            row: possibleRows[0],
            col,
            value: num,
            techniqueKey: 'app.hints.hidden_single_col',
            explanationKey: 'app.hints.explanations.hidden_single_col',
            params: { value: num, col: col + 1 }
          };
        }
      }
    }

    // Check boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        for (let num = 1; num <= 9; num++) {
          const possibleCells = [];
          for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
            for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
              if (grid[r][c] === 0 && this.isValid(grid, r, c, num)) {
                possibleCells.push({ row: r, col: c });
              }
            }
          }
          if (possibleCells.length === 1) {
            return {
              row: possibleCells[0].row,
              col: possibleCells[0].col,
              value: num,
              techniqueKey: 'app.hints.hidden_single_box',
              explanationKey: 'app.hints.explanations.hidden_single_box',
              params: { value: num }
            };
          }
        }
      }
    }

    return null;
  },

  // Get hint using human-like techniques
  getHint(grid, solution) {
    // Try naked single first
    const nakedSingle = this.findNakedSingle(grid);
    if (nakedSingle) {
      return nakedSingle;
    }

    // Try hidden single
    const hiddenSingle = this.findHiddenSingle(grid);
    if (hiddenSingle) {
      return hiddenSingle;
    }

    // Fallback: find easiest cell (fewest candidates)
    let minCandidates = 10;
    let bestCell = null;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const candidates = this.getCandidates(grid, row, col);
          if (candidates.length < minCandidates && candidates.length > 0) {
            minCandidates = candidates.length;
            bestCell = { row, col, candidates };
          }
        }
      }
    }

    if (bestCell) {
      return {
        row: bestCell.row,
        col: bestCell.col,
        value: solution[bestCell.row][bestCell.col],
        techniqueKey: 'app.hints.guided_hint',
        explanationKey: 'app.hints.explanations.guided',
        params: { value: solution[bestCell.row][bestCell.col], candidates: minCandidates }
      };
    }

    return null;
  },

  // Utility: Shuffle array in place
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },

  // Check if puzzle is complete and valid
  isComplete(grid) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const num = grid[row][col];
        if (num === 0 || !this.isValid(grid, row, col, num)) {
          return false;
        }
      }
    }
    return true;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sudoku;
}
