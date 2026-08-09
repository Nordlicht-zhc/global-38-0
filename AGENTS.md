# Repository Guidelines

## Project Structure & Module Organization

- `global 38-0.html` — application entry point and main UI.
- `app.js` — game flow, draft logic, league scheduling, simulation, European competitions, and i18n.
- `data.js`, `big-five*.js`, `big-five-squads.js`, `season-players.js`, `legacy-seasons.js` — league, club, and player data.
- `european-clubs.js` — European competition teams and profiles.
- `styles.css` — all UI styling.

There is no `src/` directory or test suite yet. Keep data files separate from application logic.

## Build, Test, and Development Commands

No build step is required. To run locally:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/global%2038-0.html`.

Check JavaScript syntax:

```powershell
node --check app.js
node --check european-clubs.js
```

Run the same syntax checks after editing any `.js` data file.

## Coding Style & Naming Conventions

- Use 2-space indentation and semicolons.
- Use `const` by default; use `let` only when reassignment is required.
- Use `camelCase` for functions and variables.
- Use kebab-case for club IDs such as `man-city` and `real-betis`.
- Build DOM nodes with the existing `el()` helper instead of raw HTML strings.
- Do not rename `global 38-0.html`; it is intentionally the entry file.

### i18n Rules

- New user-facing strings must work in both Chinese and English.
- Prefer creating text with `el()` so English mode outputs English directly.
- Add new Chinese phrases to the translation tables in `app.js` when needed.
- Verify both `EN` and `中文` modes after UI or simulation text changes.

## Testing Guidelines

There is no automated test framework. Use manual verification:

- Start a draft and confirm draft, swap, reroll, and hidden-rating flows.
- Simulate a league season and check fixture counts, table totals, and European results.
- Toggle between Chinese and English and confirm no untranslated UI strings.

Before finishing, run `node --check` on every edited JavaScript file.

## Commit & Pull Request Guidelines

- Use concise imperative commit messages, for example:
  - `Fix duplicate league fixtures`
  - `Add English UI translations`
  - `Remove team library module`
- Keep commits focused on one logical change.
- For PRs, describe what changed, why, and how it was verified.
- Include screenshots for UI changes and mention any manual test scenarios.

## Agent-Specific Instructions

- Read `app.js` before editing shared simulation or rendering code.
- Do not add a new `index.html` unless explicitly requested.
- Preserve existing data formats; do not mix historical and 2025-26 team data casually.
- When changing team lists or fixtures, verify that league sizes remain 20/20/20/18/18 for ENG/ESP/ITA/GER/FRA.
