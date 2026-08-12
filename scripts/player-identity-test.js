const fs = require("fs");
const path = require("path");
const vm = require("vm");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.resolve(__dirname, "..", "player-identity.js"), "utf8"), sandbox);
const identity = sandbox.window.G38PlayerIdentity;
const aliases = { "real-sociedad": ["real-sociedad-cf", "real-sociedad-de-futbol"] };

const current = { id: "2025-26|real-sociedad|Álex Remiro", name: "Álex Remiro" };
const historical = { id: "2021-22|real-sociedad-cf|Alex Remiro", name: "Alex Remiro" };
const otherClub = { id: "2021-22|athletic-club|Alex Remiro", name: "Alex Remiro" };

if (identity.key(current, aliases) !== identity.key(historical, aliases)) {
  throw new Error("Same player across club aliases was not matched");
}
if (identity.key(current, aliases) === identity.key(otherClub, aliases)) {
  throw new Error("Same player name at another club was incorrectly matched");
}
console.log("Cross-season same-club identity: PASS");
console.log("Different-club same-name identity: PASS");
