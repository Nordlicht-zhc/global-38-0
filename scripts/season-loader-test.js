const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const requests = [];
const current = {};
vm.runInNewContext(`${fs.readFileSync(path.join(root, "season-players.js"), "utf8")};this.data=SEASON_PLAYERS;`, current);

const sandbox = {
  SEASON_PLAYERS: current.data,
  window: {}
};
sandbox.document = {
  createElement: () => ({}),
  head: {
    appendChild: (script) => {
      requests.push(script.src);
      const file = path.join(root, decodeURIComponent(script.src.split("?")[0]));
      if (!fs.existsSync(file)) {
        setTimeout(script.onerror, 0);
        return;
      }
      vm.runInContext(fs.readFileSync(file, "utf8"), sandbox);
      setTimeout(script.onload, 0);
    }
  }
};
sandbox.setTimeout = setTimeout;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, "season-data.js"), "utf8"), sandbox);

async function run() {
  const loader = sandbox.window.G38SeasonData;
  if (!loader.hasSeasonData("2025-26")) throw new Error("Current season was not preloaded");
  if (requests.length) throw new Error("Loader requested history during startup");

  const [first, duplicate] = await Promise.all([
    loader.loadSeasonData("1994-95"),
    loader.loadSeasonData("1994-95")
  ]);
  if (first !== duplicate) throw new Error("Concurrent requests did not share the cached result");
  if (requests.length !== 1) throw new Error(`Expected one history request, received ${requests.length}`);
  if (!first.clubs.length || loader.getSeasonData("1994-95") !== first) throw new Error("History cache is invalid");

  await loader.loadSeasonRange(["1994-95", "1995-96", "1996-97"], 2);
  if (requests.length !== 3) throw new Error(`Range loading made an unexpected number of requests: ${requests.length}`);
  if (!loader.hasSeasonData("1995-96") || !loader.hasSeasonData("1996-97")) throw new Error("Range cache is incomplete");

  let rejected = false;
  try {
    await loader.loadSeasonData("1992-93");
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error("Missing history file did not reject");
  const standingsRequestsBefore = requests.length;
  const [standings, cachedStandings] = await Promise.all([
    loader.loadHistoricalStandings(),
    loader.loadHistoricalStandings()
  ]);
  if (standings !== cachedStandings || !standings["2025-26"]?.eng?.length) {
    throw new Error("Historical standings cache is invalid");
  }
  if (requests.length !== standingsRequestsBefore + 1) {
    throw new Error("Historical standings request was not shared");
  }
  console.log("Initial current-season load: PASS");
  console.log("Lazy history request and cache: PASS");
  console.log("Bounded range loading: PASS");
  console.log("Missing season rejection: PASS");
  console.log("Lazy standings request and cache: PASS");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
