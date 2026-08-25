# Repository Guidelines

## Project Structure & Module Organization

This is a build-free browser football draft and simulation game. `global 38-0.html` is the entry point. Runtime JavaScript lives in `src/`: `src/app.js` coordinates UI and game flows, `src/simulation-core.js` contains seeded league simulation, and `src/storage.js` handles persistence. `styles.css` owns presentation.

Keep data separate from behavior:

- `src/data.js` and `src/big-five*.js`: formations, leagues, and current club metadata. The retired squad import lives in `archive/` and must not be re-enabled.
- `src/season-players.js`: active 2025-26 player pool. `src/season-data.js` lazily loads per-season JavaScript chunks from `history-data/`; regenerate them with `scripts/split-season-data.js`.
- `src/season-standings.js`: generated historical league tables used by dynasty mode; regenerate it with `scripts/generate-season-standings.js`.
- `src/player-identity.js`: cross-season duplicate-player detection.
- `src/position-fit.js`: normal position compatibility and out-of-position midfielder penalties.
- `src/european-clubs.js`: European competition entrants and profiles.
- `src/cloud-config.js` and `src/cloud-storage.js`: optional Supabase account/cloud-save integration; never commit service keys.
- `docs/`: contributor and service setup documentation, including `CLOUD_SETUP.md`.
- `supabase/`: database schema used by the optional cloud backend.
- `source-data/`: large source datasets used only by regeneration scripts.
- `archive/`: retired reference code that is not loaded by the game.
- `scripts/`: validation, balance tests, and repeatable data-repair utilities.

The browser edition has no build step or package manager. Keep the local `desktop/` wrapper out of Git; it is released separately and ignored at the repository root. Build the desktop edition with `desktop/build-portable.ps1`; portable EXEs are the only desktop artifacts produced, and installers are not generated.

## Build, Test, and Development Commands

Serve the repository locally:

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000/global%2038-0.html`. No install or build step is required. Run focused checks after changes:

```powershell
node --check src/app.js
node scripts/validate-data.js
node scripts/random-test.js
node scripts/player-identity-test.js
node scripts/season-loader-test.js
node scripts/position-fit-test.js
node scripts/cloud-storage-test.js
node scripts/cloud-history-limit-test.js
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
