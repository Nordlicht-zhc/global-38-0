const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../simulation-core.js");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");

assert(appSource.includes('type: "tiered"'), "Tiered dynasty state is missing.");
assert(appSource.includes('createJourneyState(CURRENT_DATA_SEASON, dynastyStart)'),
  "Tiered dynasty must pin its club pool to 2025-26.");
assert(appSource.includes('!dynastyMode || state.dynastyType === "tiered"'),
  "Tiered dynasty should hide the historical season selector.");
assert(appSource.includes('dynastyType === "tiered" ? CURRENT_DATA_SEASON'),
  "Tiered dynasty should start directly from 2025-26.");
assert(appSource.includes("swapJourneyBoundary"), "Promotion and relegation logic is missing.");
assert(appSource.includes("doubleRound: false"), "Three-tier mode must use a single round robin.");
assert(appSource.includes("createJourneyCupSimulation"), "Three-tier mode must create the Journey Cup.");
assert(appSource.includes('roundTargets = [64, 32, 16, 8, 4, 2, 1]'), "Journey Cup must include all 96 clubs in a knockout path.");
assert(appSource.includes('qualified: false,\n        competition: null,\n        competitionName: "三级征途不参加欧战"'),
  "Three-tier mode must not allocate European competition places.");
assert(html.includes('data-dynasty-type="normal"'), "Big Five dynasty selector is missing.");
assert(html.includes('data-dynasty-type="tiered"'), "Three-tier dynasty selector is missing.");

const activeContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "season-players.js"), "utf8")};this.data=SEASON_PLAYERS;`, activeContext);
const activeBigFive = activeContext.data["2025-26"].clubs
  .filter((club) => ["eng", "esp", "ita", "ger", "fra"].includes(club.league));
assert.strictEqual(activeBigFive.length, 96, "The pinned 2025-26 tier pool should contain 96 clubs.");

const seasons = ["1994-95", "2003-04", "2023-24"];
seasons.forEach((season) => {
  const context = { window: { G38_HISTORY_DATA: {} } };
  vm.runInNewContext(fs.readFileSync(path.join(root, "history-data", `${season}.js`), "utf8"), context);
  const clubs = context.window.G38_HISTORY_DATA[season].clubs
    .filter((club) => ["eng", "esp", "ita", "ger", "fra"].includes(club.league));
  const base = Math.floor(clubs.length / 3);
  const remainder = clubs.length % 3;
  const sizes = [base + (remainder > 0 ? 1 : 0), base + (remainder > 1 ? 1 : 0), base];
  assert.strictEqual(sizes.reduce((sum, size) => sum + size, 0), clubs.length);
  assert(sizes.every((size) => size >= 30), `${season} tiers are unexpectedly small.`);
});

const names = Array.from({ length: 32 }, (_, index) => index === 0 ? "我的球队" : `team-${index}`);
const schedule = core.createLeagueSchedule(names, "我的球队", { doubleRound: false });
assert.strictEqual(schedule.length, 496, "32-team journey should have 496 single-round fixtures.");
assert.strictEqual(schedule.filter((match) => match.home === "我的球队" || match.away === "我的球队").length, 31);

console.log("Dynasty tier journey: PASS (selectors, historical pools, single-round schedule)");
