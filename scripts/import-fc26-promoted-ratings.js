"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sourcePath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!sourcePath) {
  throw new Error("Usage: node scripts/import-fc26-promoted-ratings.js <FC26 players.csv> [--dry-run]");
}

const TARGET_SEASON = "2025-26";
const TARGET_CLUB_IDS = new Set([
  "coventry", "hull", "ipswich",
  "deportivo", "malaga", "racing-santander",
  "frosinone", "monza", "venezia",
  "paderborn", "schalke", "elversberg",
  "lemans", "troyes"
]);
const rosterPath = path.resolve(__dirname, "..", "src", "season-players.js");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) rows.push([...row, value]);
  return rows;
}

function normalizeName(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function readActiveRoster() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${fs.readFileSync(rosterPath, "utf8")}; this.active = SEASON_PLAYERS["${TARGET_SEASON}"];`, context);
  return context.active;
}

function indexFc26Players(csvPath) {
  const [headers, ...rows] = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const columns = Object.fromEntries(headers.map((name, index) => [name, index]));
  if (columns.long_name === undefined || columns.overall === undefined) {
    throw new Error("The FC 26 CSV must contain long_name and overall columns.");
  }
  const indexed = new Map();
  rows.forEach((row) => {
    const longName = row[columns.long_name];
    const overall = Number(row[columns.overall]);
    const key = normalizeName(longName);
    if (!key || !Number.isInteger(overall) || overall < 40 || overall > 99) return;
    const entries = indexed.get(key) || [];
    entries.push({
      name: longName,
      overall,
      club: row[columns.club_name] || "",
      league: row[columns.league_name] || ""
    });
    indexed.set(key, entries);
  });
  return [...indexed.entries()].map(([key, entries]) => ({ key, entries }));
}

const active = readActiveRoster();
const fc26Entries = indexFc26Players(sourcePath);
const matched = [];
const changed = [];
const ambiguous = [];
const unmatched = [];

active.clubs.filter((club) => TARGET_CLUB_IDS.has(club.id)).forEach((club) => {
  club.players.forEach((player) => {
    const key = normalizeName(player.name);
    const exact = fc26Entries.find((entry) => entry.key === key)?.entries || [];
    const similar = fc26Entries
      .filter((entry) => entry.key !== key && (entry.key.includes(key) || key.includes(entry.key)))
      .flatMap((entry) => entry.entries);
    if (exact.length !== 1 || similar.length) {
      (exact.length || similar.length ? ambiguous : unmatched).push(`${club.name}: ${player.name}`);
      return;
    }
    const candidate = exact[0];
    matched.push({ club: club.name, player: player.name, overall: candidate.overall });
    if (player.rate !== candidate.overall) {
      changed.push({ club: club.name, player: player.name, from: player.rate, to: candidate.overall });
      player.rate = candidate.overall;
    }
  });
});

if (!dryRun) {
  active.fc26RatingImport = {
    source: "FC 26 player database export (long_name exact match; overall only)",
    importedAt: "2026-09-05",
    matchedPlayers: matched.length,
    changedPlayers: changed.length,
    ambiguousPlayers: ambiguous.length,
    unmatchedPlayers: unmatched.length
  };
  if (!active.source.includes("FC 26 overall ratings imported")) {
    active.source = `${active.source}; FC 26 overall ratings imported on 2026-09-05 for ${matched.length} uniquely matched promoted-club players`;
  }
  fs.writeFileSync(rosterPath, `// 2026-27 Big Five club pool and post-cutoff roster snapshot; the loader key stays 2025-26 for save compatibility.\nconst SEASON_PLAYERS = ${JSON.stringify({ [TARGET_SEASON]: active })};\n`, "utf8");
}

console.log(`FC 26 rating import ${dryRun ? "preview" : "complete"}: ${matched.length} uniquely matched, ${changed.length} changed, ${ambiguous.length} ambiguous, ${unmatched.length} unmatched.`);
changed.forEach((entry) => console.log(`${entry.club}: ${entry.player} ${entry.from} -> ${entry.to}`));
