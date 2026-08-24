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
assert(app.includes("const maxTransfers = options.postSeason && isTieredDynasty(sim.game) ? 1 : 2;"), "Three-Tier Journey post-season windows must allow only one signing.");
assert(app.includes("if (transfer.completed >= (transfer.maxTransfers || 2))"), "Transfer completion must respect the window-specific signing limit.");
assert(app.includes('mode: options.postSeason ? "free" : "weak"'), "Dynasty post-season windows are not fixed to free signing.");
assert(app.includes("if (transfer.postSeason) {\n      transfer.mode = \"free\";"), "The second dynasty signing can still switch to a random transfer mode.");
assert(app.includes("if (game.postSeasonTransfer?.status !== \"resolved\")"), "Next-season entry is not gated by the transfer window.");
assert(app.includes("shouldHideDynastyLeagueChoice(game)"), "Dynasty continuation does not hide league selection.");
assert(app.includes("game.postSeasonTransfer = dynastyHasNextSeason(game)"), "Season completion does not create the next-season transfer window.");
assert(app.includes("const seasonClubs = allClubs(season);"), "Direct mid-season pools must use the normal league-wide club pool.");
const weakPoolStart = app.indexOf("function buildWeakTransferClubPool");
const directPoolStart = app.indexOf("function prepareDirectTransferCandidates", weakPoolStart);
const weakTransferPool = app.slice(weakPoolStart, directPoolStart);
assert(weakTransferPool.includes("allClubs(season)"), "Weak-area mid-season transfers must use the normal league-wide club pool.");
const freeAgentPoolStart = app.indexOf("function buildFreeAgentMarketPool(transfer, game)");
const freeAgentPoolEnd = app.indexOf("function buildWeakTransferClubPool", freeAgentPoolStart);
const freeAgentPool = app.slice(freeAgentPoolStart, freeAgentPoolEnd);
assert(freeAgentPool.includes("const market = ensureFreeAgentMarket(game);"), "Post-season transfer must use the free-agent market.");
assert(!freeAgentPool.includes("journeyTransferClubsForSeason"), "Post-season free-agent offers must use the normal unrestricted market.");
assert(app.includes("const upgradePool = pool.filter((player) => bestTransferFit(player, game, transfer)?.change > 0);"), "Emergency loans are not restricted to positive upgrades.");
assert(app.includes("buildLoanCandidates(pool, rng, transfer, game)"), "Emergency loans are not evaluated against the current lineup.");
assert(app.includes("const effectiveRate = Number(candidate.rate || candidate.baseRate || 0);"), "Transfer signing must preserve the offered player rating.");
assert(app.includes("const baseRate = Number(player?.rate || player?.baseRate || 0);"), "Transfer impact must use the offered player rating before raw fallback.");

console.log("Dynasty transfer window: PASS (normal mid-season and post-season markets, loan upgrades, and gating)");
