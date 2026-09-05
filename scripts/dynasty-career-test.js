const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../src/simulation-core.js");
const source = fs.readFileSync(path.join(__dirname, "../src/app.js"), "utf8");
// Top-level function closing braces are indented two spaces, including functions
// with object defaults and nested template expressions.
function fn(name) {
  const start = source.indexOf(`  function ${name}(`);
  assert(start >= 0, name);
  const end = source.indexOf("\n  }", start);
  return source.slice(start, end + 4);
}
function constant(name) {
  const match = source.match(new RegExp(`  const ${name} = ([\\s\\S]*?);`));
  assert(match, name);
  return vm.runInNewContext(`(${match[1]})`);
}
const ctx = {
  G38SimulationCore: core,
  ...core,
  clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
  CURRENT_DATA_SEASON: "2025-26",
  BIG_FIVE_IDS: new Set(["eng", "esp", "ita", "ger", "fra"]),
  calcTeamProfile: (game) => game.testProfile,
  getCoach: () => null,
  applyCoachToProfile: (profile) => profile,
  simulationSeason: (game) => game.dynasty.journey.currentSeason
};
for (const name of ["DYNASTY_JOURNEY_PROFILE_VERSION", "DYNASTY_JOURNEY_PROFILE",
  "DYNASTY_CLUB_ALIASES", "HISTORICAL_CLUB_IDS", "JOURNEY_USER_ID", "JOURNEY_USER_NAME",
  "JOURNEY_DIRECT_MOVEMENT_COUNT", "JOURNEY_PLAYOFF_POSITIONS", "JOURNEY_UPPER_PLAYOFF_POSITIONS"]) {
  ctx[name] = constant(name);
}
vm.createContext(ctx);
const rankTopOverride = process.argv.find((arg) => arg.startsWith("--rank-top="));
if (rankTopOverride) ctx.DYNASTY_JOURNEY_PROFILE = { ...ctx.DYNASTY_JOURNEY_PROFILE,
  rankTop: Number(rankTopOverride.split("=")[1]) };
for (const file of ["season-players", "season-standings"]) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, `../src/${file}.js`), "utf8"), ctx);
}
const clubs = vm.runInContext('SEASON_PLAYERS["2025-26"].clubs', ctx);
const standings = vm.runInContext("HISTORICAL_STANDINGS", ctx);
ctx.allClubs = () => clubs;
ctx.clubsForLeague = (league) => clubs.filter((club) => club.league === league);
ctx.dynastyStandings = (season, league) => standings[season]?.[league] || [];
for (const name of ["normalizeDynastyClubName", "findDynastySeasonClub", "findDynastyCanonicalClubId",
  "journeyStandingIndex", "journeyRankIndex", "calcClubProfile", "dynastyRankProfile",
  "journeyProfileForClub", "journeyClubKey", "buildJourneyClubPool", "createJourneyState",
  "journeyRecordForName", "journeyProfileMap", "refreshJourneySeason", "journeyClubName",
  "journeyPlayoffTeam", "journeyRankedIds", "sortJourneyIds", "removeJourneyId", "swapJourneyIds",
  "journeyPlayoffResult", "simulateAIMatches", "simulateJourneyTierTable", "simulateJourneyPlayoffs",
  "createEuropeanTie", "simulateEuropeanTie", "finalizeEuropeanTie", "simulateTwoLegTie",
  "simulateEuropeanExtraTime", "simulateEuropeanPenalties"]) {
  vm.runInContext(fn(name), ctx);
}
const clone = (value) => JSON.parse(JSON.stringify(value));
const profile = (rating) => ({ attack: rating - 1, midfield: rating, defense: rating - 1,
  goalkeeper: rating - 1, overall: rating });
function gameFor(seed, rating = 85) {
  return { id: seed, mode: "dynasty", randomState: 12345, testProfile: profile(rating),
    dynasty: { type: "tiered", journey: ctx.createJourneyState("2025-26") }, result: {} };
}
function playLeague(game, names, profiles, seed) {
  const table = core.createLeagueTable(names);
  const elo = core.createEloMap(profiles);
  const rng = core.makeRng(core.hashSeed(seed));
  const schedule = core.createLeagueSchedule(names, ctx.JOURNEY_USER_NAME, { doubleRound: false });
  let half;
  schedule.forEach((match, index) => {
    const result = core.simulateLeagueResult(profiles[match.home], profiles[match.away], rng,
      match.home, elo[match.home], elo[match.away]);
    elo[match.home] = result.newEloHome;
    elo[match.away] = result.newEloAway;
    core.applyLeagueResult(table, match.home, match.away, result.gf, result.ga);
    if (index === 239) half = core.sortLeagueRows(table).findIndex((row) => row.isUser) + 1;
  });
  return { table: core.sortLeagueRows(table).map((row, index) => ({ ...row, position: index + 1 })), half };
}
function userLeague(game) {
  const journey = game.dynasty.journey;
  const names = journey.tiers[journey.tier - 1].map((id) => ctx.journeyClubName(game, id));
  const profiles = ctx.journeyProfileMap(game, names);
  profiles[ctx.JOURNEY_USER_NAME] = game.testProfile;
  return playLeague(game, names, profiles, `${game.id}|player|${journey.seasonNumber}`).table;
}

// Migration changes profiles only at the next-season boundary, preserving results
// and the promoted/relegated pool. Current-version saves are not recalculated.
const old = gameFor("migration");
delete old.dynasty.journey.profileVersion;
Object.values(old.dynasty.journey.clubs).filter((record) => !record.isUser)
  .forEach((record) => { record.profile = profile(94); });
old.result = { finish: 20, marker: "historical-result" };
const oldTiers = JSON.stringify(old.dynasty.journey.tiers);
ctx.refreshJourneySeason(old, "2026-27");
assert.strictEqual(old.dynasty.journey.profileVersion, ctx.DYNASTY_JOURNEY_PROFILE_VERSION);
assert.strictEqual(JSON.stringify(old.dynasty.journey.tiers), oldTiers);
assert.strictEqual(old.result.marker, "historical-result");
for (const record of Object.values(old.dynasty.journey.clubs).filter((item) => !item.isUser)) {
  const club = clubs.find((item) => item.id === record.sourceClubId);
  assert.deepStrictEqual(clone(record.profile), clone(ctx.journeyProfileForClub(club, "2025-26")));
}
const migratedProfiles = JSON.stringify(old.dynasty.journey.clubs);
ctx.refreshJourneySeason(old, "2027-28");
assert.strictEqual(JSON.stringify(old.dynasty.journey.clubs), migratedProfiles);

const careers = Number(process.argv.find((arg) => arg.startsWith("--careers="))?.split("=")[1] || 40);
const snapshots = [[], [], []];
let nonStaticTables = 0;
for (let run = 0; run < careers; run += 1) {
  let game = gameFor(`career-${run}`, 84 + run % 5);
  const originalIds = game.dynasty.journey.tiers.flat().sort().join("|");
  for (let season = 1; season <= 5; season += 1) {
    const journey = game.dynasty.journey;
    journey.seasonNumber = season;
    ctx.refreshJourneySeason(game, "2025-26");
    game.result = {};
    const table = userLeague(game);
    game.result.finish = table.find((row) => row.isUser).position;
    const resumed = clone(game);
    const before = clone(journey.tiers);
    ctx.simulateJourneyPlayoffs(game, table);
    ctx.simulateJourneyPlayoffs(resumed, clone(table));
    assert.deepStrictEqual(clone(game), clone(resumed), "Save/resume must be deterministic");
    const settled = JSON.stringify(game);
    ctx.simulateJourneyPlayoffs(game, table);
    assert.strictEqual(JSON.stringify(game), settled, "Settlement must be idempotent");
    assert.strictEqual(game.randomState, 12345, "AI leagues must not consume player RNG");
    assert.strictEqual(journey.tiers.flat().sort().join("|"), originalIds);
    assert(journey.tiers.every((tier) => tier.length === 32));
    assert(journey.tiers[journey.tier - 1].includes(ctx.JOURNEY_USER_ID));
    before.forEach((ids, index) => ids.forEach((id) => {
      const nextIndex = journey.tiers.findIndex((tier) => tier.includes(id));
      assert(Math.abs(nextIndex - index) <= 1, "No club may skip a tier");
    }));
    const tables = game.result.journeyPlayoffs.leagueTables;
    for (let upper = 0; upper < 2; upper += 1) {
      const idFor = (name) => before.flat().find((id) => ctx.journeyClubName(game, id) === name);
      tables[upper].slice(-6).forEach((row) => {
        assert(journey.tiers[upper + 1].includes(idFor(row.name)), "Bottom six must be relegated");
      });
      tables[upper + 1].slice(0, 6).forEach((row) => {
        assert(journey.tiers[upper].includes(idFor(row.name)), "Top six must be promoted");
      });
    }
    game.result.journeyPlayoffs.leagueTables.forEach((rows, index) => {
      assert.strictEqual(rows.length, 32);
      assert(rows.every((row) => row.played === 31));
      assert.strictEqual(new Set(rows.map((row) => row.name)).size, 32);
      const staticNames = ctx.sortJourneyIds(game, before[index]).map((id) => ctx.journeyClubName(game, id));
      if (rows.map((row) => row.name).join() !== staticNames.join()) nonStaticTables += 1;
      if ([1, 3, 5].includes(season)) {
        const strengths = journey.tiers[index].filter((id) => id !== ctx.JOURNEY_USER_ID)
          .map((id) => core.teamStrength(journey.clubs[id].profile));
        snapshots[index].push({ season, mean: strengths.reduce((a, b) => a + b, 0) / strengths.length });
      }
    });
    game = clone(game);
  }
}
assert(nonStaticTables > careers * 5, "Background leagues must not use static strength order");
console.log(`Career PASS: ${careers} careers x 5 seasons; migration, 96 unique clubs, 32/32/32, real tables, replay, idempotence.`);
for (const season of [1, 3, 5]) {
  const means = snapshots.map((entries) => {
    const values = entries.filter((entry) => entry.season === season);
    return values.reduce((sum, entry) => sum + entry.mean, 0) / values.length;
  });
  assert(means[0] > means[1] + 1 && means[1] > means[2] + 1, "Career tier strength gradient must persist");
  console.log(`After season ${season} AI tier means:`, means.map((mean) => mean.toFixed(2)).join(" / "));
}

const runs = Number(process.argv.find((arg) => arg.startsWith("--runs="))?.split("=")[1] || 1000);
const pool = ctx.buildJourneyClubPool("2025-26");
const measurements = [];
for (let tier = 0; tier < 3; tier += 1) {
  for (const rating of (tier === 0 ? [84, 85, 86, 87, 88] : [80, 82, 85])) {
    const opponents = pool.slice(tier * 32, tier * 32 + 31);
    const names = [...opponents.map((record) => record.name), ctx.JOURNEY_USER_NAME];
    const profiles = Object.fromEntries(opponents.map((record) => [record.name, record.profile]));
    profiles[ctx.JOURNEY_USER_NAME] = profile(rating);
    let rank = 0; let titles = 0; let top6 = 0; let half20 = 0; let points = 0;
    for (let run = 0; run < runs; run += 1) {
      const result = playLeague(null, names, profiles, `balance|${tier}|${rating}|${run}`);
      const row = result.table.find((item) => item.isUser);
      rank += row.position; points += row.points;
      titles += row.position === 1; top6 += row.position <= 6; half20 += result.half >= 20;
    }
    const measurement = { tier: tier + 1, rating, runs, rank: +(rank / runs).toFixed(2),
      points: +(points / runs).toFixed(1), titlePct: titles * 100 / runs,
      top6Pct: top6 * 100 / runs, half20Pct: half20 * 100 / runs };
    measurements.push(measurement);
    console.log(JSON.stringify(measurement));
  }
}
if (runs >= 1000 && !rankTopOverride) {
  const result = (tier, rating) => measurements.find((row) => row.tier === tier && row.rating === rating);
  assert(result(1, 85).rank >= 6 && result(1, 85).rank <= 11, "85-rated Tier 1 team should compete around top 6-10");
  assert(result(1, 86).titlePct >= 10 && result(1, 86).titlePct <= 30, "86 should contend, not dominate");
  assert(result(2, 80).rank > result(3, 80).rank + 3, "Tier 2 must remain harder than Tier 3");
  assert(result(2, 85).top6Pct >= 70 && result(3, 85).top6Pct >= 90);
}
