const fs = require("fs");
const vm = require("vm");
const core = require("../simulation-core.js");

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));
const runs = Math.max(1, Number(args.runs || 1000));
const baseSeed = String(args.seed || "g38-balance-v1");
const outputJson = args.json === "true";
const leagueNames = { eng: "ENG", esp: "ESP", ita: "ITA", ger: "GER", fra: "FRA" };
const uclPlaces = { eng: 5, esp: 5, ita: 4, ger: 4, fra: 3 };

function loadSeasonPlayers() {
  const context = {};
  vm.createContext(context);
  const source = fs.readFileSync("season-players.js", "utf8");
  vm.runInContext(`${source};globalThis.__data = SEASON_PLAYERS["2025-26"];`, context);
  return context.__data;
}

function readObjectConstant(name) {
  const source = fs.readFileSync("app.js", "utf8");
  const marker = `const ${name} = `;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing ${name} in app.js.`);
  const start = markerIndex + marker.length;
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
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
      return vm.runInNewContext(`(${source.slice(start, index + 1)})`);
    }
  }
  throw new Error(`Could not parse ${name}.`);
}

function positionUnit(player) {
  const position = Array.isArray(player.pos) ? player.pos[0] : player.pos;
  if (position === "GK") return "GK";
  if (["RB", "CB", "LB", "RWB", "LWB"].includes(position)) return "DEF";
  if (["CDM", "CM", "CAM", "RM", "LM"].includes(position)) return "MID";
  return "ATT";
}

function calcClubProfile(club) {
  const units = { ATT: [], MID: [], DEF: [], GK: [] };
  club.players.forEach((player) => units[positionUnit(player)].push(Number(player.rate || 0)));
  const topAverage = (list, count) => {
    const values = [...list].sort((a, b) => b - a).slice(0, count);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 78;
  };
  const attack = topAverage([...units.ATT, ...units.MID], 5);
  const midfield = topAverage(units.MID, 4);
  const defense = topAverage([...units.DEF, ...units.GK], 5);
  const goalkeeper = topAverage(units.GK, 1);
  return {
    attack,
    midfield,
    defense,
    goalkeeper,
    overall: Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14)
  };
}

function buildProfiles(clubs, league, eliteStrength, historicalIds) {
  const eliteKey = (club) => Object.keys(eliteStrength)
    .find((id) => id === club.id || (historicalIds[id] || []).includes(club.id));
  const rows = clubs.map((club) => ({ club, profile: calcClubProfile(club), elite: eliteKey(club) }))
    .sort((a, b) => (b.elite ? eliteStrength[b.elite] : 0) - (a.elite ? eliteStrength[a.elite] : 0)
      || b.profile.overall - a.profile.overall);
  rows.forEach((row, index) => {
    const fallback = rows.length > 1 ? Math.round(82 - (index / (rows.length - 1)) * 12) : 78;
    let normalized = row.elite
      ? Math.max(70, Math.min(94, Math.round(eliteStrength[row.elite] * 0.65 + row.profile.overall * 0.35)))
      : fallback;
    if (league === "fra" && row.club.id !== "paris-sg") normalized = Math.max(68, normalized - 2);
    const delta = normalized - row.profile.overall;
    row.profile.attack = Math.max(40, Math.min(99, row.profile.attack + Math.round(delta * 0.35)));
    row.profile.midfield = Math.max(40, Math.min(99, row.profile.midfield + Math.round(delta * 0.25)));
    row.profile.defense = Math.max(40, Math.min(99, row.profile.defense + Math.round(delta * 0.25)));
    row.profile.goalkeeper = Math.max(40, Math.min(99, row.profile.goalkeeper + Math.round(delta * 0.15)));
    row.profile.overall = normalized;
  });
  return Object.fromEntries(rows.map((row) => [row.club.name, row.profile]));
}

function simulateLeague(league, profiles, iteration) {
  const names = Object.keys(profiles);
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|${league}|${iteration}`));
  const schedule = core.createLeagueSchedule(names, "__no_user__");
  const table = core.createLeagueTable(names, "__no_user__");
  const elo = core.createEloMap(profiles);
  schedule.forEach((match) => {
    const result = core.simulateLeagueResult(
      profiles[match.home], profiles[match.away], rng, match.home, elo[match.home], elo[match.away]
    );
    elo[match.home] = result.newEloHome;
    elo[match.away] = result.newEloAway;
    core.applyLeagueResult(table, match.home, match.away, result.gf, result.ga);
  });
  return core.sortLeagueRows(table);
}

const season = loadSeasonPlayers();
const eliteStrength = readObjectConstant("ELITE_STRENGTH");
const historicalIds = readObjectConstant("HISTORICAL_CLUB_IDS");
const report = { runs, seed: baseSeed, leagues: {}, warnings: [] };

Object.keys(leagueNames).forEach((league) => {
  const clubs = season.clubs.filter((club) => club.league === league);
  const profiles = buildProfiles(clubs, league, eliteStrength, historicalIds);
  const stats = Object.fromEntries(clubs.map((club) => [club.name, {
    champion: 0,
    ucl: 0,
    relegated: 0,
    points: 0,
    positions: 0,
    strength: profiles[club.name].overall
  }]));
  for (let iteration = 0; iteration < runs; iteration += 1) {
    simulateLeague(league, profiles, iteration).forEach((row, index, rows) => {
      const entry = stats[row.name];
      entry.champion += index === 0 ? 1 : 0;
      entry.ucl += index < uclPlaces[league] ? 1 : 0;
      entry.relegated += index >= rows.length - (league === "ger" ? 2 : 3) ? 1 : 0;
      entry.points += row.points;
      entry.positions += index + 1;
    });
  }
  report.leagues[league] = Object.entries(stats).map(([name, entry]) => ({
    name,
    strength: entry.strength,
    championPct: Number((entry.champion * 100 / runs).toFixed(1)),
    uclPct: Number((entry.ucl * 100 / runs).toFixed(1)),
    relegationPct: Number((entry.relegated * 100 / runs).toFixed(1)),
    averagePoints: Number((entry.points / runs).toFixed(1)),
    averagePosition: Number((entry.positions / runs).toFixed(2))
  })).sort((a, b) => b.championPct - a.championPct || a.averagePosition - b.averagePosition);
  const leaders = report.leagues[league];
  if (leaders[0].championPct >= 65) {
    report.warnings.push(`${leagueNames[league]}: ${leaders[0].name} wins ${leaders[0].championPct}% of titles.`);
  }
  if (leaders.slice(0, 2).reduce((sum, row) => sum + row.championPct, 0) >= 85) {
    report.warnings.push(`${leagueNames[league]}: the top two clubs win at least 85% of titles.`);
  }
});

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Global 38-0 balance test | runs=${runs} per league | seed=${baseSeed}`);
  Object.entries(report.leagues).forEach(([league, rows]) => {
    console.log(`\n${leagueNames[league]} | top 8`);
    console.table(rows.slice(0, 8).map((row) => ({
      Team: row.name,
      OVR: row.strength,
      "Champion %": row.championPct,
      "UCL %": row.uclPct,
      "Avg pts": row.averagePoints,
      "Avg pos": row.averagePosition
    })));
    const championTotal = rows.reduce((sum, row) => sum + row.championPct, 0);
    if (Math.abs(championTotal - 100) > 0.6) throw new Error(`${league} champion rates total ${championTotal}%.`);
  });
  if (report.warnings.length) {
    console.log("\nBalance warnings");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}
