# Sudoku

A modern, responsive Sudoku web application built with vanilla JavaScript, HTML, and CSS.

![Sudoku Screenshot](https://via.placeholder.com/800x600?text=Sudoku+App+Preview)

## Features

- **Game Generation**: Generates valid Sudoku puzzles on the fly.
- **Difficulty Levels**: Choose from Easy, Medium, and Hard.
- **Timer**: Tracks your solving time.
- **Intelligent Hints**: 
  - Detects **Naked Singles**, **Hidden Singles** (Row, Column, Box).
  - Provides guided hints with human-readable explanations.
- **Undo Functionality**: Step back through your moves.
- **Internationalization (I18n)**:
  - Supports **English** and **German**.
  - Dynamic language switching without page reload.
- **Responsive Design**: Works on desktop and mobile.

## Technologies

- **Vanilla JavaScript (ES6+)**: No frameworks, no build steps required.
- **CSS3**: Custom styling with variables for easy theming.
- **HTML5**: Semantic markup.
- **Local Storage**: Persists language preference.

## Setup & Usage

Since this project uses ES6 modules, you may need a local server to avoid CORS issues with file imports (though the current implementation embeds modules to minimize this).

### Running Locally

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/sudoku.git
    cd sudoku
    ```

2.  **Open `index.html`**:
    - You can simply open `index.html` in your browser.
    - OR use a simple HTTP server (recommended):
      ```bash
      # Python 3
      python -m http.server 8000
      
      # Node.js (http-server)
      npx http-server .
      ```
    - Navigate to `http://localhost:8000`.

## File Structure

- `index.html`: Main entry point and UI structure.
- `app.js`: Main application controller (UI logic, event listeners, timer).
- `sudoku.js`: Core game logic (puzzle generation, validation, solving algorithms).
- `i18n.js`: Internationalization helper and translation strings.
- `styles.css`: All application styling.

## How to Play

1.  **Select Difficulty**: Choose Easy, Medium, or Hard from the dropdown.
2.  **Start Game**: Click "New Game".
3.  **Fill Cells**: Click a cell and type a number (1-9).
4.  **Use Tools**:
    - **Undo**: Revert your last move.
    - **Hint**: Get a clue if you're stuck.
    - **Pause**: Pause the timer if you need a break.
5.  **Win**: Fill the grid correctly to see your time!

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
