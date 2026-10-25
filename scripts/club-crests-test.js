const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const root = path.resolve(__dirname, "..");
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, "src/club-crests.js"), "utf8"), context);
const resolve = (...names) => context.window.G38ClubCrests.resolve(names);
assert(resolve("man-city").endsWith("manchester-city.png"));
assert(resolve("曼城") === resolve("Manchester City"));
assert(resolve("man-united") !== resolve("man-city"));
assert(resolve("atletico") !== resolve("athletic-bilbao"));
assert(resolve("Inter Milan") !== resolve("inter-miami"));
assert.equal(resolve("unknown-club"), "");
vm.runInContext(fs.readFileSync(path.join(root, "src/season-players.js"), "utf8") + ";this.clubs = SEASON_PLAYERS['2025-26'].clubs;", context);
for (const club of context.clubs) {
  assert(resolve(club.id, club.name), `Missing active badge: ${club.id}`);
}
vm.runInContext(fs.readFileSync(path.join(root, "src/european-clubs.js"), "utf8")
  + ";this.europeProfiles = Object.keys(EUROPEAN_CLUB_PROFILES);this.europeEntries = Object.values(EUROPE_2026_27).flat();", context);
for (const name of context.europeProfiles) {
  assert(resolve(name), `Missing European profile badge: ${name}`);
  assert(fs.existsSync(path.join(root, resolve(name))), `Missing European badge file: ${name}`);
}
for (const entry of context.europeEntries) {
  const expected = resolve(entry.profile || entry.id, entry.name);
  assert(expected, `Missing European entrant badge: ${entry.name}`);
  assert.equal(resolve(entry.name), expected, `European display alias mismatch: ${entry.name}`);
}
assert.equal(resolve("Bodo/Glimt"), resolve("Bodø/Glimt"));
assert.equal(resolve("S. Bratislava"), resolve("Slovan Bratislava"));
assert.equal(resolve("KuPS Kuopio"), resolve("KuPS"));
assert.equal(resolve("L. Red Imps"), resolve("Lincoln Red Imps"));
assert.notEqual(resolve("Sabah"), resolve("Slovan Bratislava"));
const sources = JSON.parse(fs.readFileSync(path.join(root, "assets/club-crests/sources.json"), "utf8"));
for (const asset of sources.assets) {
  const data = fs.readFileSync(path.join(root, "assets/club-crests", asset.file));
  assert.equal(data.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", asset.file);
}
console.log(`Club badges passed: ${context.clubs.length} active clubs; ${context.europeProfiles.length} European profiles; ${context.europeEntries.length} European entrants; ${sources.assets.length} local PNGs; aliases, distinct identities and unknown-club fallback checked.`);
