const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../src/simulation-core.js");

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));
const runs = Math.max(100, Number(args.runs || 300));
const baseSeed = String(args.seed || "dynasty-league-review");
const outputJson = args.json === "true";
const seasons = String(args.seasons || "1994-95,2003-04,2015-16,2023-24")
  .split(",").map((season) => season.trim()).filter(Boolean);
const leagues = ["eng", "esp", "ita", "ger", "fra"];
const strengths = [75, 80, 85, 90];
const dynastyRankTop = Number(args.rankTop || 90);
const dynastyRankBottom = Number(args.rankBottom || 66);
const dynastyRankWeight = Number(args.rankWeight || 0.8);
const leagueNames = { eng: "ENG", esp: "ESP", ita: "ITA", ger: "GER", fra: "FRA" };
const root = path.resolve(__dirname, "..");

function loadData() {
  const context = {};
  vm.createContext(context);
  [
    "src/data.js",
    "src/big-five.js",
    "src/big-five-italy.js",
    "src/big-five-germany.js",
    "src/big-five-france.js",
    "src/season-standings.js"
  ].forEach((file) => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context));
  vm.runInContext(
    "globalThis.__data = { clubs: CLUBS, standings: HISTORICAL_STANDINGS };",
    context
  );
  return context.__data;
}

function loadSeasonClubs(season) {
  const context = { window: { G38_HISTORY_DATA: {} } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, "history-data", `${season}.js`), "utf8"), context);
  return context.window.G38_HISTORY_DATA[season]?.clubs || [];
}

function loadCurrentSeasonClubs() {
  const context = {};
  vm.createContext(context);
  const source = fs.readFileSync(path.join(root, "src", "season-players.js"), "utf8");
  vm.runInContext(`${source};globalThis.__data = SEASON_PLAYERS["2025-26"];`, context);
  return context.__data?.clubs || [];
}

function readObjectConstant(name) {
  const source = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");
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

const data = loadData();
const promotedTeams = readObjectConstant("PROMOTED_TEAMS");
const eliteStrength = readObjectConstant("ELITE_STRENGTH");
const historicalIds = readObjectConstant("HISTORICAL_CLUB_IDS");
const seasonClubs = Object.fromEntries(seasons.map((season) => [season, loadSeasonClubs(season)]));
seasonClubs["2025-26"] = loadCurrentSeasonClubs();
const aliases = {
  "man city": "manchester city",
  "man united": "manchester united",
  "nott m forest": "nottingham forest",
  qpr: "queens park rangers",
  "ath madrid": "atletico madrid",
  "ath bilbao": "athletic bilbao",
  "la coruna": "deportivo la coruna",
  "deportivo de la coruna": "deportivo la coruna",
  sociedad: "real sociedad",
  betis: "real betis",
  "paris sg": "paris saint germain",
  lyon: "olympique lyon",
  marseille: "olympique marseille",
  "m gladbach": "borussia monchengladbach",
  dortmund: "borussia dortmund",
  leverkusen: "bayer leverkusen",
  "bayern munich": "bayern munchen",
  inter: "inter milan",
  milan: "ac milan"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeClubName(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(football club|club de futbol|calcio|fc|cf|ssc|1)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return aliases[normalized] || normalized;
}

function findSeasonClub(name, clubs) {
  const target = normalizeClubName(name);
  const exact = clubs.filter((club) => [club.name, club.short, club.id]
    .some((value) => normalizeClubName(value) === target));
  if (exact.length === 1) return exact[0];
  const partial = clubs.filter((club) => {
    const clubName = normalizeClubName(club.name);
    return clubName.includes(target) || target.includes(clubName);
  });
  return partial.length === 1 ? partial[0] : null;
}

function findCanonicalClubId(name) {
  const target = normalizeClubName(name);
  const entries = Object.entries(historicalIds || {});
  const exact = entries.filter(([id, aliases]) => [id, ...(aliases || [])]
    .some((value) => normalizeClubName(value) === target));
  if (exact.length === 1) return exact[0][0];
  const partial = entries.filter(([id, aliases]) => [id, ...(aliases || [])].some((value) => {
    const candidate = normalizeClubName(value);
    return candidate.includes(target) || target.includes(candidate);
  }));
  return partial.length === 1 ? partial[0][0] : null;
}

function findCurrentClub(name) {
  const current = findSeasonClub(name, seasonClubs["2025-26"]);
  if (current) return current;
  const canonicalId = findCanonicalClubId(name);
  if (!canonicalId) return null;
  return findSeasonClub(canonicalId, seasonClubs["2025-26"])
    || data.clubs[canonicalId]
    || null;
}

function rankFallbackProfile(rankStrength, clubs) {
  const knownProfiles = clubs.filter((club) => Array.isArray(club?.players) && club.players.length)
    .map((club) => calcClubProfile(club));
  if (!knownProfiles.length) {
    return {
      attack: clamp(rankStrength + 1, 40, 99),
      midfield: clamp(rankStrength, 40, 99),
      defense: clamp(rankStrength - 1, 40, 99),
      goalkeeper: clamp(rankStrength - 2, 40, 99),
      overall: rankStrength
    };
  }
  const average = (key) => Math.round(knownProfiles.reduce((sum, profile) => sum + profile[key], 0) / knownProfiles.length);
  return {
    attack: clamp(average("attack"), 40, 99),
    midfield: clamp(average("midfield"), 40, 99),
    defense: clamp(average("defense"), 40, 99),
    goalkeeper: clamp(average("goalkeeper"), 40, 99),
    overall: clamp(average("overall"), 40, 99)
  };
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
  (club?.players || []).forEach((player) => units[positionUnit(player)].push(Number(player.rate || 0)));
  const topAverage = (list, count) => {
    const values = list.slice().sort((left, right) => right - left).slice(0, count);
    return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 78;
  };
  const attack = topAverage([...units.ATT, ...units.MID], 5);
  const midfield = topAverage(units.MID, 4);
  const defense = topAverage([...units.DEF, ...units.GK], 5);
  const goalkeeper = topAverage(units.GK, 1);
  return {
    attack: clamp(attack, 40, 99),
    midfield: clamp(midfield, 40, 99),
    defense: clamp(defense, 40, 99),
    goalkeeper: clamp(goalkeeper, 40, 99),
    overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 99)
  };
}

function dynastyRankProfile(name, rankIndex, count, clubs) {
  const rankStrength = Math.round(dynastyRankTop - (rankIndex / Math.max(1, count - 1)) * (dynastyRankTop - dynastyRankBottom));
  const seasonClub = findSeasonClub(name, clubs);
  const club = seasonClub || findCurrentClub(name);
  const rawProfile = club
    ? calcClubProfile(club)
    : rankFallbackProfile(rankStrength, clubs);
  const normalized = clamp(Math.round(rankStrength * dynastyRankWeight + rawProfile.overall * (1 - dynastyRankWeight)), 68, 94);
  const delta = normalized - rawProfile.overall;
  return {
    attack: clamp(rawProfile.attack + Math.round(delta * 0.35), 40, 99),
    midfield: clamp(rawProfile.midfield + Math.round(delta * 0.25), 40, 99),
    defense: clamp(rawProfile.defense + Math.round(delta * 0.25), 40, 99),
    goalkeeper: clamp(rawProfile.goalkeeper + Math.round(delta * 0.15), 40, 99),
    overall: normalized
  };
}

function profileFromStrength(strength) {
  return { attack: strength - 1, midfield: strength, defense: strength - 1, goalkeeper: strength - 1, overall: strength };
}

function buildTeams(season, league, iteration) {
  const standings = data.standings[season]?.[league] || [];
  const clubs = seasonClubs[season].filter((club) => club.league === league);
  const replacementRng = core.makeRng(core.hashSeed(`${baseSeed}|replace|${season}|${league}|${iteration}`));
  const promoted = (promotedTeams[league] || []).filter((name) => standings.includes(name));
  const replaceName = promoted.length
    ? promoted[Math.floor(replacementRng() * promoted.length)]
    : standings[Math.floor(replacementRng() * standings.length)];
  const names = standings.map((name) => name === replaceName ? "我的球队" : name);
  const profiles = {};
  names.filter((name) => name !== "我的球队").forEach((name) => {
    profiles[name] = dynastyRankProfile(name, standings.indexOf(name), standings.length, clubs);
  });
  profiles["我的球队"] = null;
  return { names, profiles };
}

function buildClassicTeams(league, iteration) {
  const season = "2025-26";
  const clubs = seasonClubs[season].filter((club) => club.league === league);
  const replacementRng = core.makeRng(core.hashSeed(`${baseSeed}|classic-replace|${league}|${iteration}`));
  const realNames = clubs.map((club) => club.name);
  const promoted = (promotedTeams[league] || []).filter((name) => realNames.includes(name));
  const replaceName = promoted.length
    ? promoted[Math.floor(replacementRng() * promoted.length)]
    : realNames[Math.floor(replacementRng() * realNames.length)];
  const names = realNames.map((name) => name === replaceName ? "我的球队" : name);
  const eliteKey = (club) => Object.keys(eliteStrength)
    .find((id) => id === club.id || (historicalIds[id] || []).includes(club.id));
  const rows = clubs.filter((club) => club.name !== replaceName)
    .map((club) => ({ club, profile: calcClubProfile(club), elite: eliteKey(club) }))
    .sort((left, right) => (right.elite ? eliteStrength[right.elite] : 0)
      - (left.elite ? eliteStrength[left.elite] : 0)
      || right.profile.overall - left.profile.overall);
  rows.forEach((row, index) => {
    const fallback = rows.length > 1 ? Math.round(82 - (index / (rows.length - 1)) * 12) : 78;
    let normalized = row.elite
      ? clamp(Math.round(eliteStrength[row.elite] * 0.65 + row.profile.overall * 0.35), 70, 94)
      : fallback;
    if (league === "fra" && row.club.id !== "paris-sg") normalized = clamp(normalized - 2, 68, 94);
    const delta = normalized - row.profile.overall;
    row.profile = {
      ...row.profile,
      attack: clamp(row.profile.attack + Math.round(delta * 0.35), 40, 99),
      midfield: clamp(row.profile.midfield + Math.round(delta * 0.25), 40, 99),
      defense: clamp(row.profile.defense + Math.round(delta * 0.25), 40, 99),
      goalkeeper: clamp(row.profile.goalkeeper + Math.round(delta * 0.15), 40, 99),
      overall: normalized
    };
  });
  return {
    names,
    profiles: Object.fromEntries([
      ...rows.map((row) => [row.club.name, row.profile]),
      ["我的球队", null]
    ])
  };
}

function simulateLeague(season, league, userStrength, iteration, mode = "dynasty") {
  const { names, profiles } = mode === "classic"
    ? buildClassicTeams(league, iteration)
    : buildTeams(season, league, iteration);
  profiles["我的球队"] = profileFromStrength(userStrength);
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|match|${season}|${league}|${userStrength}|${iteration}`));
  const schedule = core.createLeagueSchedule(names, "我的球队");
  const table = core.createLeagueTable(names, "我的球队");
  const elo = core.createEloMap(profiles);
  const userMatches = [];
  const outcomes = { homeWins: 0, draws: 0, awayWins: 0, goals: 0, matches: 0 };
  schedule.forEach((match) => {
    const result = core.simulateLeagueResult(
      profiles[match.home],
      profiles[match.away],
      rng,
      match.home,
      elo[match.home],
      elo[match.away]
    );
    elo[match.home] = result.newEloHome;
    elo[match.away] = result.newEloAway;
    core.applyLeagueResult(table, match.home, match.away, result.gf, result.ga);
    outcomes[result.result === "H" ? "homeWins" : result.result === "D" ? "draws" : "awayWins"] += 1;
    outcomes.goals += result.gf + result.ga;
    outcomes.matches += 1;
    if (match.home === "我的球队" || match.away === "我的球队") {
      const opponent = match.home === "我的球队" ? match.away : match.home;
      userMatches.push({ opponentStrength: core.teamStrength(profiles[opponent]) });
    }
  });
  const rows = core.sortLeagueRows(table);
  const user = rows.find((row) => row.name === "我的球队");
  return {
    season,
    league,
    userStrength,
    position: rows.indexOf(user) + 1,
    points: user.points,
    wins: user.wins,
    draws: user.draws,
    losses: user.losses,
    averageOpponentStrength: userMatches.reduce((sum, match) => sum + match.opponentStrength, 0) / userMatches.length,
    outcomes
  };
}

function aggregate(rows) {
  const total = rows.length;
  const totalMatches = rows.reduce((sum, row) => sum + row.outcomes.matches, 0);
  const totalUserMatches = rows.reduce((sum, row) => sum + row.wins + row.draws + row.losses, 0);
  const average = (key) => Number((rows.reduce((sum, row) => sum + row[key], 0) / total).toFixed(1));
  return {
    season: rows[0].season,
    league: rows[0].league,
    userStrength: rows[0].userStrength,
    averageOpponentStrength: average("averageOpponentStrength"),
    averagePoints: average("points"),
    averagePosition: average("position"),
    top4Pct: Number((rows.filter((row) => row.position <= 4).length * 100 / total).toFixed(1)),
    top6Pct: Number((rows.filter((row) => row.position <= 6).length * 100 / total).toFixed(1)),
    winPct: Number((rows.reduce((sum, row) => sum + row.wins, 0) * 100 / totalUserMatches).toFixed(1)),
    drawPct: Number((rows.reduce((sum, row) => sum + row.draws, 0) * 100 / totalUserMatches).toFixed(1)),
    goalsPerMatch: Number((rows.reduce((sum, row) => sum + row.outcomes.goals, 0) / totalMatches).toFixed(2))
  };
}

const report = [];
for (const season of seasons) {
  for (const league of leagues) {
    for (const userStrength of strengths) {
      const rows = Array.from({ length: runs }, (_, iteration) => (
        simulateLeague(season, league, userStrength, iteration)
      ));
      report.push(aggregate(rows));
    }
  }
}

const classicReport = [];
for (const league of leagues) {
  for (const userStrength of strengths) {
    const rows = Array.from({ length: runs }, (_, iteration) => (
      simulateLeague("2025-26", league, userStrength, iteration, "classic")
    ));
    classicReport.push(aggregate(rows));
  }
}

const warnings = [];
seasons.forEach((season) => leagues.forEach((league) => {
  const rows = report.filter((row) => row.season === season && row.league === league);
  ["top4Pct", "top6Pct"].forEach((metric) => {
    if (!(rows[0][metric] <= rows[1][metric] && rows[1][metric] <= rows[2][metric] && rows[2][metric] <= rows[3][metric])) {
      warnings.push(`${season} ${league} ${metric} is not monotonic by user strength.`);
    }
  });
}));

if (outputJson) {
  console.log(JSON.stringify({ runs, seed: baseSeed, report, classicReport, warnings }, null, 2));
} else {
  console.log(`Dynasty league balance test | runs=${runs} | seed=${baseSeed}`);
  console.log("\nAll seasons combined");
  console.table(strengths.flatMap((userStrength) => leagues.map((league) => {
    const rows = report.filter((row) => row.userStrength === userStrength && row.league === league);
    return {
      Strength: userStrength,
      League: leagueNames[league],
      "Avg opponent": Number((rows.reduce((sum, row) => sum + row.averageOpponentStrength, 0) / rows.length).toFixed(1)),
      "Avg pts": Number((rows.reduce((sum, row) => sum + row.averagePoints, 0) / rows.length).toFixed(1)),
      "Avg pos": Number((rows.reduce((sum, row) => sum + row.averagePosition, 0) / rows.length).toFixed(2)),
      "Top 4 %": Number((rows.reduce((sum, row) => sum + row.top4Pct, 0) / rows.length).toFixed(1)),
      "Top 6 %": Number((rows.reduce((sum, row) => sum + row.top6Pct, 0) / rows.length).toFixed(1)),
      "Draw %": Number((rows.reduce((sum, row) => sum + row.drawPct, 0) / rows.length).toFixed(1)),
      "Goals/match": Number((rows.reduce((sum, row) => sum + row.goalsPerMatch, 0) / rows.length).toFixed(2))
    };
  })));
  console.log("\nStrength 85 by season");
  console.table(report.filter((row) => row.userStrength === 85).map((row) => ({
    Season: row.season,
    League: leagueNames[row.league],
    "Avg opponent": row.averageOpponentStrength,
    "Avg pts": row.averagePoints,
    "Avg pos": row.averagePosition,
    "Top 4 %": row.top4Pct,
    "Top 6 %": row.top6Pct,
    "Draw %": row.drawPct,
    "Goals/match": row.goalsPerMatch
  })));
  console.log("\nClassic 2025-26 baseline by strength");
  console.table(strengths.flatMap((userStrength) => classicReport
    .filter((row) => row.userStrength === userStrength)
    .map((row) => ({
      Strength: userStrength,
      League: leagueNames[row.league],
      "Avg opponent": row.averageOpponentStrength,
      "Avg pos": row.averagePosition,
      "Top 4 %": row.top4Pct,
      "Top 6 %": row.top6Pct,
      "Draw %": row.drawPct,
      "Goals/match": row.goalsPerMatch
    }))));
  if (warnings.length) {
    console.log("\nBalance warnings");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  } else {
    console.log("\nNo monotonicity warnings.");
  }
}
