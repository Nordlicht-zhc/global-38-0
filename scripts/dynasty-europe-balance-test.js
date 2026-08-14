const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../simulation-core.js");

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));
const runs = Math.max(100, Number(args.runs || 300));
const baseSeed = String(args.seed || "dynasty-europe-review");
const outputJson = args.json === "true";
const seasons = ["1994-95", "2003-04", "2015-16", "2023-24"];
const competitions = ["UCL", "UEL", "UECL"];
const strengths = [80, 85, 90];
const bigFive = new Set(["eng", "esp", "ita", "ger", "fra"]);
const nonBigFiveTargets = { UCL: 12, UEL: 18, UECL: 24 };
const seededNonBigFiveAssociations = { UCL: 10, UEL: 15, UECL: 20 };
const dynastyEuropeanLevelAdjustments = { UCL: -3, UEL: -8, UECL: -12 };
const root = path.resolve(__dirname, "..");

function loadData() {
  const context = {};
  vm.createContext(context);
  [
    "data.js",
    "big-five.js",
    "big-five-italy.js",
    "big-five-germany.js",
    "big-five-france.js",
    "european-clubs.js",
    "season-standings.js"
  ].forEach((file) => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context));
  vm.runInContext(
    "globalThis.__data = { clubs: CLUBS, entries: EUROPE_2025_26, profiles: EUROPEAN_CLUB_PROFILES, associations: EUROPEAN_CLUB_ASSOCIATIONS, coefficients: EUROPEAN_ASSOCIATION_COEFFICIENTS, standings: HISTORICAL_STANDINGS };",
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

const data = loadData();
const seasonClubs = Object.fromEntries(seasons.map((season) => [season, loadSeasonClubs(season)]));

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function calcClubProfile(club) {
  const units = { ATT: [], MID: [], DEF: [], GK: [] };
  (club.players || []).forEach((player) => {
    const position = Array.isArray(player.pos) ? player.pos[0] : player.pos;
    const unit = position === "GK"
      ? "GK"
      : ["RB", "CB", "LB", "RWB", "LWB"].includes(position)
        ? "DEF"
        : ["CDM", "CM", "CAM", "RM", "LM"].includes(position)
          ? "MID"
          : "ATT";
    units[unit].push(Number(player.rate || 0));
  });
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

const dynastyAliases = {
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
  return dynastyAliases[normalized] || normalized;
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

function rankProfile(name, rankIndex, count, clubs) {
  const rankStrength = Math.round(90 - (rankIndex / Math.max(1, count - 1)) * 18);
  const club = findSeasonClub(name, clubs);
  const rawProfile = club
    ? calcClubProfile(club)
    : { attack: rankStrength, midfield: rankStrength, defense: rankStrength, goalkeeper: rankStrength, overall: rankStrength };
  const normalized = clamp(Math.round(rankStrength * 0.8 + rawProfile.overall * 0.2), 68, 94);
  const delta = normalized - rawProfile.overall;
  return {
    attack: clamp(rawProfile.attack + Math.round(delta * 0.35), 40, 99),
    midfield: clamp(rawProfile.midfield + Math.round(delta * 0.25), 40, 99),
    defense: clamp(rawProfile.defense + Math.round(delta * 0.25), 40, 99),
    goalkeeper: clamp(rawProfile.goalkeeper + Math.round(delta * 0.15), 40, 99),
    overall: normalized
  };
}

function associationForEntry(entry) {
  if (entry.id && data.clubs[entry.id]?.league) return data.clubs[entry.id].league;
  return data.associations[entry.profile || entry.name] || "other";
}

function associationCoefficient(association) {
  return Number(data.coefficients[association] || data.coefficients.other || 8);
}

function clubCoefficient(association, profile) {
  return clamp(Math.round(associationCoefficient(association) * 0.72 + Number(profile.overall || 75) * 0.28), 1, 100);
}

function buildBigFiveSlotPlan(pools, competition) {
  const associations = Object.keys(pools).filter((association) => bigFive.has(association));
  const coefficients = Object.fromEntries(associations.map((association) => [
    association,
    associationCoefficient(association)
  ]));
  const offsets = Object.fromEntries(associations.map((association) => [association, 0]));
  let selectedSlots = null;
  competitions.forEach((currentCompetition) => {
    const availablePools = Object.fromEntries(associations.map((association) => [
      association,
      pools[association].slice(offsets[association])
    ]));
    const slots = core.allocateWeightedAssociationSlots(
      availablePools,
      coefficients,
      35 - nonBigFiveTargets[currentCompetition],
      associations.length
    );
    if (currentCompetition === competition) {
      selectedSlots = { slots, offsets: { ...offsets } };
    }
    associations.forEach((association) => {
      offsets[association] += Number(slots[association] || 0);
    });
  });
  return selectedSlots || { slots: {}, offsets };
}

function calibrateDynastyEuropeanProfile(profile, competition, association) {
  if (!bigFive.has(association)) return profile;
  const adjustment = Number(dynastyEuropeanLevelAdjustments[competition] || 0);
  if (!adjustment) return profile;
  const adjust = (value) => clamp(Math.round(Number(value || 75) + adjustment), 40, 99);
  return {
    attack: adjust(profile.attack),
    midfield: adjust(profile.midfield),
    defense: adjust(profile.defense),
    goalkeeper: adjust(profile.goalkeeper),
    overall: adjust(profile.overall)
  };
}

function buildCandidatePool(season, competition, rng) {
  const candidates = [];
  ["eng", "esp", "ita", "ger", "fra"].forEach((association) => {
    const standings = data.standings[season][association] || [];
    const clubs = seasonClubs[season].filter((club) => club.league === association);
    standings.forEach((name, rankIndex) => {
      const profile = rankProfile(name, rankIndex, standings.length, clubs);
      candidates.push({
        name,
        profile,
        association,
        rankIndex,
        clubCoefficient: clubCoefficient(association, profile)
      });
    });
  });
  (data.entries[competition] || []).forEach((entry) => {
    const association = associationForEntry(entry);
    if (bigFive.has(association)) return;
    const profileName = entry.profile || entry.name;
    const fallback = {
      attack: 70 + Math.floor(rng() * 16),
      midfield: 70 + Math.floor(rng() * 16),
      defense: 70 + Math.floor(rng() * 16),
      goalkeeper: 70 + Math.floor(rng() * 16),
      overall: 70 + Math.floor(rng() * 16)
    };
    const profile = data.profiles?.[profileName] || fallback;
    candidates.push({
      name: entry.name,
      profile,
      association,
      rankIndex: Number.MAX_SAFE_INTEGER,
      clubCoefficient: clubCoefficient(association, profile)
    });
  });
  const pools = {};
  candidates.forEach((candidate) => {
    pools[candidate.association] ||= [];
    if (!pools[candidate.association].some((item) => item.name === candidate.name)) {
      pools[candidate.association].push(candidate);
    }
  });
  const selected = [];
  const bigFivePlan = buildBigFiveSlotPlan(pools, competition);
  const selectGroup = (associations, totalSlots, seededCount, rankOffsets = {}) => {
    const groupPools = Object.fromEntries(associations.map((association) => [
      association,
      pools[association].slice(Number(rankOffsets[association] || 0))
    ]));
    const coefficients = Object.fromEntries(associations.map((association) => [association, associationCoefficient(association)]));
    const slots = core.allocateWeightedAssociationSlots(groupPools, coefficients, totalSlots, seededCount);
    Object.entries(slots).forEach(([association, count]) => {
      groupPools[association]
        .sort((left, right) => right.clubCoefficient - left.clubCoefficient
          || left.rankIndex - right.rankIndex
          || left.name.localeCompare(right.name))
        .slice(0, count)
        .forEach((candidate) => selected.push(candidate));
    });
  };
  const bigFiveAssociations = Object.keys(pools).filter((association) => bigFive.has(association));
  const nonBigFiveAssociations = Object.keys(pools).filter((association) => !bigFive.has(association));
  selectGroup(
    bigFiveAssociations,
    35 - nonBigFiveTargets[competition],
    bigFiveAssociations.length,
    bigFivePlan.offsets
  );
  selectGroup(nonBigFiveAssociations, nonBigFiveTargets[competition],
    Math.min(nonBigFiveAssociations.length, seededNonBigFiveAssociations[competition]));
  assert.strictEqual(selected.length, 35, `${season} ${competition} should select 35 candidates.`);
  assert.strictEqual(new Set(selected.map((candidate) => candidate.name)).size, 35,
    `${season} ${competition} has duplicate candidates.`);
  const calibrated = selected.map((candidate) => {
    const profile = calibrateDynastyEuropeanProfile(candidate.profile, competition, candidate.association);
    return {
      ...candidate,
      profile,
      clubCoefficient: clubCoefficient(candidate.association, profile)
    };
  });
  return core.shuffleWithRng(calibrated, rng);
}

function profileFromStrength(strength) {
  return { attack: strength - 1, midfield: strength, defense: strength - 1, goalkeeper: strength - 1, overall: strength };
}

function createTeam(name, profile, isUser = false, coefficient = core.teamStrength(profile), association = "") {
  return {
    name,
    profile,
    strength: core.teamStrength(profile),
    isUser,
    association,
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
    clubCoefficient: coefficient
  };
}

function updateStats(team, goalsFor, goalsAgainst, away = false) {
  team.played += 1;
  team.goalsFor += goalsFor;
  team.goalsAgainst += goalsAgainst;
  if (goalsFor > goalsAgainst) {
    team.wins += 1;
    team.points += 3;
    if (away) team.awayWins += 1;
  } else if (goalsFor === goalsAgainst) {
    team.draws += 1;
    team.points += 1;
  } else {
    team.losses += 1;
  }
  if (away) team.awayGoals += goalsFor;
}

function playMatch(home, away, rng, neutral = false) {
  const result = core.simulateLeagueResult(home.profile, away.profile, rng, home.name, undefined, undefined, { neutral });
  return { home, away, homeGoals: result.gf, awayGoals: result.ga };
}

function playTie(teamA, teamB, rng, twoLeg, neutral = false) {
  const tie = { teamA, teamB, twoLeg, neutral, legs: [] };
  const legCount = twoLeg ? 2 : 1;
  for (let index = 0; index < legCount; index += 1) {
    const { home, away } = core.nextKnockoutLegTeams(tie);
    tie.legs.push(playMatch(home, away, rng, neutral));
  }
  const aggregate = core.aggregateKnockoutTie(tie);
  tie.aggregateA = aggregate.aggregateA;
  tie.aggregateB = aggregate.aggregateB;
  if (aggregate.aggregateA !== aggregate.aggregateB) {
    tie.winner = aggregate.aggregateA > aggregate.aggregateB ? teamA : teamB;
    return tie;
  }
  const last = tie.legs[tie.legs.length - 1];
  const extra = core.simulateKnockoutExtraTime(last.home, last.away, rng, { neutral });
  if (extra.homeGoals !== extra.awayGoals) {
    tie.winner = extra.homeGoals > extra.awayGoals ? last.home : last.away;
    return tie;
  }
  tie.winner = core.simulateKnockoutPenalties(last.home, last.away, rng, { neutral }).winner;
  return tie;
}

function runTournament(season, competition, userStrength, iteration) {
  const rng = core.makeRng(core.hashSeed(`${baseSeed}|${season}|${competition}|${userStrength}|${iteration}`));
  const candidates = buildCandidatePool(season, competition, rng);
  const teams = candidates.map((candidate) => createTeam(
    candidate.name,
    candidate.profile,
    false,
    candidate.clubCoefficient,
    candidate.association
  ));
  const user = createTeam("我的球队", profileFromStrength(userStrength), true, userStrength, "user");
  teams.push(user);
  const matchdays = competition === "UECL" ? 6 : 8;
  const rounds = core.buildLeaguePhaseSchedule(teams, matchdays, rng);
  const logs = [];
  let userOpponentStrength = 0;
  let leagueDraws = 0;
  let leagueGoals = 0;
  rounds.forEach((round) => round.matches.forEach((match) => {
    const played = playMatch(match.home, match.away, rng);
    updateStats(match.home, played.homeGoals, played.awayGoals, false);
    updateStats(match.away, played.awayGoals, played.homeGoals, true);
    logs.push(played);
    leagueGoals += played.homeGoals + played.awayGoals;
    leagueDraws += played.homeGoals === played.awayGoals ? 1 : 0;
    if (match.home.isUser || match.away.isUser) {
      userOpponentStrength += (match.home.isUser ? match.away : match.home).strength;
    }
  }));
  const table = core.sortEuropeanLeaguePhase(teams, logs);
  const position = table.indexOf(user) + 1;
  const report = {
    season,
    competition,
    userStrength,
    position,
    top8: position <= 8,
    top24: position <= 24,
    playoff: false,
    r16: position <= 8,
    qf: false,
    sf: false,
    final: false,
    champion: false,
    knockoutTies: 0,
    knockoutWins: 0,
    opponentStrength: userOpponentStrength / matchdays,
    leagueDraws,
    leagueGoals,
    leagueMatches: rounds.flatMap((round) => round.matches).length
  };
  const recordTie = (tie, stage) => {
    if (!tie.teamA.isUser && !tie.teamB.isUser) return;
    report.knockoutTies += 1;
    if (tie.winner.isUser) {
      report.knockoutWins += 1;
      if (stage === "playoff") report.playoff = true;
      if (stage === "playoff") report.r16 = true;
      if (stage === "r16") report.qf = true;
      if (stage === "qf") report.sf = true;
      if (stage === "sf") report.final = true;
      if (stage === "final") report.champion = true;
    }
  };
  if (position > 24) return report;
  const playoffWinners = [];
  for (let index = 0; index < 8; index += 1) {
    const tie = playTie(table[8 + index], table[23 - index], rng, true);
    recordTie(tie, "playoff");
    playoffWinners.push(tie.winner);
  }
  const r16Winners = [];
  for (let index = 0; index < 8; index += 1) {
    const tie = playTie(table[index], playoffWinners[index], rng, true);
    recordTie(tie, "r16");
    r16Winners.push(tie.winner);
  }
  const qfWinners = [];
  for (let index = 0; index < 8; index += 2) {
    const tie = playTie(r16Winners[index], r16Winners[index + 1], rng, true);
    recordTie(tie, "qf");
    qfWinners.push(tie.winner);
  }
  const sfWinners = [];
  for (let index = 0; index < 4; index += 2) {
    const tie = playTie(qfWinners[index], qfWinners[index + 1], rng, true);
    recordTie(tie, "sf");
    sfWinners.push(tie.winner);
  }
  const finalTie = playTie(sfWinners[0], sfWinners[1], rng, false, true);
  recordTie(finalTie, "final");
  return report;
}

function aggregate(rows) {
  const total = rows.length;
  const percentage = (key) => Number((rows.filter((row) => row[key]).length * 100 / total).toFixed(1));
  return {
    season: rows[0].season,
    competition: rows[0].competition,
    userStrength: rows[0].userStrength,
    averageOpponentStrength: Number((rows.reduce((sum, row) => sum + row.opponentStrength, 0) / total).toFixed(1)),
    top8Pct: percentage("top8"),
    top24Pct: percentage("top24"),
    playoffPct: percentage("playoff"),
    r16Pct: percentage("r16"),
    qfPct: percentage("qf"),
    sfPct: percentage("sf"),
    finalPct: percentage("final"),
    championPct: percentage("champion"),
    knockoutTieWinPct: Number((rows.reduce((sum, row) => sum + row.knockoutWins, 0) * 100
      / Math.max(1, rows.reduce((sum, row) => sum + row.knockoutTies, 0))).toFixed(1)),
    leagueDrawPct: Number((rows.reduce((sum, row) => sum + row.leagueDraws, 0) * 100
      / rows.reduce((sum, row) => sum + row.leagueMatches, 0)).toFixed(1)),
    averageLeagueGoals: Number((rows.reduce((sum, row) => sum + row.leagueGoals, 0)
      / rows.reduce((sum, row) => sum + row.leagueMatches, 0)).toFixed(2))
  };
}

const report = [];
for (const season of seasons) {
  for (const competition of competitions) {
    for (const strength of strengths) {
      const rows = Array.from({ length: runs }, (_, iteration) => runTournament(season, competition, strength, iteration));
      report.push(aggregate(rows));
    }
  }
}

const warnings = [];
seasons.forEach((season) => competitions.forEach((competition) => {
  const rows = report.filter((row) => row.season === season && row.competition === competition);
  ["top8Pct", "top24Pct", "championPct"].forEach((metric) => {
    if (!(rows[0][metric] <= rows[1][metric] && rows[1][metric] <= rows[2][metric])) {
      warnings.push(`${season} ${competition}: ${metric} is not monotonic by strength.`);
    }
  });
}));

if (outputJson) {
  console.log(JSON.stringify({ runs, seed: baseSeed, report, warnings }, null, 2));
} else {
  console.log(`Dynasty Europe balance test | runs=${runs} | seed=${baseSeed}`);
  console.log("\nAll seasons combined");
  console.table(strengths.flatMap((strength) => competitions.map((competition) => {
    const rows = report.filter((row) => row.userStrength === strength && row.competition === competition);
    return {
      Strength: strength,
      Competition: competition,
      "Avg opponent": Number((rows.reduce((sum, row) => sum + row.averageOpponentStrength, 0) / rows.length).toFixed(1)),
      "Top 8 %": Number((rows.reduce((sum, row) => sum + row.top8Pct, 0) / rows.length).toFixed(1)),
      "Top 24 %": Number((rows.reduce((sum, row) => sum + row.top24Pct, 0) / rows.length).toFixed(1)),
      "KO tie win %": Number((rows.reduce((sum, row) => sum + row.knockoutTieWinPct, 0) / rows.length).toFixed(1)),
      "Champion %": Number((rows.reduce((sum, row) => sum + row.championPct, 0) / rows.length).toFixed(1)),
      "Draw %": Number((rows.reduce((sum, row) => sum + row.leagueDrawPct, 0) / rows.length).toFixed(1)),
      "Goals/match": Number((rows.reduce((sum, row) => sum + row.averageLeagueGoals, 0) / rows.length).toFixed(2))
    };
  })));
  console.log("\nStrength 85 by season");
  console.table(report.filter((row) => row.userStrength === 85).map((row) => ({
    Season: row.season,
    Competition: row.competition,
    "Avg opponent": row.averageOpponentStrength,
    "Top 8 %": row.top8Pct,
    "Top 24 %": row.top24Pct,
    "R16 %": row.r16Pct,
    "QF %": row.qfPct,
    "SF %": row.sfPct,
    "Final %": row.finalPct,
    "Champion %": row.championPct,
    "KO tie win %": row.knockoutTieWinPct,
    "Draw %": row.leagueDrawPct,
    "Goals/match": row.averageLeagueGoals
  })));
  if (warnings.length) {
    console.log("\nBalance warnings");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  } else {
    console.log("\nNo monotonicity warnings.");
  }
}
