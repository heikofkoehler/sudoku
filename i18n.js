// simple-i18n.js
// A lightweight internationalization helper

const I18n = {
    locale: 'en',
    translations: {
        en: {
            app: {
                title: 'Sudoku',
                time_label: 'Time:',
                difficulty_label: 'Difficulty:',
                difficulty: {
                    easy: 'Easy',
                    medium: 'Medium',
                    hard: 'Hard'
                },
                new_game: 'New Game',
                hint: 'Get Hint',
                undo: 'Undo',
                pause: 'Pause',
                resume: 'Resume',
                how_to_play: {
                    title: 'How to Play',
                    rule1: 'Fill the 9×9 grid so that each row, column, and 3×3 box contains digits 1-9',
                    rule2: 'Click a cell and type a number (1-9) to fill it',
                    rule3: 'Press Backspace or Delete to clear a cell',
                    rule4: 'Invalid moves will be highlighted in red',
                    rule5: 'Use hints to get solving tips based on human techniques'
                },
                victory: {
                    title: '🎉 Congratulations! 🎉',
                    message: 'You solved the puzzle!',
                    time: 'Time: {{time}}',
                    play_again: 'Play Again'
                },
                hints: {
                    no_hints_title: 'No Hints Available',
                    no_hints_msg: 'The puzzle is complete or already solved!',
                    naked_single: 'Naked Single',
                    hidden_single_row: 'Hidden Single (Row)',
                    hidden_single_col: 'Hidden Single (Column)',
                    hidden_single_box: 'Hidden Single (Box)',
                    guided_hint: 'Guided Hint',
                    explanations: {
                        naked_single: 'This cell can only be {{value}} because all other numbers are already used in its row, column, or box.',
                        hidden_single_row: '{{value}} can only go in this cell in row {{row}}.',
                        hidden_single_col: '{{value}} can only go in this cell in column {{col}}.',
                        hidden_single_box: '{{value}} can only go in this cell in its 3x3 box.',
                        guided: 'This cell should be {{value}}. It has {{candidates}} possible candidates.'
                    }
                },
                clear: 'Clear'
            },
        },
        de: {
            app: {
                title: 'Sudoku',
                time_label: 'Zeit:',
                difficulty_label: 'Schwierigkeit:',
                difficulty: {
                    easy: 'Leicht',
                    medium: 'Mittel',
                    hard: 'Schwer'
                },
                new_game: 'Neues Spiel',
                hint: 'Hinweis',
                undo: 'Rückgängig',
                pause: 'Pause',
                resume: 'Weiter',
                how_to_play: {
                    title: 'Spielanleitung',
                    rule1: 'Fülle das 9×9-Gitter, sodass jede Zeile, Spalte und jeder 3×3-Block die Ziffern 1-9 enthält',
                    rule2: 'Klicke auf ein Feld und tippe eine Zahl (1-9)',
                    rule3: 'Drücke Backspace oder Delete zum Löschen',
                    rule4: 'Ungültige Züge werden rot markiert',
                    rule5: 'Nutze Hinweise für Lösungstipps'
                },
                victory: {
                    title: '🎉 Herzlichen Glückwunsch! 🎉',
                    message: 'Du hast das Rätsel gelöst!',
                    time: 'Zeit: {{time}}',
                    play_again: 'Nochmal spielen'
                },
                hints: {
                    no_hints_title: 'Keine Hinweise verfügbar',
                    no_hints_msg: 'Das Rätsel ist vollständig oder bereits gelöst!',
                    naked_single: 'Nackter Einser',
                    hidden_single_row: 'Versteckter Einser (Zeile)',
                    hidden_single_col: 'Versteckter Einser (Spalte)',
                    hidden_single_box: 'Versteckter Einser (Block)',
                    guided_hint: 'Geführter Hinweis',
                    explanations: {
                        naked_single: 'Dieses Feld muss {{value}} sein, da alle anderen Zahlen in Zeile, Spalte oder Block bereits verwendet werden.',
                        hidden_single_row: '{{value}} kann in Zeile {{row}} nur in diesem Feld stehen.',
                        hidden_single_col: '{{value}} kann in Spalte {{col}} nur in diesem Feld stehen.',
                        hidden_single_box: '{{value}} kann in diesem 3x3-Block nur hier stehen.',
                        guided: 'Dieses Feld sollte {{value}} sein. Es hat {{candidates}} mögliche Kandidaten.'
                    }
                },
                clear: 'Löschen'
            }
        }
    },

    // Initialize
    init(lang = 'en') {
        if (this.translations[lang]) {
            this.locale = lang;
        }
        this.updatePage();
    },

    // Get translation
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.locale];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        // Interpolation: {{param}}
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => {
            return params[k] !== undefined ? params[k] : `{{${k}}}`;
        });
    },

    // Update all elements with data-i18n attribute
    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');

            // Handle placeholder attributes separately if needed, 
            // but for now we just update textContent
            if (key) {
                if (el.tagName === 'INPUT' && el.type === 'placeholder') {
                    el.placeholder = this.t(key);
                } else {
                    el.textContent = this.t(key);
                }
            }

            // Special handling for dropdown options if they have data-i18n-value?
            // Actually standard data-i18n works fine on <option>
        });

        // Update <option> text specifically if the iterator above missed them or to be safe
        // (querySelectorAll includes them, so standard loop is fine)
    },

    // Set language and update
    setLocale(lang) {
        if (this.translations[lang]) {
            this.locale = lang;
            this.updatePage();

            // Persist preference (optional)
            localStorage.setItem('sudoku-lang', lang);

            // Dispatch event for other components
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
        }
    }
};
