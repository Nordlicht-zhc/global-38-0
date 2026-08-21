const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("cloud-payload.js", "utf8"), context);

const matches = Array.from({ length: 35 }, (_, index) => ({
  round: index + 1,
  score: `${index % 4}-${index % 3}`
}));
const source = {
  schemaVersion: 1,
  game: { result: { matches }, playerStats: [{ id: "player-1", apps: 35 }] },
  runs: [{ result: { matches: matches.slice() } }],
  clubPeaks: { clubA: 88 },
  achievements: ["clean-sheet"],
  localChangedAt: 123
};

const prepared = context.window.G38CloudPayload.prepare(source);
assert.strictEqual(context.window.G38CloudPayload.HISTORY_MATCH_LIMIT, 30);
assert.strictEqual(context.window.G38CloudPayload.needsTrim(source), true);
assert.strictEqual(context.window.G38CloudPayload.prepareGame(source.game).result.matches.length, 30);
assert.strictEqual(context.window.G38CloudPayload.prepareRuns(source.runs)[0].result.matches.length, 30);
assert.strictEqual(prepared.game.result.matches.length, 30);
assert.strictEqual(prepared.runs[0].result.matches.length, 30);
assert.strictEqual(prepared.game.result.matches[0].round, 6);
assert.strictEqual(prepared.game.playerStats[0].apps, 35);
assert.strictEqual(JSON.stringify(prepared.clubPeaks), JSON.stringify(source.clubPeaks));
assert.strictEqual(JSON.stringify(prepared.achievements), JSON.stringify(source.achievements));
assert.strictEqual(source.game.result.matches.length, 35);
assert.strictEqual(source.runs[0].result.matches.length, 35);
assert.strictEqual(context.window.G38CloudPayload.needsTrim(prepared), false);
console.log("Cloud/local history limit: PASS (latest 30 matches; other fields and local source unchanged)");
