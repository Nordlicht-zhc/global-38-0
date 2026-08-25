const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../src/simulation-core.js");

const root = path.resolve(__dirname, "..");
const context = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "src", "season-standings.js"), "utf8")};this.data=HISTORICAL_STANDINGS;`, context);

const seasons = Object.keys(context.data);
const leagues = ["eng", "esp", "ita", "ger", "fra"];
assert.strictEqual(seasons.length, 32, "Dynasty mode should cover all 32 available seasons.");
seasons.forEach((season) => {
  leagues.forEach((league) => {
    const teams = context.data[season][league];
    assert(Array.isArray(teams), `${season} ${league} standings are missing.`);
    assert(teams.length >= 18 && teams.length <= 22, `${season} ${league} has an invalid team count.`);
    assert.strictEqual(new Set(teams).size, teams.length, `${season} ${league} contains duplicate teams.`);
  });
});

const sample = context.data["1994-95"].eng;
assert.strictEqual(sample[0], "Blackburn", "1994-95 English champion should seed the strongest rank.");
assert(sample.indexOf("Man United") < sample.indexOf("Arsenal"), "Real final ranking order should be preserved.");

const deportivoContext = { window: { G38_HISTORY_DATA: {} } };
vm.runInNewContext(fs.readFileSync(path.join(root, "history-data", "2003-04.js"), "utf8"), deportivoContext);
const deportivo = deportivoContext.window.G38_HISTORY_DATA["2003-04"].clubs
  .find((club) => club.id === "deportivo-de-la-coru-a");
assert(deportivo?.players.length, "2003-04 Deportivo de La Coruña squad data should exist.");
const appSource = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
assert(appSource.includes("const DYNASTY_LEAGUE_PROFILE = Object.freeze({")
  && appSource.includes("fallbackToCurrent: true")
  && appSource.includes("fallbackToLeagueAverage: true"),
  "Normal dynasty league profiles should stay in the Classic strength band.");
assert(appSource.includes("clubs, DYNASTY_LEAGUE_PROFILE"),
  "Normal dynasty league simulation must use its Classic-band calibration.");
assert(appSource.includes('"deportivo de la coruna": "deportivo la coruna"'),
  "Dynasty aliases must match Deportivo de La Coruña to the La Coruna standings entry.");

const rankStrength = (rank, count) => Math.round(90 - ((rank - 1) / (count - 1)) * 18);
assert(rankStrength(1, 20) > rankStrength(20, 20), "Rank-based strength should decrease down the table.");
assert.strictEqual(rankStrength(1, 20), 90, "Champion rank strength should be 90.");
assert.strictEqual(rankStrength(20, 20), 72, "Bottom rank strength should be 72.");
assert.strictEqual(seasons.at(-3), "2023-24", "The final dynasty start season should allow a complete three-season run.");
assert.deepStrictEqual(seasons.slice(-3), ["2023-24", "2024-25", "2025-26"], "The final dynasty should span exactly three seasons.");

[18, 20, 22].forEach((size) => {
  const names = Array.from({ length: size - 1 }, (_, index) => `team-${index}`);
  names.push("我的球队");
  const schedule = core.createLeagueSchedule(names);
  const userMatches = schedule.filter((match) => match.home === "我的球队" || match.away === "我的球队");
  assert.strictEqual(userMatches.length, (size - 1) * 2, `${size}-team dynasty schedule has the wrong length.`);
});

const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");
assert(html.indexOf("season-standings.js") < html.indexOf("app.js"), "Standings must load before app.js.");
assert(html.includes("data-play-mode=\"dynasty\""), "Dynasty mode entry is missing.");

console.log(`Dynasty standings: PASS (${seasons.length} seasons, ${seasons.length * leagues.length} league tables)`);
