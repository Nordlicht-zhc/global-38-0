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

  function simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway) {
    const hasElo = Number.isFinite(eloHome) && Number.isFinite(eloAway);
    const homeStrength = teamStrength(homeProfile);
    const awayStrength = teamStrength(awayProfile);
    const baseDiff = homeStrength - awayStrength + 1;
    const strengthExpected = clamp(1 / (1 + Math.pow(10, -baseDiff / 8)), 0.06, 0.88);
    const expectedHome = hasElo
      ? clamp(eloExpected(eloHome + HOME_ELO_ADVANTAGE, eloAway) * 0.7 + strengthExpected * 0.3, 0.06, 0.94)
      : strengthExpected;
    const diff = hasElo ? eloHome - eloAway : baseDiff;
    const drawChance = clamp(0.3 - Math.abs(diff) * 0.00035, 0.19, 0.3);
    const isDraw = rng() < drawChance;
    const result = isDraw ? "D" : rng() < expectedHome ? "H" : "A";
    const expectedFor = clamp(0.85 + (homeProfile.attack - awayProfile.defense) * 0.055
      + (homeProfile.midfield - awayProfile.midfield) * 0.02, 0.4, 2.8);
    const expectedAgainst = clamp(0.8 + (awayProfile.attack - homeProfile.defense) * 0.05
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
    simulateLeagueResult,
    applyLeagueResult,
    sortLeagueRows
  };
});
