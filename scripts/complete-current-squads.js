const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "season-players.js");
const sandbox = {};

vm.createContext(sandbox);
vm.runInContext(`${fs.readFileSync(dataPath, "utf8")};this.data=SEASON_PLAYERS;`, sandbox);

const additions = {
  "aston-villa": [
    { name: "Jamaldeen Jimoh-Aloba", pos: ["CAM"], nat: "England", rate: 65 }
  ],
  "d-alaves": [
    { name: "Ville Koski", pos: ["CB"], nat: "Finland", rate: 68 }
  ],
  "getafe-cf": [
    { name: "Davinchi", pos: ["LB"], nat: "Spain", rate: 68 }
  ],
  "stade-brestois-29": [
    { name: "Ibrahim Salah", pos: ["LW"], nat: "Morocco", rate: 70 }
  ],
  "toulouse-fc": [
    { name: "Alexis Vossah", pos: ["CDM"], nat: "France", rate: 70 }
  ],
  "afc-bournemouth": [
    { name: "Will Dennis", pos: ["GK"], nat: "England", rate: 67 }
  ],
  burnley: [
    { name: "Václav Hladký", pos: ["GK"], nat: "Czech Republic", rate: 69 }
  ],
  "nott-m-forest": [
    { name: "Angus Gunn", pos: ["GK"], nat: "Scotland", rate: 72 }
  ],
  "athletic-club": [
    { name: "Álex Padilla", pos: ["GK"], nat: "Mexico", rate: 68 }
  ],
  "levante-ud": [
    { name: "Álex Primo", pos: ["GK"], nat: "Spain", rate: 60 }
  ],
  "rcd-espanyol": [
    { name: "Fortuño", pos: ["GK"], nat: "Spain", rate: 65 }
  ],
  bologna: [
    { name: "Federico Ravaglia", pos: ["GK"], nat: "Italy", rate: 70 }
  ],
  como: [
    { name: "Nikola Čavlina", pos: ["GK"], nat: "Croatia", rate: 67 }
  ],
  "tsg-hoffenheim": [
    { name: "Luca Philipp", pos: ["GK"], nat: "Germany", rate: 68 }
  ]
};

const current = sandbox.data["2025-26"];
if (!current || !Array.isArray(current.clubs)) {
  throw new Error("2025-26 club data is missing");
}

let added = 0;
for (const [clubId, players] of Object.entries(additions)) {
  const club = current.clubs.find((entry) => entry.id === clubId);
  if (!club) throw new Error(`Unknown club id: ${clubId}`);
  for (const player of players) {
    if (club.players.some((entry) => entry.name === player.name)) continue;
    club.players.push(player);
    added += 1;
  }
}

const output = `// 2004-05 through 2025-26 player pools. Active 2025-26 squads use FC 26 launch ratings with documented season additions.\nconst SEASON_PLAYERS = ${JSON.stringify(sandbox.data)};\n`;
fs.writeFileSync(dataPath, output, "utf8");
console.log(`Added ${added} player records to the 2025-26 squads.`);
