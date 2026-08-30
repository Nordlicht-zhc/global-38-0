const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const europeContext = {};
vm.runInNewContext(
  `${fs.readFileSync(path.join(root, "src", "european-clubs.js"), "utf8")}; this.list = EUROPE_2026_27; this.profiles = EUROPEAN_CLUB_PROFILES;`,
  europeContext
);

const playerContext = {};
vm.runInNewContext(
  `${fs.readFileSync(path.join(root, "src", "season-players.js"), "utf8")}; this.data = SEASON_PLAYERS;`,
  playerContext
);

const currentClubIds = new Set(playerContext.data["2025-26"].clubs.map((club) => club.id));
["UCL", "UEL", "UECL"].forEach((competition) => {
  const entries = europeContext.list[competition];
  assert.strictEqual(entries.length, 36, `${competition} must contain 36 league-phase teams.`);
  assert.strictEqual(new Set(entries.map((entry) => entry.name)).size, 36, `${competition} contains duplicate teams.`);
  entries.forEach((entry) => {
    assert(entry.association, `${competition}/${entry.name} is missing its association.`);
    if (entry.id) assert(currentClubIds.has(entry.id), `${competition}/${entry.id} is missing from the current club pool.`);
    else assert(europeContext.profiles[entry.profile || entry.name], `${competition}/${entry.name} is missing a strength profile.`);
  });
});

console.log("European 2026-27 list: PASS (36 teams per competition, IDs and profiles resolved)");
