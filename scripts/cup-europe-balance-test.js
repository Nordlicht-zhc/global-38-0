const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const core = require("../simulation-core.js");

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));
const runs = Math.max(100, Number(args.runs || 1000));
const baseSeed = String(args.seed || "cup-europe-review");
const outputJson = args.json === "true";
const leagueNames = { eng: "ENG", esp: "ESP", ita: "ITA", ger: "GER", fra: "FRA" };
const promotedTeams = {
  eng: ["Burnley", "Leeds United", "Sunderland"],
  esp: ["Elche CF", "Levante UD", "R. Oviedo"],
  ita: ["Cremonese", "Pisa", "Sassuolo"],
  ger: ["1. FC Köln", "Hamburger SV"],
  fra: ["FC Lorient", "FC Metz", "Paris FC"]
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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

function loadData() {
  const context = {};
  vm.createContext(context);
  [
    "data.js",
    "big-five.js",
    "big-five-italy.js",
    "big-five-germany.js",
    "big-five-france.js",
    "season-players.js",
    "european-clubs.js"
  ].forEach((file) => vm.runInContext(fs.readFileSync(file, "utf8"), context));
  vm.runInContext(`globalThis.__data = {
    clubs: CLUBS,
    season: SEASON_PLAYERS["2025-26"],
    europeanProfiles: EUROPEAN_CLUB_PROFILES,
    europeanEntries: EUROPE_2025_26
  };`, context);
  return context.__data;
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

const profileFromStrength = (strength) => ({
  attack: strength - 1,
  midfield: strength,
  defense: strength - 1,
  goalkeeper: strength - 1,
  overall: strength
});

function createTeam(name, profile, isUser = false) {
  return {
    name,
    profile,
    strength: core.teamStrength(profile),
    isUser,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    awayGoals: 0,
    awayWins: 0,
    disciplinaryPoints: 0,
    clubCoefficient: core.teamStrength(profile)
  };
}

function simulateLeg(home, away, rng, neutral = false) {
  const result = core.simulateLeagueResult(
    home.profile,
    away.profile,
    rng,
    home.name,
    undefined,
    undefined,
    { neutral }
  );
  return { home, away, homeGoals: result.gf, awayGoals: result.ga };
}

function simulateKnockoutTie(teamA, teamB, rng, twoLeg, neutral = false) {
  const tie = { teamA, teamB, twoLeg, neutral, legs: [] };
  const legCount = twoLeg ? 2 : 1;
  for (let legIndex = 0; legIndex < legCount; legIndex += 1) {
    const { home, away } = core.nextKnockoutLegTeams(tie);
    tie.legs.push(simulateLeg(home, away, rng, neutral));
  }
  const aggregate = core.aggregateKnockoutTie(tie);
  if (aggregate.aggregateA !== aggregate.aggregateB) {
    return aggregate.aggregateA > aggregate.aggregateB ? teamA : teamB;
  }
  const lastLeg = tie.legs[tie.legs.length - 1];
  const extraTime = core.simulateKnockoutExtraTime(lastLeg.home, lastLeg.away, rng, { neutral });
  if (extraTime.homeGoals !== extraTime.awayGoals) {
    return extraTime.homeGoals > extraTime.awayGoals ? lastLeg.home : lastLeg.away;
  }
  return core.simulateKnockoutPenalties(lastLeg.home, lastLeg.away, rng, { neutral }).winner;
}

function updateEuropeanStats(team, goalsFor, goalsAgainst, isAway = false) {
  team.played += 1;
  team.goalsFor += goalsFor;
  team.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    team.wins += 1;
    if (isAway) team.awayWins += 1;
    team.points += 3;
  } else if (goalsFor === goalsAgainst) {
    team.draws += 1;
    team.points += 1;
  } else {
    team.losses += 1;
  }
  if (isAway) team.awayGoals += goalsFor;
}

const data = loadData();
const aliases = readObjectConstant("HISTORICAL_CLUB_IDS");
const eliteStrength = readObjectConstant("ELITE_STRENGTH");
const seasonClubs = data.season.clubs;

function findCurrentClub(id) {
  const direct = seasonClubs.find((club) => club.id === id);
  if (direct) return direct;
  for (const alias of aliases[id] || []) {
    const club = seasonClubs.find((item) => item.id === alias);
    if (club) return club;
  }
  const current = data.clubs[id];
  if (!current) return null;
  const matches = seasonClubs.filter((club) => club.league === current.league && club.short === current.short);
  return matches.length === 1 ? matches[0] : null;
}

function buildEuropeanTeam(entry, rng) {
  const club = entry.id ? findCurrentClub(entry.id) : null;
  const profile = club
    ? calcClubProfile(club)
    : data.europeanProfiles[entry.profile || entry.name]
      || profileFromStrength(70 + Math.floor(rng() * 16));
  return createTeam(club?.name || entry.name, profile);
}

function buildNormalizedLeague(league, excludedName) {
  const eliteKey = (club) => Object.keys(eliteStrength)
    .find((id) => id === club.id || (aliases[id] || []).includes(club.id));
  const rows = seasonClubs.filter((club) => club.league === league && club.name !== excludedName)
    .map((club) => ({ club, profile: calcClubProfile(club), elite: eliteKey(club) }))
    .sort((a, b) => (b.elite ? eliteStrength[b.elite] : 0) - (a.elite ? eliteStrength[a.elite] : 0)
      || b.profile.overall - a.profile.overall);
  rows.forEach((row, index) => {
    const fallback = Math.round(82 - (index / (rows.length - 1)) * 12);
    let normalized = row.elite
      ? clamp(Math.round(eliteStrength[row.elite] * 0.65 + row.profile.overall * 0.35), 70, 94)
      : fallback;
    if (league === "fra" && row.club.id !== "paris-sg") normalized = clamp(normalized - 2, 68, 94);
    const delta = normalized - row.profile.overall;
    row.profile.attack = clamp(row.profile.attack + Math.round(delta * 0.35), 40, 99);
    row.profile.midfield = clamp(row.profile.midfield + Math.round(delta * 0.25), 40, 99);
    row.profile.defense = clamp(row.profile.defense + Math.round(delta * 0.25), 40, 99);
    row.profile.goalkeeper = clamp(row.profile.goalkeeper + Math.round(delta * 0.15), 40, 99);
    row.profile.overall = normalized;
  });
  return rows.map((row) => createTeam(row.club.name, row.profile));
}

function simulateDomesticCup(league, userStrength, iteration) {
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|cup|${league}|${userStrength}|${iteration}`));
  const realNames = seasonClubs.filter((club) => club.league === league).map((club) => club.name);
  const promoted = promotedTeams[league].filter((name) => realNames.includes(name));
  const excluded = promoted[Math.floor(rng() * promoted.length)];
  const user = createTeam("__user__", profileFromStrength(userStrength), true);
  let teams = [...buildNormalizedLeague(league, excluded), user];
  for (let index = 0; teams.length < 32; index += 1) {
    teams.push(createTeam(`lower-${index}`, profileFromStrength(Math.max(64, 75 - index))));
  }
  let userTies = 0;
  let userWins = 0;
  while (teams.length > 1) {
    const shuffled = core.shuffleWithRng(teams, rng);
    const next = [];
    for (let index = 0; index < shuffled.length; index += 2) {
      const teamA = shuffled[index];
      const teamB = shuffled[index + 1];
      const neutral = shuffled.length === 2;
      const winner = simulateKnockoutTie(teamA, teamB, rng, false, neutral);
      if (teamA.isUser || teamB.isUser) {
        userTies += 1;
        if (winner.isUser) userWins += 1;
      }
      next.push(winner);
    }
    teams = next;
  }
  return { champion: teams[0].isUser, userTies, userWins };
}

function simulateEurope(competition, userStrength, iteration) {
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|europe|${competition}|${userStrength}|${iteration}`));
  const entries = data.europeanEntries[competition];
  const nonBigFive = entries.filter((entry) => !(
    entry.id
    && data.clubs[entry.id]
    && ["eng", "esp", "ita", "ger", "fra"].includes(data.clubs[entry.id].league)
  ));
  const replaced = core.shuffleWithRng(nonBigFive, rng)[0];
  const teams = entries.filter((entry) => entry !== replaced).map((entry) => buildEuropeanTeam(entry, rng));
  const user = createTeam("__user__", profileFromStrength(userStrength), true);
  teams.push(user);
  const matchdays = competition === "UECL" ? 6 : 8;
  const rounds = core.buildLeaguePhaseSchedule(teams, matchdays, rng);
  const leagueMatches = [];
  let opponentStrength = 0;
  rounds.forEach((round) => round.matches.forEach((match) => {
    const played = simulateLeg(match.home, match.away, rng);
    updateEuropeanStats(match.home, played.homeGoals, played.awayGoals, false);
    updateEuropeanStats(match.away, played.awayGoals, played.homeGoals, true);
    leagueMatches.push(played);
    if (match.home.isUser || match.away.isUser) {
      opponentStrength += (match.home.isUser ? match.away : match.home).strength;
    }
  }));
  const table = core.sortEuropeanLeaguePhase(teams, leagueMatches);
  const position = table.indexOf(user) + 1;
  if (position > 24) return { position, champion: false, opponentStrength: opponentStrength / matchdays, ties: 0, wins: 0 };
  let userTies = 0;
  let userWins = 0;
  let winners = [];
  for (let index = 0; index < 8; index += 1) {
    const teamA = table[8 + index];
    const teamB = table[23 - index];
    const winner = simulateKnockoutTie(teamA, teamB, rng, true);
    if (teamA.isUser || teamB.isUser) {
      userTies += 1;
      if (winner.isUser) userWins += 1;
    }
    winners.push(winner);
  }
  let pairings = table.slice(0, 8).map((team, index) => [team, winners[index]]);
  for (let round = 0; round < 4; round += 1) {
    const next = pairings.map(([teamA, teamB]) => {
      const winner = simulateKnockoutTie(teamA, teamB, rng, round < 3, round === 3);
      if (teamA.isUser || teamB.isUser) {
        userTies += 1;
        if (winner.isUser) userWins += 1;
      }
      return winner;
    });
    if (next.length === 1) {
      return {
        position,
        champion: next[0].isUser,
        opponentStrength: opponentStrength / matchdays,
        ties: userTies,
        wins: userWins
      };
    }
    pairings = [];
    for (let index = 0; index < next.length; index += 2) pairings.push([next[index], next[index + 1]]);
  }
  throw new Error("European simulation did not produce a champion.");
}

function verifyMechanics() {
  const teams = Array.from({ length: 36 }, (_, index) => createTeam(`team-${index}`, profileFromStrength(60 + index)));
  [6, 8].forEach((matchdays) => {
    const rounds = core.buildLeaguePhaseSchedule(
      teams,
      matchdays,
      core.makeRng(core.hashSeed(`${baseSeed}|schedule|${matchdays}`))
    );
    teams.forEach((team) => {
      const matches = rounds.flatMap((round) => round.matches)
        .filter((match) => match.home === team || match.away === team);
      const opponents = matches.map((match) => match.home === team ? match.away : match.home);
      assert.strictEqual(matches.length, matchdays, `${team.name} should play ${matchdays} matches.`);
      assert.strictEqual(new Set(opponents).size, matchdays, `${team.name} should face unique opponents.`);
      assert.strictEqual(matches.filter((match) => match.home === team).length, matchdays / 2,
        `${team.name} should have balanced home matches.`);
    });
  });
  const highSeed = teams[20];
  const lowSeed = teams[10];
  const tie = { teamA: highSeed, teamB: lowSeed, twoLeg: true, legs: [] };
  const first = core.nextKnockoutLegTeams(tie);
  assert.strictEqual(first.home, lowSeed, "The lower seed should host the first leg.");
  tie.legs.push({ home: lowSeed, away: highSeed, homeGoals: 0, awayGoals: 0 });
  const second = core.nextKnockoutLegTeams(tie);
  assert.strictEqual(second.home, highSeed, "The higher seed should host the second leg.");

  const tiedTeam = (name, overrides = {}) => ({
    name,
    points: 10,
    goalsFor: 8,
    goalsAgainst: 6,
    awayGoals: 3,
    wins: 3,
    awayWins: 1,
    disciplinaryPoints: 0,
    clubCoefficient: 75,
    ...overrides
  });
  const expectFirst = (first, secondTeam, matches, message) => {
    const sorted = core.sortEuropeanLeaguePhase([first, secondTeam, ...matches.others], matches.fixtures);
    assert(sorted.indexOf(first) < sorted.indexOf(secondTeam), message);
  };
  expectFirst(tiedTeam("points", { points: 11 }), tiedTeam("other"), { others: [], fixtures: [] }, "Points should rank first.");
  expectFirst(tiedTeam("goal-difference", { goalsAgainst: 5 }), tiedTeam("other"), { others: [], fixtures: [] }, "Goal difference should break a points tie.");
  expectFirst(tiedTeam("goals-scored", { goalsFor: 9, goalsAgainst: 7 }), tiedTeam("other"), { others: [], fixtures: [] }, "Goals scored should follow goal difference.");
  expectFirst(tiedTeam("away-goals", { awayGoals: 4 }), tiedTeam("other"), { others: [], fixtures: [] }, "Away goals should follow goals scored.");
  expectFirst(tiedTeam("wins", { wins: 4 }), tiedTeam("other"), { others: [], fixtures: [] }, "Wins should follow away goals.");
  expectFirst(tiedTeam("away-wins", { awayWins: 2 }), tiedTeam("other"), { others: [], fixtures: [] }, "Away wins should follow wins.");

  const opponentPointsA = tiedTeam("opponent-points-a");
  const opponentPointsB = tiedTeam("opponent-points-b");
  const strongOpponent = tiedTeam("strong-opponent", { points: 9 });
  const weakOpponent = tiedTeam("weak-opponent", { points: 6 });
  expectFirst(opponentPointsA, opponentPointsB, {
    others: [strongOpponent, weakOpponent],
    fixtures: [{ home: opponentPointsA, away: strongOpponent }, { home: opponentPointsB, away: weakOpponent }]
  }, "Opponents' collective points should break the remaining tie.");

  const opponentGdA = tiedTeam("opponent-gd-a");
  const opponentGdB = tiedTeam("opponent-gd-b");
  const positiveOpponent = tiedTeam("positive-opponent", { goalsFor: 9, goalsAgainst: 6 });
  const flatOpponent = tiedTeam("flat-opponent", { goalsFor: 8, goalsAgainst: 6 });
  expectFirst(opponentGdA, opponentGdB, {
    others: [positiveOpponent, flatOpponent],
    fixtures: [{ home: opponentGdA, away: positiveOpponent }, { home: opponentGdB, away: flatOpponent }]
  }, "Opponents' collective goal difference should follow their points.");

  const opponentGoalsA = tiedTeam("opponent-goals-a");
  const opponentGoalsB = tiedTeam("opponent-goals-b");
  const scoringOpponent = tiedTeam("scoring-opponent", { goalsFor: 9, goalsAgainst: 7 });
  const quieterOpponent = tiedTeam("quieter-opponent", { goalsFor: 8, goalsAgainst: 6 });
  expectFirst(opponentGoalsA, opponentGoalsB, {
    others: [scoringOpponent, quieterOpponent],
    fixtures: [{ home: opponentGoalsA, away: scoringOpponent }, { home: opponentGoalsB, away: quieterOpponent }]
  }, "Opponents' collective goals should follow their goal difference.");
  expectFirst(tiedTeam("discipline", { disciplinaryPoints: 1 }), tiedTeam("other", { disciplinaryPoints: 2 }), { others: [], fixtures: [] }, "Lower disciplinary points should rank higher.");
  expectFirst(tiedTeam("coefficient", { clubCoefficient: 80 }), tiedTeam("other", { clubCoefficient: 79 }), { others: [], fixtures: [] }, "Club coefficient should be the final sporting tiebreaker.");
}

verifyMechanics();
const report = { runs, seed: baseSeed, neutralFinal: {}, domesticCup: {}, europe: {}, warnings: [] };
let neutralHomeWins = 0;
const neutralRuns = Math.max(10000, runs * 5);
for (let iteration = 0; iteration < neutralRuns; iteration += 1) {
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|neutral|${iteration}`));
  const teamA = createTeam("A", profileFromStrength(82));
  const teamB = createTeam("B", profileFromStrength(82));
  neutralHomeWins += simulateKnockoutTie(teamA, teamB, rng, false, true) === teamA ? 1 : 0;
}
report.neutralFinal.homeWinPct = Number((neutralHomeWins * 100 / neutralRuns).toFixed(1));
assert(report.neutralFinal.homeWinPct >= 48 && report.neutralFinal.homeWinPct <= 52,
  `Neutral final home win rate is ${report.neutralFinal.homeWinPct}%.`);

Object.keys(leagueNames).forEach((league) => {
  let champions = 0;
  let userTies = 0;
  let userWins = 0;
  for (let iteration = 0; iteration < runs; iteration += 1) {
    const result = simulateDomesticCup(league, 85, iteration);
    champions += result.champion ? 1 : 0;
    userTies += result.userTies;
    userWins += result.userWins;
  }
  report.domesticCup[league] = {
    strength: 85,
    championPct: Number((champions * 100 / runs).toFixed(1)),
    tieWinPct: Number((userWins * 100 / userTies).toFixed(1))
  };
});

["UCL", "UEL", "UECL"].forEach((competition) => {
  report.europe[competition] = {};
  [80, 85, 90].forEach((strength) => {
    let top8 = 0;
    let top24 = 0;
    let champions = 0;
    let opponentStrength = 0;
    let userTies = 0;
    let userWins = 0;
    for (let iteration = 0; iteration < runs; iteration += 1) {
      const result = simulateEurope(competition, strength, iteration);
      top8 += result.position <= 8 ? 1 : 0;
      top24 += result.position <= 24 ? 1 : 0;
      champions += result.champion ? 1 : 0;
      opponentStrength += result.opponentStrength;
      userTies += result.ties;
      userWins += result.wins;
    }
    report.europe[competition][strength] = {
      averageOpponentStrength: Number((opponentStrength / runs).toFixed(1)),
      top8Pct: Number((top8 * 100 / runs).toFixed(1)),
      top24Pct: Number((top24 * 100 / runs).toFixed(1)),
      knockoutTieWinPct: Number((userWins * 100 / userTies).toFixed(1)),
      championPct: Number((champions * 100 / runs).toFixed(1))
    };
  });
  const rows = report.europe[competition];
  if (!(rows[80].top8Pct <= rows[85].top8Pct && rows[85].top8Pct <= rows[90].top8Pct)) {
    report.warnings.push(`${competition}: top-eight rates are not monotonic by strength.`);
  }
  if (!(rows[80].championPct <= rows[85].championPct && rows[85].championPct <= rows[90].championPct)) {
    report.warnings.push(`${competition}: champion rates are not monotonic by strength.`);
  }
});

if (outputJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`Cup and Europe balance test | runs=${runs} | seed=${baseSeed}`);
  console.log(`Neutral final | nominal home wins ${report.neutralFinal.homeWinPct}%`);
  console.log("\nDomestic cups | user strength 85");
  console.table(Object.entries(report.domesticCup).map(([league, row]) => ({
    League: leagueNames[league],
    "Tie win %": row.tieWinPct,
    "Champion %": row.championPct
  })));
  Object.entries(report.europe).forEach(([competition, rows]) => {
    console.log(`\n${competition}`);
    console.table(Object.entries(rows).map(([strength, row]) => ({
      Strength: strength,
      "Avg opponent": row.averageOpponentStrength,
      "Top 8 %": row.top8Pct,
      "Top 24 %": row.top24Pct,
      "KO tie win %": row.knockoutTieWinPct,
      "Champion %": row.championPct
    })));
  });
  if (report.warnings.length) {
    console.log("\nBalance warnings");
    report.warnings.forEach((warning) => console.log(`- ${warning}`));
  }
}
