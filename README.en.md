# Global 38-0 | Global All-Stars

[简体中文](README.md) | [English](README.en.md)

A football drafting and season simulation game with Chinese and English interfaces. Draft players from clubs across different seasons, build your own all-time starting eleven, choose a formation, hire a coach, and navigate the transfer window as you compete for league, domestic cup, and European titles.

**[Play online](https://nordlicht-zhc.github.io/global-38-0/) · [Download the Windows portable edition](https://github.com/Nordlicht-zhc/global-38-0/releases/latest)**

## Features

- **Draft across eras:** Draw a season and a club separately, then pick a player who fits your squad. Customize the season range, leagues, formation, and difficulty, with duplicate-player detection across seasons.
- **Full competitions:** Simulate Europe's five major leagues, domestic cups, and European competitions. Review standings, match results, and player statistics, with league-specific competition formats.
- **Coaches and transfers:** Choose a coaching style and use targeted upgrades, free signings, mystery boxes, and deadline-day offers. Dynasty mode also includes loans and end-of-season recruitment.
- **Long-term goals:** Track achievements and past seasons, or take on challenges such as Underdog Miracle, Iron Manager, Time Traveller, Global Dressing Room, Defensive Master, and Club Peak.

## Three game modes

**Classic mode** offers a single-season campaign: draft a squad and challenge for trophies. **Challenge mode** adds squad-building restrictions or performance objectives to the core game. **Dynasty mode** offers a three-tier career in which you retain your squad across seasons and progress through promotion, relegation, transfers, and championship goals.

Classic and Dynasty each have one active save slot, so you can alternate between them. Challenge mode shares the Classic slot. Starting a new game of the same type replaces the corresponding active save, so check whether you want to continue an existing campaign first.

## Local saves

The current version does not offer online accounts or cloud synchronization. Gameplay requires no online backend, and saves are stored locally in the current browser or desktop application's data. Classic/Challenge and Dynasty saves are independent, while Challenge shares the Classic slot. Saves are not automatically transferred when you switch browsers or devices or clear site data; back up your local data before clearing browser storage.

Each season result retains details for the latest 30 matches. League standings, player statistics, achievements, and other save data are not subject to this limit.

## Run locally

The browser edition uses plain HTML, CSS, and JavaScript. No npm dependencies or build step are required. With Python installed, start a static server from the repository root:

```powershell
git clone https://github.com/Nordlicht-zhc/global-38-0.git
cd global-38-0
python -m http.server 8000
```

Then open the [local game page](http://127.0.0.1:8000/global%2038-0.html). Use HTTP so historical season data can load on demand.

Windows users can also download the portable EXE from Releases and run it directly. Install Microsoft Edge WebView2 Runtime first if it is missing from your system. The desktop wrapper and build artifacts are managed separately; the source repository does not include the `desktop/` directory.

## Project structure

| Path | Purpose |
| --- | --- |
| `global 38-0.html`, `index.html` | Game entry point and homepage redirect |
| `src/app.js` | UI interactions, drafting, transfers, and competition flows |
| `src/simulation-core.js` | Seeded league simulation logic |
| `src/storage.js`, `src/save-data.js` | Local persistence, safe serialization, and match-history limits |
| `src/big-five*.js`, `src/season-*.js` | Club, player, and season data and loading logic |
| `history-data/` | Historical data split by season and loaded on demand |
| `assets/club-crests/` | Local club badges and asset attribution |
| `styles.css` | Layout, themes, and animations |
| `docs/` | Development reference documentation |

## Contributing

Read the [repository contribution guidelines](AGENTS.md) before contributing. See the [development reference](docs/DEVELOPMENT.md) for module locations and local preview instructions.
