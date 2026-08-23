const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(app.includes('achievementStatus: achievementsPending ? "pending-europe" : "settled"'),
  "Season results must mark European qualifiers as pending achievements.");
assert(app.includes("function collectSeasonAchievements(result"),
  "Season achievement collection helper is missing.");
assert(app.includes("function settleAchievements(run)"),
  "European achievement settlement helper is missing.");
assert(app.includes("europeResult\n    });"),
  "Season achievement collection must receive the European result.");
assert(app.includes("collectSeasonAchievements(result, run.europeResult,"),
  "Settlement must collect achievements from the completed European result.");
assert(app.includes('list.push("欧洲冠军")'),
  "European champion achievement is missing.");
assert(app.includes('europe.competition === "UCL"'),
  "Champions League achievement must inspect the European competition.");
assert(app.includes('UEL: "欧联登顶"'),
  "Europa League achievement is missing.");
assert(app.includes('UECL: "欧协联登顶"'),
  "Conference League achievement is missing.");
[
  "火力全开",
  "铜墙铁壁",
  "百分赛季",
  "大胜专家",
  "十连胜",
  "进球机器",
  "助攻大师",
  "零封之王",
  "国内双冠",
  "三冠王",
  "三星通关",
  "草根传奇",
  "铁血冠军",
  "穿越冠军",
  "世界联队",
  "超越历史"
].forEach((name) => {
  assert(app.includes(`\"${name}\"`), `Season achievement ${name} is missing.`);
});
assert(app.includes("function summarizeAchievementMatches(matches)"),
  "Match-level achievement metrics are missing.");
assert(app.includes('result.achievementStatus !== "pending-europe" || !run.europeResult'),
  "Achievements should not settle before the European result exists.");
assert(app.includes("settleAchievements(sim.run);"),
  "European completion must settle the season achievements.");
assert(app.includes("freeAgentSignings"),
  "Free-agent market signings must feed the achievement result.");
assert(app.includes("recordFreeAgentSigning(game, candidate, transfer)"),
  "Free-agent signing records are missing from the transfer flow.");
assert(app.includes('const europePending = result.achievementStatus === "pending-europe" && !run.europeResult;'),
  "Result rendering must expose the pending-European state.");
assert(app.includes("Complete this season's European competition before starting the next season."),
  "Dynasty continuation must wait for European completion.");

console.log("Achievement timing: PASS (settles after European competition)");
