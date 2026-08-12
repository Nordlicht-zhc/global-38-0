(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.G38SimulationCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const HOME_ELO_ADVANTAGE = 45;

  function hashSeed(value) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < String(value).length; index += 1) {
      hash ^= String(value).charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function nextRandomState(state) {
    return (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0;
  }

  function makeRng(seed) {
    let state = seed >>> 0;
    return () => {
      state = nextRandomState(state);
      return state / 4294967296;
    };
  }

  function shuffleWithRng(items, rng) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(rng() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function teamStrength(profile) {
    const phases = [
      profile.attack || 78,
      profile.midfield || 78,
      profile.defense || 78,
      profile.goalkeeper || profile.defense || 78
    ];
    const mean = phases.reduce((sum, value) => sum + value, 0) / phases.length;
    const min = Math.min(...phases);
    const blended = mean * 0.82 + min * 0.18;
    const overall = profile.overall || mean;
    return clamp(overall * 0.75 + blended * 0.25, 40, 99);
  }

  function createLeagueSchedule(names, userName = "我的球队") {
    const order = names.slice();
    const size = order.length;
    const firstRounds = [];
    const secondRounds = [];
    for (let round = 0; round < size - 1; round += 1) {
      const first = [];
      const second = [];
      for (let index = 0; index < size / 2; index += 1) {
        const home = order[index];
        const away = order[size - 1 - index];
        if (!home || !away || home === away) continue;
        first.push({ home, away });
        second.push({ home: away, away: home });
      }
      firstRounds.push(first);
      secondRounds.push(second);
      const last = order.pop();
      order.splice(1, 0, last);
    }
    const applyFlips = (rounds, baseRound) => {
      rounds.forEach((round, roundIndex) => {
        const originalUserHome = round.some((match) => match.home === userName);
        const desiredHome = (baseRound + roundIndex) % 2 === 0;
        if (originalUserHome !== desiredHome) {
          round.forEach((match) => {
            [match.home, match.away] = [match.away, match.home];
          });
        }
      });
    };
    applyFlips(firstRounds, 0);
    applyFlips(secondRounds, size - 1);
    return [...firstRounds.flat(), ...secondRounds.flat()];
  }

  function createLeagueTable(names, userName = "我的球队") {
    return Object.fromEntries(names.map((name) => [name, {
      name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      isUser: name === userName
    }]));
  }

  const eloExpected = (ratingA, ratingB) => 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));

  function createEloMap(profileMap) {
    return Object.fromEntries(Object.entries(profileMap).map(([name, profile]) => [
      name,
      1000 + Math.round((teamStrength(profile) - 75) * 25)
    ]));
  }

  function advanceAiFixtures(schedule, startIndex, simulateFixture, options = {}) {
    const userName = options.userName || "我的球队";
    const endIndex = Math.min(schedule.length, Number.isFinite(options.endIndex)
      ? options.endIndex
      : schedule.length);
    let index = startIndex;
    while (index < endIndex) {
      const fixture = schedule[index];
      if (fixture.home === userName || fixture.away === userName) break;
      simulateFixture(fixture);
      index += 1;
    }
    return index;
  }

  function poisson(lambda, rng) {
    if (lambda <= 0) return 0;
    const limit = Math.exp(-lambda);
    let product = 1;
    let count = 0;
    do {
      count += 1;
      product *= rng();
    } while (product > limit);
    return count - 1;
  }

  function simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway, options = {}) {
    const hasElo = Number.isFinite(eloHome) && Number.isFinite(eloAway);
    const neutral = Boolean(options.neutral);
    const homeStrength = teamStrength(homeProfile);
    const awayStrength = teamStrength(awayProfile);
    const baseDiff = homeStrength - awayStrength + (neutral ? 0 : 1);
    const strengthExpected = clamp(1 / (1 + Math.pow(10, -baseDiff / 8)), 0.06, 0.88);
    const expectedHome = hasElo
      ? clamp(eloExpected(eloHome + (neutral ? 0 : HOME_ELO_ADVANTAGE), eloAway) * 0.7
        + strengthExpected * 0.3, 0.06, 0.94)
      : strengthExpected;
    const diff = hasElo ? eloHome - eloAway : baseDiff;
    const drawChance = clamp(0.3 - Math.abs(diff) * 0.00035, 0.19, 0.3);
    const isDraw = rng() < drawChance;
    const result = isDraw ? "D" : rng() < expectedHome ? "H" : "A";
    const expectedFor = neutral
      ? clamp(0.825 + (homeProfile.attack - awayProfile.defense) * 0.0525
        + (homeProfile.midfield - awayProfile.midfield) * 0.02
        - (awayProfile.goalkeeper - 80) * 0.018, 0.35, 2.7)
      : clamp(0.85 + (homeProfile.attack - awayProfile.defense) * 0.055
        + (homeProfile.midfield - awayProfile.midfield) * 0.02, 0.4, 2.8);
    const expectedAgainst = neutral
      ? clamp(0.825 + (awayProfile.attack - homeProfile.defense) * 0.0525
        + (awayProfile.midfield - homeProfile.midfield) * 0.02
        - (homeProfile.goalkeeper - 80) * 0.018, 0.35, 2.7)
      : clamp(0.8 + (awayProfile.attack - homeProfile.defense) * 0.05
        + (awayProfile.midfield - homeProfile.midfield) * 0.02
        - (homeProfile.goalkeeper - 80) * 0.018, 0.35, 2.6);
    let gf = clamp(poisson(expectedFor, rng), 0, 7);
    let ga = clamp(poisson(expectedAgainst, rng), 0, 7);
    if (result === "D") {
      const average = Math.round((gf + ga) / 2);
      gf = average;
      ga = average;
    } else if (result === "H" && gf <= ga) gf = ga + 1;
    else if (result === "A" && ga <= gf) ga = gf + 1;
    let newEloHome = eloHome;
    let newEloAway = eloAway;
    if (hasElo) {
      const actualHome = result === "H" ? 1 : result === "D" ? 0.5 : 0;
      const k = 18;
      newEloHome = eloHome + k * (actualHome - expectedHome);
      newEloAway = eloAway + k * ((1 - actualHome) - (1 - expectedHome));
    }
    return { homeName, gf, ga, result, newEloHome, newEloAway };
  }

  function buildLeaguePhaseSchedule(teams, matchdays, rng) {
    const pairings = [];
    const order = shuffleWithRng(teams, rng);
    for (let round = 0; round < matchdays; round += 1) {
      const matches = [];
      for (let index = 0; index < order.length / 2; index += 1) {
        matches.push({
          teamA: order[index],
          teamB: order[order.length - 1 - index],
          edgeId: pairings.length * (order.length / 2) + index
        });
      }
      pairings.push({ round: round + 1, matches });
      const last = order.pop();
      order.splice(1, 0, last);
    }
    const edges = pairings.flatMap((round) => round.matches);
    const adjacency = new Map(teams.map((team) => [team, []]));
    edges.forEach((edge) => {
      adjacency.get(edge.teamA).push(edge);
      adjacency.get(edge.teamB).push(edge);
    });
    const unused = new Set(edges.map((edge) => edge.edgeId));
    const orientation = new Map();
    teams.forEach((start) => {
      while (adjacency.get(start).some((edge) => unused.has(edge.edgeId))) {
        let current = start;
        do {
          const edge = adjacency.get(current).find((candidate) => unused.has(candidate.edgeId));
          if (!edge) break;
          unused.delete(edge.edgeId);
          const next = edge.teamA === current ? edge.teamB : edge.teamA;
          orientation.set(edge.edgeId, { home: current, away: next });
          current = next;
        } while (current !== start);
      }
    });
    return pairings.map((round) => ({
      round: round.round,
      matches: round.matches.map((match) => orientation.get(match.edgeId))
    }));
  }

  function europeanOpponentTotals(teams, matches) {
    const teamByName = new Map(teams.map((team) => [team.name, team]));
    const totals = new Map(teams.map((team) => [team.name, { points: 0, goalDiff: 0, goalsFor: 0 }]));
    const teamName = (value) => typeof value === "string" ? value : value?.name;
    (matches || []).forEach((match) => {
      const homeName = teamName(match.home);
      const awayName = teamName(match.away);
      const home = teamByName.get(homeName);
      const away = teamByName.get(awayName);
      if (!home || !away) return;
      const homeTotals = totals.get(homeName);
      const awayTotals = totals.get(awayName);
      homeTotals.points += Number(away.points || 0);
      homeTotals.goalDiff += Number(away.goalsFor || 0) - Number(away.goalsAgainst || 0);
      homeTotals.goalsFor += Number(away.goalsFor || 0);
      awayTotals.points += Number(home.points || 0);
      awayTotals.goalDiff += Number(home.goalsFor || 0) - Number(home.goalsAgainst || 0);
      awayTotals.goalsFor += Number(home.goalsFor || 0);
    });
    return totals;
  }

  function sortEuropeanLeaguePhase(teams, matches = []) {
    const opponentTotals = europeanOpponentTotals(teams, matches);
    const value = (team, key) => Number(team?.[key] || 0);
    return [...teams].sort((a, b) => {
      const aOpponents = opponentTotals.get(a.name) || {};
      const bOpponents = opponentTotals.get(b.name) || {};
      return value(b, "points") - value(a, "points")
        || (value(b, "goalsFor") - value(b, "goalsAgainst"))
          - (value(a, "goalsFor") - value(a, "goalsAgainst"))
        || value(b, "goalsFor") - value(a, "goalsFor")
        || value(b, "awayGoals") - value(a, "awayGoals")
        || value(b, "wins") - value(a, "wins")
        || value(b, "awayWins") - value(a, "awayWins")
        || Number(bOpponents.points || 0) - Number(aOpponents.points || 0)
        || Number(bOpponents.goalDiff || 0) - Number(aOpponents.goalDiff || 0)
        || Number(bOpponents.goalsFor || 0) - Number(aOpponents.goalsFor || 0)
        || value(a, "disciplinaryPoints") - value(b, "disciplinaryPoints")
        || value(b, "clubCoefficient") - value(a, "clubCoefficient")
        || String(a.name || "").localeCompare(String(b.name || ""));
    });
  }

  function nextKnockoutLegTeams(tie) {
    if (!tie.twoLeg) return { home: tie.teamA, away: tie.teamB };
    return tie.legs.length === 0
      ? { home: tie.teamB, away: tie.teamA }
      : { home: tie.teamA, away: tie.teamB };
  }

  function aggregateKnockoutTie(tie) {
    let aggregateA = 0;
    let aggregateB = 0;
    tie.legs.forEach((leg) => {
      aggregateA += leg.home === tie.teamA ? leg.homeGoals : leg.awayGoals;
      aggregateB += leg.home === tie.teamB ? leg.homeGoals : leg.awayGoals;
    });
    return { aggregateA, aggregateB };
  }

  function simulateKnockoutExtraTime(home, away, rng, options = {}) {
    const ratingDiff = home.strength - away.strength;
    const neutral = Boolean(options.neutral);
    return {
      homeGoals: clamp(poisson(Math.max(neutral ? 0.12 : 0.15,
        (neutral ? 0.275 : 0.3) + ratingDiff * (neutral ? 0.0225 : 0.025)), rng), 0, 3),
      awayGoals: clamp(poisson(Math.max(0.12,
        (neutral ? 0.275 : 0.25) - ratingDiff * (neutral ? 0.0225 : 0.02)), rng), 0, 3)
    };
  }

  function simulateKnockoutPenalties(home, away, rng, options = {}) {
    const neutral = Boolean(options.neutral);
    const homeChance = neutral ? 0.74 : 0.76;
    const awayChance = neutral ? 0.74 : 0.72;
    let homeScore = 0;
    let awayScore = 0;
    for (let index = 0; index < 5; index += 1) {
      homeScore += rng() < homeChance ? 1 : 0;
      awayScore += rng() < awayChance ? 1 : 0;
    }
    while (homeScore === awayScore) {
      homeScore += rng() < homeChance ? 1 : 0;
      awayScore += rng() < awayChance ? 1 : 0;
    }
    return {
      home: homeScore,
      away: awayScore,
      winner: homeScore > awayScore ? home : away
    };
  }

  function applyLeagueResult(table, homeName, awayName, gf, ga) {
    const home = table[homeName];
    const away = table[awayName];
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += gf;
    home.goalsAgainst += ga;
    away.goalsFor += ga;
    away.goalsAgainst += gf;
    if (gf > ga) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (gf === ga) {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    } else {
      home.losses += 1;
      away.wins += 1;
      away.points += 3;
    }
    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  const sortLeagueRows = (table) => Object.values(table).sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));

  return {
    hashSeed,
    nextRandomState,
    makeRng,
    shuffleWithRng,
    teamStrength,
    createLeagueSchedule,
    createLeagueTable,
    createEloMap,
    advanceAiFixtures,
    simulateLeagueResult,
    buildLeaguePhaseSchedule,
    sortEuropeanLeaguePhase,
    nextKnockoutLegTeams,
    aggregateKnockoutTie,
    simulateKnockoutExtraTime,
    simulateKnockoutPenalties,
    applyLeagueResult,
    sortLeagueRows
  };
});
