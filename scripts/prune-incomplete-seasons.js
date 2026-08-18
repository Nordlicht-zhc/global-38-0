const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "source-data", "legacy-seasons.js");
const historyDir = path.join(root, "history-data");
const minimumUsablePlayers = 11;
const maximumIncompleteShare = 0.5;
const sandbox = {};

vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(dataPath, "utf8")};this.data=LEGACY_SEASONS;`, sandbox, {
    filename: "source-data/legacy-seasons.js"
});

const removed = [];
for (const [season, data] of Object.entries(sandbox.data)) {
  const clubs = Array.isArray(data?.clubs) ? data.clubs : [];
  const incomplete = clubs.filter((club) => (club.players || []).length < minimumUsablePlayers);
  if (clubs.length && incomplete.length / clubs.length > maximumIncompleteShare) {
    removed.push({
      season,
      clubs: clubs.length,
      players: clubs.reduce((sum, club) => sum + (club.players || []).length, 0),
      incomplete: incomplete.length
    });
    delete sandbox.data[season];
    const chunkPath = path.join(historyDir, `${season}.js`);
    if (fs.existsSync(chunkPath)) fs.unlinkSync(chunkPath);
  }
}

const output = `// Historical FIFA ratings for seasons before the modern dataset.\nconst LEGACY_SEASONS = ${JSON.stringify(sandbox.data)};\n`;
fs.writeFileSync(dataPath, output, "utf8");

if (!removed.length) {
  console.log("No incomplete historical seasons found.");
} else {
  removed.forEach((entry) => {
    console.log(`Removed ${entry.season}: ${entry.incomplete}/${entry.clubs} clubs had fewer than ${minimumUsablePlayers} players (${entry.players} player records).`);
  });
}
