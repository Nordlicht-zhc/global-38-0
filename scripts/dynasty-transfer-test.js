const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "global 38-0.html"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(html.includes('id="postSeasonTransferBtn"'), "Result view is missing the post-season transfer action.");
assert(app.includes("function openPostSeasonTransferWindow()"), "Post-season transfer entry is missing.");
assert(app.includes("function finishPostSeasonTransferWindow(transfer)"), "Post-season transfer completion is missing.");
assert(app.includes("postSeason: Boolean(options.postSeason)"), "Transfer state does not record post-season windows.");
assert(app.includes('mode: options.postSeason ? "free" : "weak"'), "Dynasty post-season windows are not fixed to free signing.");
assert(app.includes("if (transfer.postSeason) {\n      transfer.mode = \"free\";"), "The second dynasty signing can still switch to a random transfer mode.");
assert(app.includes("if (game.postSeasonTransfer?.status !== \"resolved\")"), "Next-season entry is not gated by the transfer window.");
assert(app.includes("shouldHideDynastyLeagueChoice(game)"), "Dynasty continuation does not hide league selection.");
assert(app.includes("game.postSeasonTransfer = dynastyHasNextSeason(game)"), "Season completion does not create the next-season transfer window.");

console.log("Dynasty transfer window: PASS (post-season free signings, gating, and league-choice skip)");
