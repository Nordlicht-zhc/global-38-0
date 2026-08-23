const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");
const testEntry = fs.readFileSync(path.join(root, "test.html"), "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(html.includes('id="testConsole"'), "test console panel is missing");
assert(testEntry.includes("global%2038-0.html?test=1"), "test entry does not open test mode");
assert(app.includes('get("test") === "1"'), "test console is not URL-gated");
assert(app.includes("await startGame({ testMode: true })"), "quick-start does not mark test games");
assert(app.includes("fillTestSquad(state.game)"), "quick-start does not fill the squad");
assert(app.includes("if (state.game && !state.game.testMode) safeSet(STORAGE_GAME, state.game);"), "test games can overwrite the active save");
assert(app.includes("if (game?.testMode) return;"), "test games can enter history or achievements");

console.log("Test console checks: PASS");
