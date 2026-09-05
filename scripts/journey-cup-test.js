const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const core = require("../src/simulation-core.js");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src", "app.js"), "utf8");

function createTeams() {
  return Array.from({ length: 96 }, (_, index) => {
    const tier = Math.floor(index / 32) + 1;
    return {
      name: `Journey ${index + 1}`,
      tier,
      strength: 92 - index / 3,
      clubCoefficient: (4 - tier) * 1000 + (92 - index / 3),
      isUser: index === 0,
      played: 8,
      wins: 4,
      draws: 1,
      losses: 3,
      points: 13,
      goalsFor: 12,
      goalsAgainst: 9,
      awayGoals: 5,
      awayWins: 2,
      disciplinaryPoints: 0
    };
  });
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

function verifyLeaguePhase(seed) {
  const teams = createTeams();
  const rounds = core.buildLeaguePhaseSchedule(teams, 8, core.makeRng(core.hashSeed(seed)));
  assert.strictEqual(rounds.length, 8, "Journey Cup must have eight league-phase matchdays.");
  assert(rounds.every((round) => round.matches.length === 48),
    "Every Journey Cup matchday must contain 48 fixtures.");
  const seeded = [...teams].sort((left, right) => right.clubCoefficient - left.clubCoefficient);
  const potByTeam = new Map(seeded.map((team, index) => [team, Math.floor(index / 24) + 1]));
  teams.forEach((team) => {
    const matches = rounds.flatMap((round) => round.matches)
      .filter((match) => match.home === team || match.away === team);
    const opponents = matches.map((match) => match.home === team ? match.away : match.home);
    assert.strictEqual(matches.length, 8, `${team.name} must play eight league-phase matches.`);
    assert.strictEqual(new Set(opponents).size, 8, `${team.name} has a duplicate opponent.`);
    assert.strictEqual(matches.filter((match) => match.home === team).length, 4,
      `${team.name} must have four home matches.`);
    assert.strictEqual(matches.filter((match) => match.away === team).length, 4,
      `${team.name} must have four away matches.`);
    [1, 2, 3, 4].forEach((pot) => {
      assert.strictEqual(opponents.filter((opponent) => potByTeam.get(opponent) === pot).length, 2,
        `${team.name} must draw two opponents from pot ${pot}.`);
    });
  });
  return rounds;
}

for (let index = 0; index < 12; index += 1) verifyLeaguePhase(`journey-cup-${index}`);

const replayA = verifyLeaguePhase("journey-cup-replay");
const replayB = verifyLeaguePhase("journey-cup-replay");
assert.deepStrictEqual(
  replayA.map((round) => round.matches.map((match) => `${match.home.name}-${match.away.name}`)),
  replayB.map((round) => round.matches.map((match) => `${match.home.name}-${match.away.name}`)),
  "A seeded Journey Cup draw must replay exactly."
);

assert(appSource.includes("journeyLeaguePhase: true"), "Journey Cup league-phase state is missing.");
assert(appSource.includes("const playoffEntrants = table.slice(16, 48);"),
  "Ranks 17-48 must enter the Journey Cup play-offs.");
assert(appSource.includes("cup.directQualifiers = table.slice(0, 16);"),
  "Top 16 must qualify directly for the Round of 32.");
assert(appSource.includes('name: "32强"') && appSource.includes('name: "决赛"'),
  "Journey Cup knockout stages are incomplete.");
assert(appSource.includes("twoLeg: true") && appSource.includes("twoLeg = nextName !== \"决赛\""),
  "Journey Cup must use two legs before the single-match final.");

const progressionContext = {
  G38SimulationCore: core,
  createEuropeanTie: (teamA, teamB, twoLeg, neutral = false) => ({ teamA, teamB, twoLeg, neutral, legs: [] })
};
vm.runInNewContext([
  readSourceFunction("journeyCupMilestones"),
  readSourceFunction("prepareJourneyCupKnockout"),
  readSourceFunction("nextJourneyCupStage"),
  "this.journeyCupMilestones = journeyCupMilestones;",
  "this.prepareJourneyCupKnockout = prepareJourneyCupKnockout;",
  "this.nextJourneyCupStage = nextJourneyCupStage;"
].join("\n"), progressionContext);
const cup = { teams: createTeams(), leagueMatches: [], leagueTable: null };
progressionContext.prepareJourneyCupKnockout(cup);
assert.strictEqual(cup.leagueTable.length, 96, "Journey Cup table must rank all 96 clubs.");
assert.strictEqual(cup.directQualifiers.length, 16, "Top 16 must be retained as direct qualifiers.");
assert.strictEqual(cup.currentStage.name, "附加赛");
assert.strictEqual(cup.currentStage.ties.length, 16, "Ranks 17-48 must create 16 play-off ties.");
assert(cup.currentStage.ties.every((tie) => tie.twoLeg), "Every play-off tie must be two-legged.");
const playOffWinners = cup.currentStage.ties.map((tie) => tie.teamA);
const r32 = progressionContext.nextJourneyCupStage(cup, "附加赛", playOffWinners);
assert.strictEqual(r32.name, "32强");
assert.strictEqual(r32.ties.length, 16, "Direct qualifiers and play-off winners must form a 32-club round.");
assert(r32.ties.every((tie) => tie.twoLeg), "The Round of 32 must be two-legged.");
const final = progressionContext.nextJourneyCupStage(cup, "半决赛", [cup.teams[0], cup.teams[1]]);
assert.strictEqual(final.name, "决赛");
assert.strictEqual(final.twoLeg, false, "The Journey Cup final must stay single-match.");
assert.strictEqual(progressionContext.journeyCupMilestones(31).length, 14,
  "Journey Cup must schedule eight league matchdays and six knockout rounds.");

console.log("Journey Cup format: PASS (96 clubs, four pots, 8 matches, extended knockout)");
