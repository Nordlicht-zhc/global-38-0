# Development reference

Module locations and the local preview entry point.

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
| Club badges and display-name aliases | `src/club-crests.js`, `assets/club-crests/` |

The ignored `desktop/` wrapper is managed locally and packaged with `desktop/build-portable.ps1`. The source repository contains the browser game and its runtime data and assets.
