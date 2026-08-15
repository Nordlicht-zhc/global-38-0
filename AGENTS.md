# Repository Guidelines

## Project Structure & Module Organization

This is a build-free browser football draft and simulation game. `global 38-0.html` is the entry point. `app.js` coordinates UI and game flows, `simulation-core.js` contains seeded league simulation, `storage.js` handles persistence, and `styles.css` owns presentation.

Keep data separate from behavior:

- `data.js` and `big-five*.js`: formations, leagues, and current club metadata. Do not re-enable the retired `big-five-squads.js` import.
- `season-players.js`: active 2025-26 player pool. `season-data.js` lazily loads per-season JavaScript chunks from `history-data/`; regenerate them with `scripts/split-season-data.js`.
- `season-standings.js`: generated historical league tables used by dynasty mode; regenerate it with `scripts/generate-season-standings.js`.
- `player-identity.js`: cross-season duplicate-player detection.
- `position-fit.js`: normal position compatibility and out-of-position midfielder penalties.
- `european-clubs.js`: European competition entrants and profiles.
- `cloud-config.js`, `cloud-storage.js`, `supabase-schema.sql`: optional Supabase account/cloud-save integration; never commit service keys.
- `CLOUD_SETUP.md`: steps for enabling the optional cloud backend.
- `scripts/`: validation, balance tests, and repeatable data-repair utilities.

The browser edition has no build step or package manager. Keep the local `desktop/` wrapper out of Git; it is released separately and ignored at the repository root.

## Build, Test, and Development Commands

Serve the repository locally:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/global%2038-0.html`. No install or build step is required. Run focused checks after changes:

```powershell
node --check app.js
node scripts/validate-data.js
node scripts/random-test.js
node scripts/player-identity-test.js
node scripts/season-loader-test.js
node scripts/position-fit-test.js
node scripts/cloud-storage-test.js
node scripts/dynasty-test.js
node scripts/balance-test.js --runs=1000 --seed=review
node scripts/cup-europe-balance-test.js --runs=1000 --seed=review
git diff --check
```

Regenerate historical chunks with `node scripts/split-season-data.js`. Data validation must preserve league sizes `20/20/20/18/18` for ENG/ESP/ITA/GER/FRA, unique club IDs, and valid squads.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and `const` unless reassignment is needed. Use `camelCase` for JavaScript identifiers and kebab-case for club IDs, such as `real-sociedad`. Preserve established global data shapes. Build UI nodes with the `el()` helper instead of HTML strings. Add all user-facing text in both Chinese and English.

## Testing Guidelines

There is no test framework or coverage threshold. Name executable checks `scripts/*-test.js`. Manually test affected flows in both languages: drafting, rerolls, coaches, transfers, domestic cups, league simulation, results, achievements, and European competition. For data changes, report affected seasons, record counts, duplicates, and invalid ratings.

## Commit & Pull Request Guidelines

Use short imperative commit subjects matching repository history, such as `Add dynasty season history`. Keep commits focused and preserve unrelated worktree changes. Never stage `.vs/` or `desktop/`. Pull requests should explain what changed, why, and how it was verified; link relevant issues and include screenshots for visible UI changes.
