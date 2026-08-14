const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(app.includes('achievementStatus: achievementsPending ? "pending-europe" : "settled"'),
  "Season results must mark European qualifiers as pending achievements.");
assert(app.includes("function collectSeasonAchievements(result)"),
  "Season achievement collection helper is missing.");
assert(app.includes("function settleAchievements(run)"),
  "European achievement settlement helper is missing.");
assert(app.includes('result.achievementStatus !== "pending-europe" || !run.europeResult'),
  "Achievements should not settle before the European result exists.");
assert(app.includes("settleAchievements(sim.run);"),
  "European completion must settle the season achievements.");
assert(app.includes('const europePending = result.achievementStatus === "pending-europe" && !run.europeResult;'),
  "Result rendering must expose the pending-European state.");
assert(app.includes("Complete this season's European competition before starting the next season."),
  "Dynasty continuation must wait for European completion.");

console.log("Achievement timing: PASS (settles after European competition)");
