const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../src/simulation-core.js");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");

function readSourceConst(name) {
  const marker = `const ${name} = `;
  const start = appSource.indexOf(marker);
  assert(start >= 0, `Source constant ${name} is missing.`);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start + marker.length; index < appSource.length; index += 1) {
    const character = appSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) {
      return vm.runInNewContext(`(${appSource.slice(start + marker.length, index + 1)})`);
    }
  }
  throw new Error(`Could not parse source constant ${name}.`);
}

function readSourceFunction(name) {
  const start = appSource.indexOf(`function ${name}(`);
  assert(start >= 0, `Source function ${name} is missing.`);
  const bodyStart = appSource.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (["\"", "'", "`"].includes(character)) {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Could not parse source function ${name}.`);
}

assert(appSource.includes('type: "tiered"'), "Tiered dynasty state is missing.");
assert(appSource.includes('createJourneyState(CURRENT_DATA_SEASON, dynastyStart)'),
  "Tiered dynasty must pin its club pool to 2025-26.");
assert(!appSource.includes('dynastyStartSeason') && !html.includes('dynastyStartSeason'),
  "The removed historical dynasty season selector is still referenced.");
assert(appSource.includes('const dynastyStart = dynastyMode ? CURRENT_DATA_SEASON'),
  "Tiered dynasty should start directly from 2025-26.");
assert(appSource.includes("simulateJourneyPlayoffs"), "Promotion and relegation playoff logic is missing.");
assert(appSource.includes("JOURNEY_DIRECT_MOVEMENT_COUNT = 6"), "Journey direct movement count is missing.");
assert(appSource.includes("doubleRound: false"), "Three-tier mode must use a single round robin.");
assert(appSource.includes("createJourneyCupSimulation"), "Three-tier mode must create the Journey Cup.");
assert(appSource.includes('roundTargets = [64, 32, 16, 8, 4, 2, 1]'), "Journey Cup must include all 96 clubs in a knockout path.");
assert(appSource.includes('const stageNames = cup.stages || DOMESTIC_CUP_STAGES;'),
  "Simulation cup progress must use the Journey Cup stage list when present.");
assert(appSource.includes("firstRoundByeNames"), "Journey Cup must persist seeded first-round byes.");
assert(appSource.includes("cup.roundIndex === 1"), "Journey Cup must protect seeded clubs in the Round of 64 draw.");
assert(appSource.includes('qualified: false,\n        competition: null,\n        competitionName: "三级征途不参加欧战"'),
  "Three-tier mode must not allocate European competition places.");
assert(!html.includes('data-dynasty-type="normal"'), "The removed Big Five dynasty selector is still exposed.");
assert(appSource.includes('dynastyType = dynastyMode ? "tiered" : null'),
  "New dynasty games must always use the Three-Tier Journey.");
assert(appSource.includes("ensureFreeAgentMarket"), "Dynasty free-agent market is missing.");
assert(appSource.includes("recordFreeAgentSigning"), "Free-agent signings must be recorded.");

const activeContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "src", "season-players.js"), "utf8")};this.data=SEASON_PLAYERS;`, activeContext);
vm.runInNewContext(`${fs.readFileSync(path.join(root, "src", "season-standings.js"), "utf8")};this.historicalStandings=HISTORICAL_STANDINGS;`, activeContext);
const activeBigFive = activeContext.data["2025-26"].clubs
  .filter((club) => ["eng", "esp", "ita", "ger", "fra"].includes(club.league));
assert.strictEqual(activeBigFive.length, 96, "The pinned 2025-26 tier pool should contain 96 clubs.");

const profileContext = {
  HISTORICAL_CLUB_IDS: readSourceConst("HISTORICAL_CLUB_IDS"),
  DYNASTY_CLUB_ALIASES: readSourceConst("DYNASTY_CLUB_ALIASES")
};
vm.runInNewContext([
  readSourceFunction("normalizeDynastyClubName"),
  readSourceFunction("findDynastyCanonicalClubId"),
  readSourceFunction("journeyStandingIndex")
].join("\n"), profileContext);
const unresolved = activeBigFive.filter((club) => (
  profileContext.journeyStandingIndex(club, activeContext.historicalStandings["2025-26"][club.league]) < 0
));
assert.strictEqual(unresolved.length, 0,
  `All 96 journey clubs must resolve to a standings rank; unresolved: ${unresolved.map((club) => club.name).join(", ")}`);

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
