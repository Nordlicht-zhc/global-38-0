const assert = require("assert");
const core = require("../src/simulation-core.js");

function createTeams() {
  return Array.from({ length: 36 }, (_, index) => ({
    name: `Team ${index + 1}`,
    clubCoefficient: 100 - index,
    strength: 100 - index,
    association: `association-${index % 12}`
  }));
}

function verifyDraw(matchdays, potCount, opponentsPerPot, seed) {
  const teams = createTeams();
  const rounds = core.buildLeaguePhaseSchedule(
    teams,
    matchdays,
    core.makeRng(core.hashSeed(seed))
  );
  assert.strictEqual(rounds.length, matchdays, `${matchdays}-match league phase has the wrong round count.`);
  assert(rounds.every((round) => round.matches.length === 18), "Every league-phase round must contain 18 matches.");
  const sorted = [...teams].sort((left, right) => right.clubCoefficient - left.clubCoefficient);
  const potSize = teams.length / potCount;
  const potByTeam = new Map(sorted.map((team, index) => [team, Math.floor(index / potSize)]));
  teams.forEach((team) => {
    const matches = rounds.flatMap((round) => round.matches)
      .filter((match) => match.home === team || match.away === team);
    const opponents = matches.map((match) => match.home === team ? match.away : match.home);
    assert.strictEqual(matches.length, matchdays, `${team.name} has the wrong match count.`);
    assert.strictEqual(new Set(opponents).size, matchdays, `${team.name} has a duplicate opponent.`);
    assert.strictEqual(matches.filter((match) => match.home === team).length, matchdays / 2,
      `${team.name} does not have balanced home and away matches.`);
    assert(opponents.every((opponent) => opponent.association !== team.association),
      `${team.name} was drawn against a club from the same association.`);
    const opponentsByPot = Array(potCount).fill(0);
    opponents.forEach((opponent) => { opponentsByPot[potByTeam.get(opponent)] += 1; });
    assert(opponentsByPot.every((count) => count === opponentsPerPot),
      `${team.name} has an invalid pot draw: ${opponentsByPot.join("/")}.`);
    if (opponentsPerPot === 2) {
      for (let pot = 0; pot < potCount; pot += 1) {
        const potMatches = matches.filter((match) => potByTeam.get(match.home === team ? match.away : match.home) === pot);
        assert.strictEqual(potMatches.filter((match) => match.home === team).length, 1,
          `${team.name} must have one home match against pot ${pot + 1}.`);
        assert.strictEqual(potMatches.filter((match) => match.away === team).length, 1,
          `${team.name} must have one away match against pot ${pot + 1}.`);
      }
    }
  });
  return rounds;
}

for (let index = 0; index < 50; index += 1) {
  verifyDraw(8, 4, 2, `ucl-uel-${index}`);
  verifyDraw(6, 6, 1, `uecl-${index}`);
}

const replayA = verifyDraw(8, 4, 2, "pot-replay");
const replayB = verifyDraw(8, 4, 2, "pot-replay");
assert.deepStrictEqual(
  replayA.map((round) => round.matches.map((match) => `${match.home.name}-${match.away.name}`)),
  replayB.map((round) => round.matches.map((match) => `${match.home.name}-${match.away.name}`)),
  "Equal seeds must reproduce the same European draw."
);

console.log("European pot draw: PASS (UCL/UEL four pots, UECL six pots, balanced venues)");
