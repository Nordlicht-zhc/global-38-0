const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const context = {};
vm.runInNewContext(
  `${fs.readFileSync(path.join(root, "src", "european-clubs.js"), "utf8")};
this.data = {
  cutoff: EUROPEAN_REGISTRATION_CUTOFF,
  status: EUROPEAN_REGISTRATION_STATUS,
  version: EUROPEAN_REGISTRATION_LIST_VERSION,
  squads: EUROPEAN_REGISTERED_SQUADS,
  competitions: EUROPE_2026_27
};`,
  context
);

assert.strictEqual(context.data.cutoff, "2026-09-02");
assert.match(context.data.version, /^2026-27-registration-/);
const entries = Object.values(context.data.competitions).flat();
const entryKeys = new Set(entries.flatMap((entry) => [entry.id, entry.profile, entry.name].filter(Boolean)));

Object.entries(context.data.squads).forEach(([key, players]) => {
  assert(entryKeys.has(key), `Registration data has no matching European entry: ${key}`);
  assert(Array.isArray(players) && players.length > 0, `${key} must have at least one registered player.`);
  const names = new Set();
  players.forEach((player) => {
    assert(player && typeof player.name === "string" && player.name.trim(), `${key} has an invalid player name.`);
    assert(Array.isArray(player.pos) && player.pos.length > 0, `${key}/${player.name} has no position.`);
    assert(typeof player.nat === "string" && player.nat.trim(), `${key}/${player.name} has no nationality.`);
    assert(Number.isFinite(Number(player.rate)), `${key}/${player.name} has no numeric rating.`);
    assert(!names.has(player.name), `${key} contains duplicate player ${player.name}.`);
    names.add(player.name);
  });
});

if (context.data.status === "pending") {
  assert.strictEqual(Object.keys(context.data.squads).length, 0,
    "Pending registration data must not contain an unconfirmed UEFA snapshot.");
  console.log("European registration snapshot: PENDING (waiting for the 2026-09-02 UEFA deadline)");
} else {
  assert.strictEqual(context.data.status, "final", "Registration status must be pending or final.");
  entries.forEach((entry) => {
    const key = [entry.id, entry.profile, entry.name].find((candidate) => candidate in context.data.squads);
    assert(key, `Final registration data is missing ${entry.name}.`);
  });
  console.log(`European registration snapshot: PASS (${Object.keys(context.data.squads).length} club squads)`);
}
