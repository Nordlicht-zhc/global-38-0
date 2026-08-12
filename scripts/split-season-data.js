const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "history-data");
const currentSeason = "2025-26";

function loadGlobal(file, name) {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${fs.readFileSync(path.join(root, file), "utf8")};this.data=${name};`, sandbox);
  return sandbox.data;
}

const existingHistory = {};
if (fs.existsSync(outputDir)) {
  for (const file of fs.readdirSync(outputDir).filter((name) => name.endsWith(".json"))) {
    existingHistory[path.basename(file, ".json")] = JSON.parse(fs.readFileSync(path.join(outputDir, file), "utf8"));
  }
  for (const file of fs.readdirSync(outputDir).filter((name) => name.endsWith(".js"))) {
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(outputDir, file), "utf8"), sandbox);
    Object.assign(existingHistory, sandbox.window.G38_HISTORY_DATA || {});
  }
}
const seasons = {
  ...existingHistory,
  ...loadGlobal("legacy-seasons.js", "LEGACY_SEASONS"),
  ...loadGlobal("season-players.js", "SEASON_PLAYERS")
};

if (!seasons[currentSeason]) throw new Error(`${currentSeason} is missing`);
fs.mkdirSync(outputDir, { recursive: true });

let historicalCount = 0;
for (const [season, data] of Object.entries(seasons)) {
  if (season === currentSeason) continue;
  const output = `window.G38_HISTORY_DATA=window.G38_HISTORY_DATA||{};window.G38_HISTORY_DATA[${JSON.stringify(season)}]=${JSON.stringify(data)};\n`;
  fs.writeFileSync(path.join(outputDir, `${season}.js`), output, "utf8");
  historicalCount += 1;
}
for (const file of fs.readdirSync(outputDir).filter((name) => name.endsWith(".js"))) {
  const season = path.basename(file, ".js");
  if (!seasons[season] || season === currentSeason) fs.unlinkSync(path.join(outputDir, file));
}
for (const file of fs.readdirSync(outputDir).filter((name) => name.endsWith(".json"))) {
  fs.unlinkSync(path.join(outputDir, file));
}

const currentOutput = `// 2004-05 through 2025-26 player pools. Active 2025-26 squads use FC 26 launch ratings with documented season additions.\nconst SEASON_PLAYERS = ${JSON.stringify({ [currentSeason]: seasons[currentSeason] })};\n`;
fs.writeFileSync(path.join(root, "season-players.js"), currentOutput, "utf8");
console.log(`Wrote ${historicalCount} local-file-compatible history chunks and retained ${currentSeason} as the active bundle.`);
