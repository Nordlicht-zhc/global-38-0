const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("src/save-data.js", "utf8"), context);

const matches = Array.from({ length: 35 }, (_, index) => ({
  round: index + 1,
  score: `${index % 4}-${index % 3}`
}));
const source = {
  game: { result: { matches }, playerStats: [{ id: "player-1", apps: 35 }] },
  classicGame: { result: { matches: matches.slice() }, mode: "classic" },
  dynastyGame: { result: { matches: matches.slice() }, mode: "dynasty" },
  runs: [{ result: { matches: matches.slice() } }],
  clubPeaks: { clubA: 88 },
  achievements: ["clean-sheet"]
};

const prepared = context.window.G38SaveData.prepare(source);
assert.strictEqual(context.window.G38SaveData.HISTORY_MATCH_LIMIT, 30);
assert.strictEqual(context.window.G38SaveData.needsTrim(source), true);
assert.strictEqual(context.window.G38SaveData.prepareGame(source.game).result.matches.length, 30);
assert.strictEqual(context.window.G38SaveData.prepareRuns(source.runs)[0].result.matches.length, 30);
assert.strictEqual(prepared.game.result.matches.length, 30);
assert.strictEqual(prepared.classicGame.result.matches.length, 30);
assert.strictEqual(prepared.dynastyGame.result.matches.length, 30);
assert.strictEqual(prepared.runs[0].result.matches.length, 30);
assert.strictEqual(prepared.game.result.matches[0].round, 6);
assert.strictEqual(prepared.game.playerStats[0].apps, 35);
assert.strictEqual(JSON.stringify(prepared.clubPeaks), JSON.stringify(source.clubPeaks));
assert.strictEqual(JSON.stringify(prepared.achievements), JSON.stringify(source.achievements));
assert.strictEqual(source.game.result.matches.length, 35);
assert.strictEqual(source.runs[0].result.matches.length, 35);
assert.strictEqual(context.window.G38SaveData.needsTrim(prepared), false);

const cyclicGame = { id: "dynasty", simulation: null };
const simulation = { game: cyclicGame, rng: () => 1 };
cyclicGame.simulation = simulation;
const preparedCyclicGame = context.window.G38SaveData.prepareGame(cyclicGame);
assert.strictEqual(preparedCyclicGame.id, "dynasty");
assert.strictEqual(preparedCyclicGame.simulation.game, undefined);
assert.strictEqual(preparedCyclicGame.simulation.rng, undefined);
assert.strictEqual(context.window.G38SaveData.needsTrim(cyclicGame), false);
console.log("Local history limit: PASS (latest 30 matches; other fields and source unchanged)");
