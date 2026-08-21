const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");

const challengeContext = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "challenge-data.js"), "utf8"), challengeContext);
const peakChallenge = challengeContext.window.G38Challenges.find((challenge) => challenge.id === "club-peak");
assert(peakChallenge, "Club Peak challenge is missing.");
assert.equal(peakChallenge.objectives.length, 3, "Club Peak should expose three objectives.");

const seasonContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "season-players.js"), "utf8")};globalThis.__season = SEASON_PLAYERS["2025-26"];`, seasonContext);
const currentClubs = seasonContext.__season.clubs.filter((club) => ["eng", "esp", "ita", "ger", "fra"].includes(club.league));
assert.equal(currentClubs.length, 96, "Club Peak should cover all 2025-26 Big Five clubs.");
assert.equal(new Set(currentClubs.map((club) => club.id)).size, currentClubs.length, "Club Peak club IDs must be unique.");

const standingsContext = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "season-standings.js"), "utf8")};globalThis.__standings = HISTORICAL_STANDINGS;`, standingsContext);
const seasons = Object.keys(standingsContext.__standings);
assert(seasons.length >= 30, "Historical standings should cover the available challenge history.");
assert(seasons.includes("2025-26"), "Current season standings are required for Club Peak benchmarks.");

function parseAppObject(name) {
  const match = app.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n  \\});`));
  assert(match, `Could not read ${name} from app.js.`);
  return vm.runInNewContext(`(${match[1]})`);
}

const historicalClubIds = parseAppObject("HISTORICAL_CLUB_IDS");
const dynastyAliases = parseAppObject("DYNASTY_CLUB_ALIASES");
const normalize = (value) => {
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
};
const canonicalHistoricalId = (name) => {
  const target = normalize(name);
  const match = Object.entries(historicalClubIds).find(([id, aliases]) => [id, ...(aliases || [])]
    .some((value) => normalize(value) === target));
  return match?.[0] || null;
};
const allHistoricalNames = Object.values(standingsContext.__standings)
  .flatMap((tables) => Object.values(tables).flat());
const missingBenchmarks = currentClubs.filter((club) => {
  const aliases = [club.id, club.short, ...(historicalClubIds[club.id] || [])]
    .filter(Boolean)
    .map(normalize);
  return !allHistoricalNames.some((name) => {
    const canonicalId = canonicalHistoricalId(name);
    const historicalName = normalize(name);
    return (canonicalId && (canonicalId === club.id || (historicalClubIds[canonicalId] || []).includes(club.id)))
      || aliases.some((alias) => alias === historicalName
        || (alias.length >= 6 && (alias.includes(historicalName) || historicalName.includes(alias))));
  });
});
assert.equal(missingBenchmarks.length, 0, `Missing historical benchmarks: ${missingBenchmarks.join(", ")}`);

[
  "STORAGE_CLUB_PEAKS",
  "clubPeakBenchmark",
  "updateClubPeakRecord",
  "peakClubId",
  "shouldHideLeagueChoice",
  "clubPeakObjectiveTexts"
].forEach((token) => assert(app.includes(token), `Club Peak implementation token is missing: ${token}`));
assert(html.includes("data-play-mode=\"challenge\""), "Challenge mode entry is missing.");
assert(html.includes("challengeRules"), "Challenge setup container is missing.");
assert.match(app, /league: dynastyType === "tiered" \? journeyLeagueId\(3\) : peakClub\?\.league \|\| null/, "Club Peak must start in the target club's league.");
assert.match(app, /state\.game\.league = peakLeague \|\| null/, "Changing formation must preserve the locked Club Peak league.");
assert.match(app, /const leagueLocked = shouldHideLeagueChoice\(game\);/, "Club Peak must not reopen league choice after drafting.");

console.log(`Club Peak challenge: PASS (${currentClubs.length} clubs, ${seasons.length} historical seasons)`);
