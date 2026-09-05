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
assert(appSource.includes("journeyLeaguePhase: true"), "Journey Cup must use the new league-phase format.");
assert(appSource.includes("buildEuropeanLeagueRounds(teams, 8, sim.rng)"), "Journey Cup must draw an eight-match league phase.");
assert(appSource.includes("table.slice(0, 16)"), "Journey Cup must send the top 16 directly to the Round of 32.");
assert(appSource.includes("table.slice(16, 48)"), "Journey Cup must send ranks 17-48 to the play-offs.");
assert(appSource.includes("function nextJourneyCupStage"), "Journey Cup must progress from the play-offs into a 32-club knockout path.");
assert(appSource.includes('const stageNames = cup.stages || DOMESTIC_CUP_STAGES;'),
  "Simulation cup progress must use the Journey Cup stage list when present.");
assert(!readSourceFunction("createJourneyCupSimulation").includes("firstRoundByeNames"),
  "The retired Journey Cup bye draw must not be created for Dynasty mode.");
assert(appSource.includes('if (game?.mode === "dynasty")'),
  "Dynasty mode must not allocate European competition places.");
const qualificationContext = {
  EUROPE_ALLOCATION_SEASON: "2026-27",
  isTieredDynasty: (game) => Boolean(game?.mode === "dynasty" && game.dynasty?.type === "tiered")
};
vm.runInNewContext(`${readSourceFunction("getEuropeanQualification")}; this.getEuropeanQualification = getEuropeanQualification;`, qualificationContext);
const dynastyQualification = qualificationContext.getEuropeanQualification({ mode: "dynasty", dynasty: {} }, 1);
assert.strictEqual(dynastyQualification.qualified, false, "Normal Dynasty must not qualify for Europe.");
assert.strictEqual(dynastyQualification.allocation.ucl, 0);
assert.strictEqual(dynastyQualification.allocation.uel, 0);
assert.strictEqual(dynastyQualification.allocation.uecl, 0);
const classicQualification = qualificationContext.getEuropeanQualification({ mode: "classic", league: "eng" }, 1);
assert.strictEqual(classicQualification.qualified, true, "Classic mode European qualification must remain available.");
assert(!html.includes('data-dynasty-type="normal"'), "The removed Big Five dynasty selector is still exposed.");
assert(appSource.includes('dynastyType = dynastyMode ? "tiered" : null'),
  "New dynasty games must always use the Three-Tier Journey.");
assert(appSource.includes("ensureFreeAgentMarket"), "Dynasty free-agent market is missing.");
assert(appSource.includes("recordFreeAgentSigning"), "Free-agent signings must be recorded.");
assert(appSource.includes("function updateDynastyCompletion(game)"),
  "Dynasty completion must be evaluated from the required trophies.");
assert(appSource.includes("function normalizeDynastyCompletionState(game)"),
  "Existing Dynasty saves must be migrated to the trophy-based completion rule.");
assert(appSource.includes("const hasTopTierLeagueTitle"),
  "Dynasty completion must require a top-tier league title.");
assert(appSource.includes("const hasJourneyCupTitle"),
  "Dynasty completion must require a Journey Cup title.");
assert(!appSource.includes("if (fromTier === 1 && finish === 1)"),
  "A top-tier league title alone must not complete the journey.");
const trophyUpdate = appSource.indexOf("game.dynasty.trophies.domesticCup += 1;");
const completionUpdate = appSource.indexOf("updateDynastyCompletion(game);", trophyUpdate);
assert(trophyUpdate >= 0 && completionUpdate > trophyUpdate,
  "Dynasty completion must be checked after the season trophies are recorded.");

const completionContext = {
  isTieredDynasty: (game) => Boolean(game?.mode === "dynasty" && game.dynasty?.type === "tiered")
};
vm.runInNewContext(`${readSourceFunction("dynastyHasCompletionTrophies")}; ${readSourceFunction("updateDynastyCompletion")}; this.updateDynastyCompletion = updateDynastyCompletion;`, completionContext);
const completionGame = (league, cup) => ({
  mode: "dynasty",
  dynasty: {
    type: "tiered",
    completed: false,
    journey: { completed: false },
    trophies: { league, domesticCup: cup }
  },
  result: { journey: { completed: false } }
});
const leagueOnly = completionGame(1, 0);
completionContext.updateDynastyCompletion(leagueOnly);
assert.strictEqual(leagueOnly.dynasty.completed, false, "League title alone must not complete Dynasty.");
const cupOnly = completionGame(0, 1);
completionContext.updateDynastyCompletion(cupOnly);
assert.strictEqual(cupOnly.dynasty.completed, false, "Journey Cup title alone must not complete Dynasty.");
const doubleChampion = completionGame(1, 1);
completionContext.updateDynastyCompletion(doubleChampion);
assert.strictEqual(doubleChampion.dynasty.completed, true, "Both required trophies must complete Dynasty.");
assert.strictEqual(doubleChampion.dynasty.journey.completed, true);
assert.strictEqual(doubleChampion.result.journey.completed, true);

const normalizeContext = {
  isTieredDynasty: completionContext.isTieredDynasty
};
vm.runInNewContext(`${readSourceFunction("dynastyHasCompletionTrophies")}; ${readSourceFunction("normalizeDynastyCompletionState")}; this.normalizeDynastyCompletionState = normalizeDynastyCompletionState;`, normalizeContext);
const staleCompleted = completionGame(1, 0);
staleCompleted.dynasty.completed = true;
staleCompleted.dynasty.journey.completed = true;
staleCompleted.result.journey.completed = true;
assert.strictEqual(normalizeContext.normalizeDynastyCompletionState(staleCompleted), true);
assert.strictEqual(staleCompleted.dynasty.completed, false, "Old league-only completion must be reopened.");
assert.strictEqual(staleCompleted.dynasty.journey.completed, false);
const restoredCompleted = completionGame(1, 1);
assert.strictEqual(normalizeContext.normalizeDynastyCompletionState(restoredCompleted), true);
assert.strictEqual(restoredCompleted.dynasty.completed, true, "A saved double champion must remain completed.");

const activeContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "src", "season-players.js"), "utf8")};this.data=SEASON_PLAYERS;`, activeContext);
vm.runInNewContext(`${fs.readFileSync(path.join(root, "src", "season-standings.js"), "utf8")};this.historicalStandings=HISTORICAL_STANDINGS;`, activeContext);
const activeBigFive = activeContext.data["2025-26"].clubs
  .filter((club) => ["eng", "esp", "ita", "ger", "fra"].includes(club.league));
assert.strictEqual(activeBigFive.length, 96, "The pinned 2025-26 tier pool should contain 96 clubs.");

const profileContext = {
  HISTORICAL_CLUB_IDS: readSourceConst("HISTORICAL_CLUB_IDS"),
  DYNASTY_CLUB_ALIASES: readSourceConst("DYNASTY_CLUB_ALIASES"),
  dynastyStandings: (season, league) => activeContext.historicalStandings[season]?.[league] || [],
  clubsForLeague: (league) => activeBigFive.filter((club) => club.league === league)
};
vm.runInNewContext([
  readSourceFunction("normalizeDynastyClubName"),
  readSourceFunction("findDynastyCanonicalClubId"),
  readSourceFunction("journeyStandingIndex"),
  readSourceFunction("journeyRankIndex")
].join("\n"), profileContext);
const unresolvedHistorical = activeBigFive.filter((club) => (
  profileContext.journeyStandingIndex(club, activeContext.historicalStandings["2025-26"][club.league]) < 0
));
const expectedNewSeasonClubs = new Set([
  "coventry", "hull", "ipswich", "deportivo", "malaga", "racing-santander",
  "frosinone", "monza", "venezia", "paderborn", "schalke", "elversberg", "lemans", "troyes"
]);
assert.deepStrictEqual(new Set(unresolvedHistorical.map((club) => club.id)), expectedNewSeasonClubs,
  `Unexpected clubs without a 2025-26 historical rank: ${unresolvedHistorical.map((club) => club.name).join(", ")}`);
const unresolvedFallback = activeBigFive.filter((club) => (
  profileContext.journeyRankIndex(club, "2025-26") < 0
));
assert.strictEqual(unresolvedFallback.length, 0,
  `All current clubs must resolve through historical rank or current-pool fallback; unresolved: ${unresolvedFallback.map((club) => club.name).join(", ")}`);

const displayNameContext = {
  CURRENT_DATA_SEASON: "2025-26",
  BIG_FIVE_IDS: new Set(["eng", "esp", "ita", "ger", "fra"]),
  JOURNEY_USER_ID: "__journey_user__",
  allClubs: () => activeBigFive,
  isTieredDynasty: (game) => Boolean(game?.mode === "dynasty" && game.dynasty?.type === "tiered")
};
vm.runInNewContext([
  readSourceFunction("normalizeDynastyClubName"),
  readSourceFunction("findDynastySeasonClub"),
  readSourceFunction("synchronizeJourneyClubNames")
].join("\n"), displayNameContext);
const legacyNameGame = {
  mode: "dynasty",
  dynasty: {
    type: "tiered",
    journey: {
      clubs: {
        "ita:inter-milan": { id: "ita:inter-milan", name: "Internazionale", short: "INT", sourceClubId: "inter-milan" },
        "ger:paderborn": { id: "ger:paderborn", name: "SC Paderborn 07", short: "SCP", sourceClubId: "paderborn" }
      }
    }
  }
};
assert.strictEqual(displayNameContext.synchronizeJourneyClubNames(legacyNameGame), true);
assert.strictEqual(legacyNameGame.dynasty.journey.clubs["ita:inter-milan"].name, "Inter Milan");
assert.strictEqual(legacyNameGame.dynasty.journey.clubs["ger:paderborn"].name, "Paderborn");

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
