# Development reference

Look up the section relevant to the task. The commands below are options, not a suite to run after every change.

## Local preview

From the repository root, run `python -m http.server 8000` and open `http://127.0.0.1:8000/global%2038-0.html`. The browser edition has no build step or package manager. Browser interaction and screenshots provide evidence that static checks and HTTP responses cannot.

## Module map

| Area | Files |
| --- | --- |
| UI and game flows | `src/app.js`, `styles.css` |
| Seeded league simulation | `src/simulation-core.js` |
| Local persistence | `src/storage.js` |
| Formations, leagues, current club metadata | `src/data.js`, `src/big-five*.js` |
| Active 2025-26 player pool | `src/season-players.js` |
| Historical season loading | `src/season-data.js`, `history-data/` |
| Historical league tables for dynasty mode | `src/season-standings.js` |
| Cross-season player identity | `src/player-identity.js` |
| Position compatibility and midfielder penalties | `src/position-fit.js` |
| European entrants and profiles | `src/european-clubs.js` |
| Local save serialization and match-history cap | `src/save-data.js` |

`source-data/` holds regeneration inputs; `archive/` holds retired reference code. Neither is a runtime module directory. The ignored `desktop/` wrapper is packaged separately with `desktop/build-portable.ps1`.

## Focused checks

Run Node scripts from the repository root. There is no test framework or coverage threshold; executable regression checks use `scripts/*-test.js`.

| Changed area | Relevant entry points (select by behavior) |
| --- | --- |
| JavaScript syntax | `node --check <changed-file.js>` |
| Player/club data | `node scripts/validate-data.js` |
| Random selection | `node scripts/random-test.js` |
| Player identity | `node scripts/player-identity-test.js` |
| Season loading | `node scripts/season-loader-test.js` |
| Position fit | `node scripts/position-fit-test.js` |
| Local history limit and save serialization | `node scripts/save-history-limit-test.js` |
| Dynasty behavior | `node scripts/dynasty-test.js` |
| Journey migrations, promotion/relegation, multi-season behavior | `node scripts/dynasty-career-test.js`, `node scripts/dynasty-tier-test.js` |
| Dynasty transfer pools, free agents, loans | `node scripts/dynasty-transfer-test.js` |

Additional feature-specific checks live in `scripts/`; inspect the relevant script for its scope. For match-strength or competition-balance changes, reproducible comparison commands include:

```powershell
node scripts/balance-test.js --runs=1000 --seed=review
node scripts/cup-europe-balance-test.js --runs=1000 --seed=review
```

Choose sample size for the question being tested and preserve the seed when comparing results. These simulations are not required for unrelated UI or documentation changes.

## Generated data

When changing historical season data, regenerate affected outputs through the existing scripts:

```powershell
node scripts/split-season-data.js
node scripts/generate-season-standings.js
```

The first generates `history-data/` chunks; the second generates `src/season-standings.js`. Run only the generator relevant to the requested data change and inspect its output scope.
