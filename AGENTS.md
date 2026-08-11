# Repository Guidelines

## Project Structure & Module Organization

This is a build-free browser football simulation. `global 38-0.html` is the only application entry point; do not rename it to `index.html`. `app.js` contains drafting, transfers, coaches, cups, persistence, achievements, and i18n. `simulation-core.js` contains shared seeded league simulation logic. `styles.css` owns presentation.

Keep data separate from behavior:

- `data.js` and `big-five*.js`: leagues, formations, and base club metadata. `big-five-squads.js` is a retired 2026-27 import and must not be re-enabled.
- `season-players.js`, `legacy-seasons.js`, and `legacy-capture.js`: active 2025-26 and historical player pools.
- `european-clubs.js`: European competition entrants and profiles.
- `scripts/`: one-off or repeatable data-repair utilities.

There is currently no dedicated test directory or asset pipeline.

## Build, Test, and Development Commands

No install or build step is required. Serve the repository locally so browser storage and scripts work consistently:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/global%2038-0.html`.

Check every edited JavaScript file before submitting, for example:

```powershell
node --check app.js
node --check season-players.js
```

Run `git diff --check` to catch whitespace errors. When data changes, verify league sizes remain `20/20/20/18/18` for ENG/ESP/ITA/GER/FRA and confirm club IDs remain unique.

Run `node scripts/balance-test.js --runs=1000 --seed=review` to compare champion, European qualification, and relegation rates with reproducible results.
Run `node scripts/random-test.js` after changing seeded random behavior.
Run `node scripts/validate-data.js` after editing club or player data.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and `const` unless reassignment is required. Use `camelCase` for functions and variables and kebab-case for club IDs such as `real-sociedad`. Preserve existing global data formats. Build UI elements with the `el()` helper rather than HTML strings.

All new user-facing text must work in Chinese and English. Add translations in `app.js` and test both language modes.

## Testing Guidelines

There is no automated test framework or coverage target. Manually verify the affected flow: drafting, position placement, rerolls, coaches, both transfer windows, domestic cups, full league simulation, results, and European competition. Test both Chinese and English UI modes. For data repairs, report record counts, duplicates, invalid ratings, and affected seasons.

## Commit & Pull Request Guidelines

History uses short imperative subjects, for example `Add bilingual UI and contributor guide` or `Fix duplicate league fixtures`. Keep each commit focused. Pull requests should explain what changed, why, and how it was verified; link relevant issues and include screenshots for visible UI changes. Never overwrite unrelated working-tree changes.
