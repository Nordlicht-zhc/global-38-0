const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const sandbox = {};
const errors = [];
const warnings = [];
const validLeagues = new Set(["eng", "esp", "ita", "ger", "fra"]);
const validPositions = new Set(["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "ST"]);

function loadGlobal(file, expression) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  vm.runInContext(`${source};this.__loaded=${expression};`, sandbox, { filename: file });
  const value = sandbox.__loaded;
  delete sandbox.__loaded;
  return value;
}

function normalize(value) {
  return String(value || "").normalize("NFKC").trim().toLocaleLowerCase("en-US");
}

function checkPlayer(player, label) {
  if (!player || typeof player !== "object") {
    errors.push(`${label}: player must be an object`);
    return;
  }
  if (!String(player.name || "").trim()) errors.push(`${label}: missing player name`);
  if (String(player.name || "").includes("?")) errors.push(`${label}: corrupted player name ${player.name}`);
  if (!String(player.nat || "").trim()) errors.push(`${label}: missing nationality`);
  if (!Number.isInteger(player.rate) || player.rate < 40 || player.rate > 99) {
    errors.push(`${label}/${player.name || "unknown"}: invalid rating ${player.rate}`);
  }
  if (!Array.isArray(player.pos) || !player.pos.length) {
    errors.push(`${label}/${player.name || "unknown"}: position list is empty`);
  } else {
    for (const position of player.pos) {
      if (!validPositions.has(position)) errors.push(`${label}/${player.name}: invalid position ${position}`);
    }
  }
}

vm.createContext(sandbox);
const seasons = loadGlobal("season-players.js", "SEASON_PLAYERS");
const historyDir = path.join(root, "history-data");
if (fs.existsSync(historyDir)) {
  for (const file of fs.readdirSync(historyDir).filter((name) => name.endsWith(".js"))) {
    const historySandbox = { window: {} };
    vm.createContext(historySandbox);
    vm.runInContext(fs.readFileSync(path.join(historyDir, file), "utf8"), historySandbox, { filename: file });
    for (const [season, data] of Object.entries(historySandbox.window.G38_HISTORY_DATA || {})) {
      if (seasons[season]) errors.push(`${season}: duplicated in active and historical data`);
      seasons[season] = data;
    }
  }
}
const seasonNames = Object.keys(seasons);
let clubCount = 0;
let playerCount = 0;

for (const season of seasonNames) {
  const clubs = seasons[season] && seasons[season].clubs;
  if (!Array.isArray(clubs)) {
    errors.push(`${season}: clubs must be an array`);
    continue;
  }
  const ids = new Set();
  for (const club of clubs) {
    const label = `${season}/${club && (club.id || club.name)}`;
    if (!club || typeof club !== "object") {
      errors.push(`${season}: club must be an object`);
      continue;
    }
    if (!String(club.id || "").trim()) errors.push(`${label}: missing club id`);
    if (ids.has(club.id)) errors.push(`${season}: duplicate club id ${club.id}`);
    ids.add(club.id);
    if (!String(club.name || "").trim()) errors.push(`${label}: missing club name`);
    if (String(club.name || "").includes("?")) errors.push(`${label}: corrupted club name ${club.name}`);
    if (!validLeagues.has(club.league)) errors.push(`${label}: invalid league ${club.league}`);
    if (!Array.isArray(club.players)) {
      errors.push(`${label}: players must be an array`);
      continue;
    }
    const names = new Set();
    for (const player of club.players) {
      checkPlayer(player, label);
      const name = normalize(player && player.name);
      if (name && names.has(name)) errors.push(`${label}: duplicate player ${player.name}`);
      names.add(name);
    }
    clubCount += 1;
    playerCount += club.players.length;
  }
  if (season !== "2025-26" && clubs.length) {
    const incomplete = clubs.filter((club) => Array.isArray(club.players) && club.players.length < 11).length;
    if (incomplete / clubs.length > 0.5) {
      errors.push(`${season}: ${incomplete}/${clubs.length} clubs have fewer than 11 players`);
    }
  }
}

const current = seasons["2025-26"] && seasons["2025-26"].clubs;
const expectedLeagueSizes = { eng: 20, esp: 20, ita: 20, ger: 18, fra: 18 };
if (!Array.isArray(current)) {
  errors.push("2025-26: active club data is missing");
} else {
  for (const [league, expected] of Object.entries(expectedLeagueSizes)) {
    const actual = current.filter((club) => club.league === league).length;
    if (actual !== expected) errors.push(`2025-26/${league}: expected ${expected} clubs, found ${actual}`);
  }
  for (const club of current) {
    const keepers = club.players.filter((player) => player.pos.includes("GK")).length;
    if (club.players.length < 23) errors.push(`2025-26/${club.id}: only ${club.players.length} players`);
    if (club.players.length > 30) warnings.push(`2025-26/${club.id}: unusually large squad (${club.players.length})`);
    if (keepers < 2) errors.push(`2025-26/${club.id}: only ${keepers} goalkeeper`);
    const units = {
      DEF: ["CB", "LB", "RB", "LWB", "RWB"],
      MID: ["CDM", "CM", "CAM", "LM", "RM"],
      ATT: ["LW", "RW", "ST"]
    };
    for (const [unit, positions] of Object.entries(units)) {
      if (!club.players.some((player) => player.pos.some((position) => positions.includes(position)))) {
        errors.push(`2025-26/${club.id}: missing ${unit} position coverage`);
      }
    }
  }
}

console.log(`Checked ${seasonNames.length} seasons, ${clubCount} clubs and ${playerCount} player records.`);
for (const warning of warnings) console.warn(`WARN: ${warning}`);
if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  console.error(`Data validation failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(`PASS: active league sizes are 20/20/20/18/18; every active squad has at least 23 players and 2 goalkeepers.`);
}
