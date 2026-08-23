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
assert(app.includes("function journeyTransferClubsForSeason(game, season)"), "Dynasty transfer candidates are not tier-aware.");
assert(app.includes("const seasonClubs = transferClubsForSeason(game, season);"), "Direct transfer pools do not use the current journey tier.");
assert(app.includes("isTransferCandidateFromAllowedClub(player, game, allowedBySeason.get(season))"), "Free-agent offers are not limited to the current journey tier.");
assert(app.includes("const upgradePool = pool.filter((player) => bestTransferFit(player, game, transfer)?.change > 0);"), "Emergency loans are not restricted to positive upgrades.");
assert(app.includes("buildLoanCandidates(pool, rng, transfer, game)"), "Emergency loans are not evaluated against the current lineup.");

console.log("Dynasty transfer window: PASS (post-season free signings, tier-aware pools, loan upgrades, and gating)");
