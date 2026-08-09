(() => {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const STORAGE_GAME = "g38-game-state-v4";
  const STORAGE_RUNS = "g38-runs-v2";
  const BIG_FIVE_IDS = new Set(["eng", "esp", "ita", "ger", "fra"]);
  const WING_POSITIONS = ["LM", "RM", "LW", "RW"];
  const MIDFIELD_CENTRE_POSITIONS = ["CM", "CDM", "CAM"];
  const EUROPE_COMPETITIONS = {
    UCL: { name: "欧洲冠军联赛", champion: "欧冠冠军", runnerUp: "欧冠亚军" },
    UEL: { name: "欧联杯", champion: "欧联杯冠军", runnerUp: "欧联杯亚军" },
    UECL: { name: "欧协联", champion: "欧协联冠军", runnerUp: "欧协联亚军" }
  };
  const PROMOTED_TEAMS = {
    eng: ["Sunderland", "Leeds United", "Burnley"],
    esp: ["Elche CF", "Levante UD", "Real Oviedo"],
    ita: ["Sassuolo", "Cremonese", "Pisa"],
    ger: ["1. FC Köln", "Hamburger SV", "FC St. Pauli"],
    fra: ["Paris FC", "FC Lorient", "FC Metz"]
  };

  const state = {
    selectedLeagues: new Set(["eng", "esp", "ita", "ger", "fra"]),
    game: null,
    viewingRun: null,
    selectedSlotIndex: null,
    pendingDraftPlayerId: null,
    autoSpinPending: false,
    wheelAngle: 0,
    spinning: false
  };

  const ui = {
    leagueGrid: $("#leagueGrid"),
    heroStats: $("#heroStats"),
    homeHistoryList: $("#homeHistoryList"),
    seasonRangeStart: $("#seasonRangeStart"),
    seasonRangeEnd: $("#seasonRangeEnd"),
    seasonRangeStartLabel: $("#seasonRangeStartLabel"),
    seasonRangeEndLabel: $("#seasonRangeEndLabel"),
    difficultySelect: $("#difficultySelect"),
    formationSelect: $("#formationSelect"),
    teamLibraryTitle: $("#teamLibraryTitle"),
    teamLibrary: $("#teamLibrary"),
    leagueChoice: $("#leagueChoice"),
    leagueChoiceOptions: $("#leagueChoiceOptions"),
    seasonPrediction: $("#seasonPrediction"),
    simulationPanel: $("#simulationPanel"),
    simulationProgress: $("#simulationProgress"),
    simulationCurrent: $("#simulationCurrent"),
    simulationLatest: $("#simulationLatest"),
    resultLineupPanel: $("#resultLineupPanel"),
    resultLineupTitle: $("#resultLineupTitle"),
    resultLineupRating: $("#resultLineupRating"),
    resultLineupField: $("#resultLineupField"),
    resultLineupInfo: $("#resultLineupInfo"),
    resultTablePanel: $("#resultTablePanel"),
    resultTableLeague: $("#resultTableLeague"),
    leagueTable: $("#leagueTable"),
    resultStarsPanel: $("#resultStarsPanel"),
    awardStats: $("#awardStats"),
    playerStats: $("#playerStats"),
    europePanel: $("#europePanel"),
    europeTitle: $("#europeTitle"),
    europeStatus: $("#europeStatus"),
    europeStartBtn: $("#europeStartBtn"),
    europeResults: $("#europeResults"),
    pitchField: $("#pitchField"),
    formationTitle: $("#formationTitle"),
    gameProgress: $("#gameProgress"),
    gameLeagueLabel: $("#gameLeagueLabel"),
    rerollChip: $("#rerollChip"),
    teamRating: $("#teamRating"),
    unitRatings: $("#unitRatings"),
    simulateBtn: $("#simulateBtn"),
    spinBtn: $("#spinBtn"),
    rerollBtn: $("#rerollBtn"),
    spinResult: $("#spinResult"),
    candidates: $("#candidates"),
    toast: $("#toast")
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const leagueTeamCount = (leagueId) => (leagueId === "ger" || leagueId === "fra" ? 18 : 20);
  const leagueMatchCount = (leagueId) => (leagueTeamCount(leagueId) - 1) * 2;
  const expectedPointsForRating = (rating, played) => {
    const base = played >= 38 ? 40 + (rating - 70) * 2.2 : 36 + (rating - 70) * 1.9;
    return clamp(Math.round(base), 18, Math.max(18, played * 3 - 8));
  };
  const rankFromPoints = (points, size) => {
    const topPoints = size >= 20 ? 85 : 80;
    const step = size >= 20 ? 4.2 : 4.5;
    return clamp(1 + Math.round((topPoints - points) / step), 1, size);
  };
  const getLeagueTeams = (game) => {
    const season = game?.seasonRange?.end || game?.season || "2025-26";
    const real = clubsForLeague(game?.league, season).map((club) => club.name);
    if (!real.length) return ["我的球队"];
    const rng = makeRng(hashSeed(`replace-${game?.id}-${game?.league}`));
    const promoted = (PROMOTED_TEAMS[game?.league] || []).filter((name) => real.includes(name));
    const replaceName = promoted.length
      ? promoted[Math.floor(rng() * promoted.length)]
      : real[Math.floor(rng() * real.length)];
    return real.map((name) => (name === replaceName ? "我的球队" : name));
  };

  const uid = () => {
    if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const getLeague = (id) => LEAGUES.find((l) => l.id === id);
  const getSeasonData = (season) => {
    if (!season || season === "2025-26") {
      return { source: "2025-26 五大联赛 23 人名单", clubs: Object.values(CLUBS) };
    }
    if (typeof SEASON_PLAYERS !== "undefined" && SEASON_PLAYERS[season]) return SEASON_PLAYERS[season];
    if (typeof LEGACY_SEASONS !== "undefined" && LEGACY_SEASONS[season]) return LEGACY_SEASONS[season];
    return { source: "2025-26 五大联赛 23 人名单", clubs: Object.values(CLUBS) };
  };
  const getClub = (id, season) => {
    const club = getSeasonData(season).clubs.find((c) => c.id === id);
    return club || CLUBS[id] || getSeasonData(season).clubs[0];
  };
  const clubsForLeague = (id, season) => getSeasonData(season).clubs.filter((c) => c.league === id);
  const allClubs = (season) => getSeasonData(season).clubs;

  const pruneData = () => {
    LEAGUES.splice(0, LEAGUES.length, ...LEAGUES.filter((league) => BIG_FIVE_IDS.has(league.id)));
    Object.keys(CLUBS).forEach((id) => {
      if (!BIG_FIVE_IDS.has(CLUBS[id].league)) delete CLUBS[id];
    });
  };

  const SEASON_KEYS = [];
  for (let start = 1992; start <= 2025; start += 1) {
    const end = start + 1;
    SEASON_KEYS.push(`${start}-${String(end % 100).padStart(2, "0")}`);
  }
  const seasonIndexToKey = (index) => SEASON_KEYS[clamp(index, 0, SEASON_KEYS.length - 1)];
  const seasonKeyToIndex = (key) => Math.max(0, SEASON_KEYS.indexOf(key));
  const randomSeasonInRange = (range) => {
    const start = range
      ? seasonKeyToIndex(range.start)
      : Number(ui.seasonRangeStart.value || 0);
    const end = range
      ? seasonKeyToIndex(range.end)
      : Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1);
    return seasonIndexToKey(start + Math.floor(Math.random() * (Math.max(0, end - start) + 1)));
  };
  const seasonRangeText = () => `${seasonIndexToKey(Number(ui.seasonRangeStart.value || 0))} 至 ${seasonIndexToKey(Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1))}`;

  const initSeasonRange = () => {
    const max = SEASON_KEYS.length - 1;
    ui.seasonRangeStart.min = "0";
    ui.seasonRangeStart.max = String(max);
    ui.seasonRangeStart.value = "0";
    ui.seasonRangeEnd.min = "0";
    ui.seasonRangeEnd.max = String(max);
    ui.seasonRangeEnd.value = String(max);
    updateSeasonRangeLabels();
  };

  const updateSeasonRangeLabels = () => {
    const start = Number(ui.seasonRangeStart.value || 0);
    const end = Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1);
    if (start > end) {
      ui.seasonRangeEnd.value = String(start);
    }
    ui.seasonRangeStartLabel.textContent = seasonIndexToKey(Math.min(start, Number(ui.seasonRangeEnd.value || end)));
    ui.seasonRangeEndLabel.textContent = seasonIndexToKey(Math.max(start, Number(ui.seasonRangeEnd.value || end)));
    renderHeroStats();
    renderTeamLibrary();
  };

  let memoryStore = {};
  let dbPromise = null;

  function openStorageDB() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('no indexedDB'));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('g38-storage', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  }

  function persistValue(key, value) {
    openStorageDB()
      .then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }))
      .catch(() => {
        try {
          localStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Ignore localStorage quota errors; IndexedDB is the primary store.
        }
      });
  }

  async function loadStorage() {
    try {
      const db = await openStorageDB();
      const tx = db.transaction('kv', 'readonly');
      const store = tx.objectStore('kv');
      const keysRequest = store.getAllKeys();
      const valuesRequest = store.getAll();
      const keys = await new Promise((resolve, reject) => {
        keysRequest.onsuccess = () => resolve(keysRequest.result || []);
        keysRequest.onerror = () => reject(keysRequest.error);
      });
      const values = await new Promise((resolve, reject) => {
        valuesRequest.onsuccess = () => resolve(valuesRequest.result || []);
        valuesRequest.onerror = () => reject(valuesRequest.error);
      });
      keys.forEach((key, index) => {
        if (index < values.length) memoryStore[key] = values[index];
      });
    } catch {
      // IndexedDB unavailable: fall back to old localStorage data below.
    }
    [STORAGE_GAME, STORAGE_RUNS].forEach((key) => {
      if (key in memoryStore) return;
      try {
        const value = localStorage.getItem(key);
        if (value) memoryStore[key] = JSON.parse(value);
      } catch {
        // Ignore missing or corrupt legacy entries.
      }
    });
  }

  const safeGet = (key) => (key in memoryStore ? memoryStore[key] : null);

  const safeSet = (key, value) => {
    memoryStore[key] = value;
    persistValue(key, value);
    return true;
  };

  function isSelfMatch(match) {
    if (!match) return false;
    if (match.opponent === "我的球队") return true;
    return String(match.home || "") === "我的球队" && String(match.away || "") === "我的球队";
  }

  function isBadRun(run) {
    const result = run?.result;
    if (!result || !Array.isArray(result.matches)) return false;
    return result.matches.some(isSelfMatch);
  }

  const toast = (message) => {
    ui.toast.textContent = message;
    ui.toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => ui.toast.classList.remove("show"), 2600);
  };

  async function init() {
    await loadStorage();
    pruneData();
    initSeasonRange();
    renderLeagueGrid();
    renderHeroStats();
    renderTeamLibrary();
    renderHomeHistory();
    bindEvents();
    loadSavedGame();
    if (state.game) renderGame();
    drawWheel(state.wheelAngle);
  }

  function bindEvents() {
    $("#startBtn").addEventListener("click", startGame);
    $("#newGameBtn").addEventListener("click", showNewGameSetup);
    $("#historyBtn").addEventListener("click", showHomeHistory);
    $("#backSetupBtn").addEventListener("click", () => showView("setup"));
    $("#backGameBtn").addEventListener("click", goBackFromResult);
    $("#toggleAllLeagues").addEventListener("click", toggleAllLeagues);
    $("#spinBtn").addEventListener("click", spinWheel);
    $("#rerollBtn").addEventListener("click", reroll);
    $("#simulateBtn").addEventListener("click", simulateSeason);
    $("#shareBtn").addEventListener("click", shareResult);
    $("#europeStartBtn").addEventListener("click", startEuropeanTournament);
    $("#formationSelect").addEventListener("change", () => {
      const inGameView = !document.querySelector("#gameView").classList.contains("hidden");
      if (state.game && state.game.draftedPlayers.length === 0 && inGameView) {
        rebuildGameSlots();
      }
    });
    ui.seasonRangeStart.addEventListener("input", updateSeasonRangeLabels);
    ui.seasonRangeEnd.addEventListener("input", updateSeasonRangeLabels);
    document.querySelector(".brand").addEventListener("click", (e) => {
      e.preventDefault();
      showView("setup");
      renderHomeHistory();
    });
  }

  function renderLeagueGrid() {
    ui.leagueGrid.innerHTML = "";
    LEAGUES.forEach((league) => {
      const button = el("button", "league-option", "");
      button.type = "button";
      button.dataset.league = league.id;
      const code = el("span", "league-code", league.code);
      code.style.background = league.color;
      const copy = el("span", "", "");
      copy.appendChild(el("strong", "", league.name));
      copy.appendChild(el("small", "", `${league.country} · ${clubsForLeague(league.id).length} 队`));
      const input = el("input", "", "");
      input.type = "checkbox";
      input.checked = state.selectedLeagues.has(league.id);
      button.append(input, code, copy);
      button.addEventListener("click", () => toggleLeague(league.id));
      ui.leagueGrid.appendChild(button);
    });
    syncLeagueButtons();
  }

  function toggleLeague(id) {
    if (state.selectedLeagues.has(id)) {
      state.selectedLeagues.delete(id);
    } else {
      state.selectedLeagues.add(id);
    }
    syncLeagueButtons();
    drawWheel(state.wheelAngle);
  }

  function toggleAllLeagues() {
    if (state.selectedLeagues.size === LEAGUES.length) {
      state.selectedLeagues.clear();
    } else {
      state.selectedLeagues = new Set(LEAGUES.map((l) => l.id));
    }
    syncLeagueButtons();
    drawWheel(state.wheelAngle);
  }

  function syncLeagueButtons() {
    document.querySelectorAll(".league-option").forEach((button) => {
      const id = button.dataset.league;
      button.classList.toggle("active", state.selectedLeagues.has(id));
      button.querySelector("input").checked = state.selectedLeagues.has(id);
    });
  }

  function renderHeroStats() {
    const bigFive = ["eng", "esp", "ita", "ger", "fra"];
    const season = seasonIndexToKey(Number(ui.seasonRangeEnd?.value || SEASON_KEYS.length - 1));
    const bigClubs = bigFive.flatMap((id) => clubsForLeague(id, season));
    const bigPlayers = new Set(bigClubs.flatMap((c) => c.players.map((p) => `${c.id}-${p.name}`)));
    const allPlayers = new Set(allClubs(season).flatMap((c) => c.players.map((p) => `${c.id}-${p.name}`)));
    ui.heroStats.innerHTML = "";
    [
      [5, "大联赛"],
      [bigClubs.length, "本季球队"],
      [bigPlayers.size, "本季球员"],
      [allPlayers.size, "可抽球员"]
    ].forEach(([value, label]) => {
      const item = el("div", "", "");
      item.appendChild(el("strong", "", String(value)));
      item.appendChild(el("span", "", label));
      ui.heroStats.appendChild(item);
    });
  }

  function renderTeamLibrary() {
    const season = seasonIndexToKey(Number(ui.seasonRangeEnd?.value || SEASON_KEYS.length - 1));
    const clubs = getSeasonData(season).clubs;
    ui.teamLibraryTitle.textContent = `${seasonRangeText()} · 可抽球队`;
    ui.teamLibrary.innerHTML = "";
    if (!clubs.length) {
      ui.teamLibrary.appendChild(el("p", "history-empty", "这个赛季暂时没有可抽球队。"));
      return;
    }
    BIG_FIVE_IDS.forEach((leagueId) => {
      const league = getLeague(leagueId);
      if (!league) return;
      const leagueClubs = clubs.filter((club) => club.league === leagueId);
      const block = el("section", "league-block", "");
      const head = el("div", "league-block-head", "");
      head.appendChild(el("span", "league-code", league.code));
      head.appendChild(el("strong", "", league.name));
      head.appendChild(el("span", "", `${leagueClubs.length} 队`));
      block.appendChild(head);
      const grid = el("div", "team-grid", "");
      leagueClubs.forEach((club) => {
        const card = el("div", "team-chip", "");
        card.appendChild(el("strong", "", club.name));
        card.appendChild(el("span", "", `${club.players?.length || 0} 名球员`));
        grid.appendChild(card);
      });
      block.appendChild(grid);
      ui.teamLibrary.appendChild(block);
    });
  }

  function renderHomeHistory() {
    const runs = loadRuns();
    ui.homeHistoryList.innerHTML = "";
    if (!runs.length) {
      ui.homeHistoryList.appendChild(el("div", "history-empty", "还没有赛季记录，先开始一场选秀吧。"));
      return;
    }
    runs.slice(0, 8).forEach((run) => {
      const card = el("button", "history-card", "");
      card.type = "button";
      card.appendChild(el("strong", "", run.formation));
      const res = run.result || {};
      card.appendChild(el("span", "record-line", `${res.wins ?? 0}-${res.draws ?? 0}-${res.losses ?? 0} · ${res.points ?? 0} 分`));
      card.appendChild(el("span", "", `第 ${res.finish ?? "-"} 名 · 评分 ${res.teamRating ?? "--"}`));
      card.appendChild(el("span", "", new Date(run.createdAt).toLocaleString("zh-CN")));
      card.addEventListener("click", () => viewRun(run));
      ui.homeHistoryList.appendChild(card);
    });
  }

  function showHomeHistory() {
    showView("setup");
    renderHomeHistory();
    setTimeout(() => {
      const panel = document.querySelector(".history-home");
      if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function showNewGameSetup() {
    showView("setup");
    renderHomeHistory();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function loadSavedGame() {
    const saved = safeGet(STORAGE_GAME);
    if (
      saved
      && saved.slots
      && saved.phase === "drafting"
      && getSeasonData(saved.season).clubs.length
    ) {
      if (!saved.seasonRange) {
        saved.seasonRange = { start: "1992-93", end: "2025-26" };
      }
      if (isBadRun(saved)) {
        saved.result = null;
        saved.simulation = null;
        safeSet(STORAGE_GAME, saved);
      }
      state.game = saved;
      state.selectedSlotIndex = null;
      state.pendingDraftPlayerId = null;
    }
  }

  function saveGame() {
    if (state.game) safeSet(STORAGE_GAME, state.game);
  }

  function startGame() {
    if (!state.selectedLeagues.size) {
      toast("请至少选择一个联赛。");
      return;
    }
    const formation = ui.formationSelect.value;
    const slots = FORMATIONS[formation].map((slot, index) => ({
      ...slot,
      id: `slot-${index}`,
      player: null
    }));
    state.game = {
      id: uid(),
      createdAt: Date.now(),
      leagues: [...state.selectedLeagues],
      seasonRange: {
        start: seasonIndexToKey(Number(ui.seasonRangeStart.value || 0)),
        end: seasonIndexToKey(Number(ui.seasonRangeEnd.value || SEASON_KEYS.length - 1))
      },
      season: randomSeasonInRange(),
      league: null,
      difficulty: ui.difficultySelect.value,
      formation,
      slots,
      draftedPlayers: [],
      currentSpin: null,
      candidates: [],
      rerolls: REROLL_BUDGET[ui.difficultySelect.value],
      selectedSlotIndex: null,
      phase: "drafting",
      result: null
    };
    state.selectedSlotIndex = null;
    state.pendingDraftPlayerId = null;
    state.autoSpinPending = false;
    state.viewingRun = null;
    saveGame();
    renderGame();
    toast("新选秀已开始，先转动转盘。");
  }

  function rebuildGameSlots() {
    if (!state.game) return;
    const formation = ui.formationSelect.value;
    state.game.formation = formation;
    state.game.slots = FORMATIONS[formation].map((slot, index) => ({
      ...slot,
      id: `slot-${index}`,
      player: null
    }));
    state.game.draftedPlayers = [];
    state.game.candidates = [];
    state.game.league = null;
    state.selectedSlotIndex = null;
    state.pendingDraftPlayerId = null;
    state.autoSpinPending = false;
    saveGame();
    renderGame();
  }

  function showView(name) {
    ["setupView", "gameView", "resultView"].forEach((id) => {
      document.getElementById(id).classList.toggle("hidden", id !== `${name}View`);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderGame() {
    const game = state.game;
    if (!game) return;
    ui.formationTitle.textContent = game.formation;
    ui.gameProgress.textContent = `${game.draftedPlayers.length}/${game.slots.length}`;
    const rangeText = game.seasonRange
      ? `${game.seasonRange.start} - ${game.seasonRange.end}`
      : game.season;
    ui.gameLeagueLabel.textContent = game.leagues.length === LEAGUES.length
      ? `五大联赛 · ${rangeText}`
      : `${game.leagues.map((id) => getLeague(id)?.name).filter(Boolean).join(" / ")} · ${rangeText}`;
    document.querySelector(".game-layout")?.classList.remove("hidden");
    ui.rerollChip.textContent = `重转 ${game.rerolls} 次`;
    ui.simulateBtn.disabled = game.draftedPlayers.length < 11;
    ui.simulateBtn.textContent = game.league
      ? `模拟 ${leagueMatchCount(game.league)} 场赛季`
      : "模拟赛季";
    ui.simulationPanel.classList.add("hidden");
    updateSpinControls();
    ui.leagueChoice.classList.toggle("hidden", game.draftedPlayers.length < game.slots.length);
    if (game.draftedPlayers.length >= game.slots.length) {
      renderLeagueChoice();
    }
    const hub = document.querySelector(".wheel-hub");
    if (hub && !game.currentSpin) hub.textContent = "SPIN";
    renderPitch();
    renderSpinResult();
    renderCandidates();
    renderTeamRating();
    showView("game");
  }

  function updateSpinControls() {
    const game = state.game;
    const locked = Boolean(
      game
      && game.currentSpin
      && !game.currentSpin.drafted
      && game.candidates.length
    );
    ui.spinBtn.disabled = locked || Boolean(state.spinning);
    ui.rerollBtn.disabled = game?.rerolls <= 0 || Boolean(state.spinning);
    if (state.autoSpinPending) {
      ui.spinBtn.disabled = true;
      ui.rerollBtn.disabled = true;
    }
  }

  function renderLeagueChoice() {
    const game = state.game;
    if (!game || !ui.leagueChoiceOptions) return;
    ui.leagueChoiceOptions.innerHTML = "";
    LEAGUES.forEach((league) => {
      const button = el("button", "league-choice-option", "");
      button.type = "button";
      if (game.league === league.id) button.classList.add("active");
      button.appendChild(el("span", "league-code", league.code));
      button.appendChild(el("strong", "", league.name));
      button.appendChild(el("small", "", league.country));
      button.addEventListener("click", () => {
        game.league = league.id;
        ui.simulateBtn.textContent = `模拟 ${leagueMatchCount(game.league)} 场赛季`;
        saveGame();
        renderLeagueChoice();
        toast(`已选择加入 ${league.name}`);
      });
      ui.leagueChoiceOptions.appendChild(button);
    });
    renderSeasonPrediction();
  }

  function renderSeasonPrediction() {
    const game = state.game;
    ui.seasonPrediction.innerHTML = "";
    if (!game?.league) return;
    const rating = calcTeamProfile(game).overall || 80;
    const matches = leagueMatchCount(game.league);
    const predictedPoints = expectedPointsForRating(rating, matches);
    const predictedRank = clamp(Math.round(1 + (matches * 3 * 0.88 - predictedPoints) / 6.5), 1, leagueTeamCount(game.league));
    const box = el("div", "prediction-card", "");
    box.appendChild(el("strong", "", `赛前预测：第 ${predictedRank} 名`));
    box.appendChild(el("span", "", `预计 ${matches} 场拿到 ${predictedPoints} 分`));
    ui.seasonPrediction.appendChild(box);
  }

  function renderPitch() {
    const game = state.game;
    ui.pitchField.innerHTML = "";
    const pending = game.candidates.find((p) => p.id === state.pendingDraftPlayerId) || null;
    const selectedSlot = state.selectedSlotIndex !== null ? game.slots[state.selectedSlotIndex] : null;
    const swapMode = Boolean(!pending && selectedSlot && selectedSlot.player);
    game.slots.forEach((slot, index) => {
      const button = el("button", "slot", "");
      button.type = "button";
      button.style.left = `${slot.x}%`;
      button.style.top = `${slot.y}%`;
      button.classList.toggle("empty", !slot.player);
      button.classList.toggle("selected", state.selectedSlotIndex === index);
      if (pending) {
        button.classList.toggle("compatible", !slot.player && canPlaySlot(pending, slot.pos));
        button.classList.toggle("incompatible", !slot.player && !canPlaySlot(pending, slot.pos));
      } else if (swapMode && index !== state.selectedSlotIndex) {
        const canSwap = canPlaySlot(selectedSlot.player, slot.pos)
          && canPlaySlot(slot.player, selectedSlot.pos);
        button.classList.toggle("swap-compatible", canSwap);
      }
      const pos = el("span", "slot-pos", POSITION_NAMES[slot.pos] || slot.pos);
      button.appendChild(pos);
      if (slot.player) {
        button.appendChild(el("span", "slot-name", slot.player.name));
        button.appendChild(el("span", "slot-rate", String(slot.player.rate)));
      } else if (pending && canPlaySlot(pending, slot.pos)) {
        button.appendChild(el("span", "slot-hint", "可放这里"));
      }
      button.addEventListener("click", () => selectSlot(index));
      ui.pitchField.appendChild(button);
    });
    renderUnitRatings();
  }

  function appendAbilityRating(parent, label, value) {
    const item = el("div", "unit-rating", "");
    const track = el("div", "rating-track", "");
    const fill = el("span", "", "");
    const numeric = Number(value);
    fill.style.width = `${Number.isFinite(numeric) ? clamp(numeric, 0, 100) : 0}%`;
    track.appendChild(fill);
    item.append(el("span", "", label), track, el("strong", "", String(value)));
    parent.appendChild(item);
  }

  function renderUnitRatings() {
    const game = state.game;
    if (!game || !ui.unitRatings) return;
    const groups = { ATT: [], MID: [], DEF: [] };
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const unit = positionUnit(slot.pos);
      if (unit === "GK") return;
      if (groups[unit]) groups[unit].push(Number(slot.player.rate || 0));
    });
    const avg = (values) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : "--";
    ui.unitRatings.innerHTML = "";
    [
      ["进攻", avg(groups.ATT)],
      ["中场", avg(groups.MID)],
      ["防守", avg(groups.DEF)]
    ].forEach(([label, value]) => appendAbilityRating(ui.unitRatings, label, value));
  }

  function renderResultLineup(run) {
    if (!run?.slots?.length) {
      ui.resultLineupPanel.classList.add("hidden");
      return;
    }
    ui.resultLineupPanel.classList.remove("hidden");
    const profile = calcTeamProfile(run);
    const teamRating = run.result?.teamRating || calcTeamRating(run) || profile.overall || "--";
    ui.resultLineupTitle.textContent = `${run.formation || "赛季"}阵容`;
    ui.resultLineupRating.textContent = String(teamRating);
    ui.resultLineupField.innerHTML = "";
    run.slots.forEach((slot) => {
      const node = el("div", "slot result-slot", "");
      node.style.left = `${slot.x}%`;
      node.style.top = `${slot.y}%`;
      node.appendChild(el("span", "slot-pos", POSITION_NAMES[slot.pos] || slot.pos));
      if (slot.player) {
        node.appendChild(el("span", "slot-name", slot.player.name));
        node.appendChild(el("span", "slot-rate", String(slot.player.rate)));
      } else {
        node.appendChild(el("span", "slot-name", "待定"));
      }
      ui.resultLineupField.appendChild(node);
    });
    ui.resultLineupInfo.innerHTML = "";
    const head = el("div", "lineup-info-head", "");
    head.appendChild(el("strong", "", run.formation || "赛季阵容"));
    head.appendChild(el("span", "", `总评 ${teamRating}`));
    ui.resultLineupInfo.appendChild(head);
    const bars = el("div", "lineup-info-bars", "");
    [
      ["进攻", profile.attack],
      ["中场", profile.midfield],
      ["防守", profile.defense],
      ["门将", profile.goalkeeper]
    ].forEach(([label, value]) => appendAbilityRating(bars, label, value));
    ui.resultLineupInfo.appendChild(bars);
    const playerStats = Array.isArray(run.result?.playerStats) ? run.result.playerStats : [];
    if (playerStats.length) {
      const teamBest = playerStats[0];
      const goldenBoot = [...playerStats].sort((a, b) => b.goals - a.goals)[0];
      const mostAssists = [...playerStats].sort((a, b) => b.assists - a.assists)[0];
      const awards = el("div", "lineup-awards", "");
      [
        ["最佳球员", teamBest ? `${teamBest.name} · ${teamBest.goals}球 ${teamBest.assists}助` : "--"],
        ["金靴", goldenBoot ? `${goldenBoot.name} · ${goldenBoot.goals}球` : "--"],
        ["最多助攻", mostAssists ? `${mostAssists.name} · ${mostAssists.assists}助` : "--"]
      ].forEach(([label, value]) => {
        const item = el("div", "lineup-award", "");
        item.appendChild(el("span", "", label));
        item.appendChild(el("strong", "", value));
        awards.appendChild(item);
      });
      ui.resultLineupInfo.appendChild(awards);
      const statsHead = el("div", "lineup-stats-head", "");
      statsHead.appendChild(el("strong", "", "球员赛季数据"));
      ui.resultLineupInfo.appendChild(statsHead);
      const statsList = el("div", "lineup-player-stats", "");
      playerStats.slice(0, run.slots.length).forEach((stat) => {
        const row = el("div", "lineup-player-stat", "");
        row.appendChild(el("strong", "", stat.name));
        row.appendChild(el("span", "", `${stat.apps ?? 0}场`));
        row.appendChild(el("span", "", `${stat.goals ?? 0}球`));
        row.appendChild(el("span", "", `${stat.assists ?? 0}助`));
        statsList.appendChild(row);
      });
      ui.resultLineupInfo.appendChild(statsList);
    }
  }

  function selectSlot(index) {
    const game = state.game;
    if (!game) return;
    const slot = game.slots[index];
    const pendingId = state.pendingDraftPlayerId;
    const pending = pendingId ? game.candidates.find((p) => p.id === pendingId) : null;

    if (pending) {
      if (slot.player) {
        toast("这个位置已经有球员，请先选择空位。");
        return;
      }
      if (!canPlaySlot(pending, slot.pos)) {
        toast(`${pending.name} 不能踢 ${POSITION_NAMES[slot.pos]}。`);
        return;
      }
      draftPlayerToSlot(pending, index);
      return;
    }

    if (!slot.player) {
      state.selectedSlotIndex = state.selectedSlotIndex === index ? null : index;
      renderPitch();
      return;
    }

    if (state.selectedSlotIndex !== null && state.selectedSlotIndex !== index) {
      trySwapSlots(state.selectedSlotIndex, index);
      return;
    }

    state.selectedSlotIndex = state.selectedSlotIndex === index ? null : index;
    renderPitch();
  }

  function canPlaySlot(player, slotPos) {
    if (!player || !Array.isArray(player.pos)) return false;
    if (player.pos.includes(slotPos)) return true;
    if ((slotPos === "LM" || slotPos === "LW") && player.pos.some((pos) => pos === "LM" || pos === "LW")) return true;
    if ((slotPos === "RM" || slotPos === "RW") && player.pos.some((pos) => pos === "RM" || pos === "RW")) return true;
    if (slotPos === "CM" && player.pos.some((pos) => MIDFIELD_CENTRE_POSITIONS.includes(pos))) return true;
    if (player.pos.includes("CM") && (slotPos === "CDM" || slotPos === "CAM")) return true;
    return false;
  }

  function trySwapSlots(firstIndex, secondIndex) {
    const game = state.game;
    const first = game.slots[firstIndex];
    const second = game.slots[secondIndex];
    if (!first.player || !second.player) return;
    if (!canPlaySlot(first.player, second.pos) || !canPlaySlot(second.player, first.pos)) {
      toast("换位失败：两名球员都必须能踢对方的新位置。");
      state.selectedSlotIndex = null;
      renderPitch();
      return;
    }
    const firstPlayer = { ...first.player };
    const secondPlayer = { ...second.player };
    first.player = secondPlayer;
    second.player = firstPlayer;
    first.player.rate = clamp(Number(first.player.baseRate || first.player.rate) + fitBonus(first.pos, first.player.pos), 40, 99);
    second.player.rate = clamp(Number(second.player.baseRate || second.player.rate) + fitBonus(second.pos, second.player.pos), 40, 99);
    state.selectedSlotIndex = null;
    saveGame();
    renderPitch();
    renderTeamRating();
    toast("换位成功。");
  }

  function draftPlayerToSlot(candidate, index) {
    const game = state.game;
    const slot = game.slots[index];
    if (slot.player) {
      toast("这个位置已经有球员，请先选择空位。");
      return;
    }
    const baseRate = Number(candidate.baseRate || candidate.rate);
    const drafted = {
      ...candidate,
      baseRate,
      rate: clamp(baseRate + fitBonus(slot.pos, candidate.pos), 40, 99)
    };
    slot.player = drafted;
    game.draftedPlayers.push(drafted);
    game.candidates = [];
    if (game.currentSpin) game.currentSpin.drafted = true;
    state.pendingDraftPlayerId = null;
    state.selectedSlotIndex = null;
    saveGame();
    renderPitch();
    renderCandidates();
    renderTeamRating();
    updateSpinControls();
    ui.gameProgress.textContent = `${game.draftedPlayers.length}/${game.slots.length}`;
    if (game.draftedPlayers.length === game.slots.length) {
      ui.simulateBtn.disabled = false;
      ui.leagueChoice.classList.remove("hidden");
      renderLeagueChoice();
      toast("阵容完成，请选择参赛联赛。");
      document.querySelector("#leagueChoice")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      state.autoSpinPending = true;
      updateSpinControls();
      setTimeout(() => {
        state.autoSpinPending = false;
        if (
          state.game
          && state.game.draftedPlayers.length < state.game.slots.length
          && !state.spinning
        ) {
          spinWheel();
        }
      }, 500);
    }
  }

  function renderSpinResult() {
    const game = state.game;
    ui.spinResult.innerHTML = "";
    if (!game.currentSpin) {
      ui.spinResult.appendChild(el("p", "", "转动转盘，抽取一支俱乐部。"));
      return;
    }
    const league = getLeague(game.currentSpin.leagueId);
    const club = getClub(game.currentSpin.clubId, game.currentSpin.season);
    if (!league || !club) {
      ui.spinResult.appendChild(el("p", "history-empty", "没有抽到球队，请重新转动转盘。"));
      return;
    }
    const box = el("div", "result-club", "");
    const copy = el("div", "", "");
    copy.appendChild(el("div", "result-league", `${league.name} · ${league.country}`));
    copy.appendChild(el("strong", "", club.name));
    copy.appendChild(el("span", "", `${club.stadium ? `${club.stadium} · ` : ""}${game.currentSpin.season}`));
    const badge = el("span", "league-code", club.short.slice(0, 3));
    badge.style.background = club.colors?.[0] || league.color || "#0f766e";
    box.append(copy, badge);
    ui.spinResult.appendChild(box);
    const hub = document.querySelector(".wheel-hub");
    if (hub) hub.textContent = club.short.slice(0, 3).toUpperCase();
  }

  function renderCandidates() {
    const game = state.game;
    ui.candidates.innerHTML = "";
    if (!game.currentSpin) {
      ui.candidates.appendChild(el("p", "history-empty", "先转动转盘，再从这家俱乐部挑选球员。"));
      return;
    }
    if (!game.candidates.length) {
      ui.candidates.appendChild(el(
        "p",
        "history-empty",
        state.spinning
          ? "正在抽取球队..."
          : state.autoSpinPending || game.currentSpin?.drafted
          ? "已选择球员，正在抽取下一队..."
          : "这家俱乐部的候选球员已经被选完了。"
      ));
      return;
    }
    const canPlace = (candidate) => game.slots.some((slot) => !slot.player && canPlaySlot(candidate, slot.pos));
    const ordered = [
      ...game.candidates.filter((candidate) => canPlace(candidate)).sort((a, b) => b.rate - a.rate),
      ...game.candidates.filter((candidate) => !canPlace(candidate)).sort((a, b) => b.rate - a.rate)
    ];
    ordered.forEach((candidate) => {
      const button = el("button", "candidate", "");
      button.type = "button";
      button.classList.toggle("used", isDrafted(candidate.id));
      button.classList.toggle("pending", candidate.id === state.pendingDraftPlayerId);
      button.classList.toggle("unavailable", !canPlace(candidate));
      button.appendChild(el("strong", "", candidate.name));
      button.appendChild(el("small", "", `${candidate.nat} · ${candidate.pos.map((p) => POSITION_NAMES[p]).join("/")}`));
      button.appendChild(el("span", "rate", String(candidate.rate)));
      button.addEventListener("click", () => {
        if (isDrafted(candidate.id)) {
          toast("这名球员已经被选中。");
          return;
        }
        if (!canPlace(candidate)) {
          toast("这名球员没有可放的空位。");
          return;
        }
        state.pendingDraftPlayerId = candidate.id;
        state.selectedSlotIndex = null;
        renderPitch();
        renderCandidates();
        toast(`已选中 ${candidate.name}，点击球场上可踢的空位。`);
        document.querySelector(".pitch-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      ui.candidates.appendChild(button);
    });
  }

  function isDrafted(playerId) {
    return (state.game?.draftedPlayers || []).some((p) => p.id === playerId);
  }

  function spinWheel() {
    const game = state.game;
    if (!game) {
      toast("请先开始一场选秀。");
      return;
    }
    if (state.spinning) return;
    if (!state.selectedLeagues.size) {
      toast("请至少选择一个联赛。");
      return;
    }
    if (state.spinning) return;
    state.pendingDraftPlayerId = null;
    state.selectedSlotIndex = null;
    const leagueIds = game.leagues.length ? game.leagues : [...state.selectedLeagues];
    const leagueId = leagueIds[Math.floor(Math.random() * leagueIds.length)];
    const season = randomSeasonInRange(game.seasonRange);
    game.season = season;
    const pool = clubsForLeague(leagueId, season);
    if (!pool.length) {
      toast("这个赛季没有可抽球队，请换一个赛季。");
      return;
    }
    const club = pool[Math.floor(Math.random() * pool.length)];
    const items = leagueIds.map((id) => getLeague(id));
    const index = leagueIds.indexOf(leagueId);
    game.currentSpin = {
      leagueId,
      clubId: club.id,
      season,
      drafted: false
    };
    game.candidates = [];
    saveGame();
    renderSpinResult();
    renderCandidates();
    updateSpinControls();
    toast(`抽中 ${club.name}`);
    ui.spinResult.scrollIntoView({ behavior: "smooth", block: "center" });
    animateWheel(index, items, () => {
      game.candidates = buildCandidates(club, game);
      saveGame();
      renderCandidates();
      updateSpinControls();
      if (state.autoSpinPending) {
        state.autoSpinPending = false;
        spinWheel();
      }
    });
  }

  function animateWheel(targetIndex, items, done) {
    state.spinning = true;
    ui.spinBtn.disabled = true;
    const step = (Math.PI * 2) / items.length;
    const desired = (((-(targetIndex + 0.5) * step) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const current = ((state.wheelAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    let delta = desired - current;
    if (delta <= 0) delta += Math.PI * 2;
    const target = state.wheelAngle + Math.PI * 10 + delta;
    const start = state.wheelAngle;
    const duration = 2200;
    const startTime = performance.now();

    const frame = (now) => {
      const t = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      state.wheelAngle = start + (target - start) * eased;
      drawWheel(state.wheelAngle);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        state.spinning = false;
        ui.spinBtn.disabled = false;
        done();
        updateSpinControls();
      }
    };
    requestAnimationFrame(frame);
  }

  function buildCandidates(club, game) {
    const spinSeason = game.currentSpin?.season || game.season || "2025-26";
    const pool = getClub(club.id, spinSeason)?.players || club.players || [];
    return pool
      .map((player) => ({
        ...player,
        id: `${spinSeason}|${club.id}|${player.name}`,
        rate: clamp(calibrateRate(Number(player.rate || 80), spinSeason) + Math.floor(Math.random() * 3) - 1, 40, 99)
      }))
      .filter((player) => !isDrafted(player.id))
      .sort((a, b) => b.rate - a.rate);
  }

  function calibrateRate(rate, season) {
    if (season === "2025-26") {
      if (rate >= 88) return rate - 1;
      if (rate >= 82) return rate - 2;
      if (rate >= 76) return rate - 3;
      return rate - 2;
    }
    if (typeof LEGACY_SEASONS !== "undefined" && LEGACY_SEASONS[season]) {
      return rate + 2;
    }
    return rate;
  }

  function reroll() {
    const game = state.game;
    if (!game || game.rerolls <= 0) {
      toast("没有可用重转次数。");
      return;
    }
    game.rerolls -= 1;
    ui.rerollChip.textContent = `重转 ${game.rerolls} 次`;
    ui.rerollBtn.disabled = true;
    saveGame();
    spinWheel();
  }

  function draftPlayer(playerId) {
    const game = state.game;
    const candidate = game.candidates.find((p) => p.id === playerId);
    if (!candidate || isDrafted(playerId)) {
      toast("这名球员已经不能被选中。");
      return;
    }
    const compatible = game.slots.some((slot) => !slot.player && canPlaySlot(candidate, slot.pos));
    if (!compatible) {
      toast("这名球员没有可踢的空位，请先腾出兼容位置。");
      return;
    }
    state.pendingDraftPlayerId = candidate.id;
    state.selectedSlotIndex = null;
    renderPitch();
    renderCandidates();
  }

  function fitBonus(slotPos, playerPositions) {
    if (canPlaySlot({ pos: playerPositions }, slotPos)) return 0;
    const unit = (p) => {
      if (p === "GK") return "gk";
      if (["RB", "CB", "LB", "RWB", "LWB"].includes(p)) return "def";
      if (["CDM", "CM", "CAM", "RM", "LM"].includes(p)) return "mid";
      return "att";
    };
    return unit(slotPos) === unit(playerPositions[0]) ? -1 : -4;
  }

  function renderTeamRating() {
    const rating = calcTeamRating(state.game);
    ui.teamRating.textContent = rating ? String(rating) : "--";
  }

  function calcTeamRating(game) {
    if (!game) return null;
    const weights = { GK: 1, DEF: 1.2, MID: 1.1, ATT: 1.15 };
    let sum = 0;
    let total = 0;
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const unit = positionUnit(slot.pos);
      const weight = weights[unit] || 1;
      sum += slot.player.rate * weight;
      total += weight;
    });
    return total ? Math.round(sum / total) : null;
  }

  function calcTeamProfile(game) {
    if (!game) return { attack: 80, midfield: 80, defense: 80, goalkeeper: 80, overall: 80 };
    const units = { ATT: [], MID: [], DEF: [], GK: [] };
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      units[positionUnit(slot.pos)].push(Number(slot.player.rate || 0));
    });
    const avg = (list) => list.length ? Math.round(list.reduce((sum, value) => sum + value, 0) / list.length) : 80;
    const attCount = units.ATT.length;
    const midCount = units.MID.length;
    const attack = avg([...units.ATT, ...units.MID]) + (attCount - 3) * 1.6;
    const midfield = avg([...units.MID, ...units.ATT.slice(0, 1)]) + (midCount - 3) * 0.8;
    const defense = avg(units.DEF) + (units.DEF.length - 4) * 1.2;
    const goalkeeper = avg(units.GK);
    return {
      attack: clamp(Math.round(attack), 40, 99),
      midfield: clamp(Math.round(midfield), 40, 99),
      defense: clamp(Math.round(defense), 40, 99),
      goalkeeper: clamp(Math.round(goalkeeper), 40, 99),
      overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 99)
    };
  }

  function positionUnit(pos) {
    if (pos === "GK") return "GK";
    if (["RB", "CB", "LB", "RWB", "LWB"].includes(pos)) return "DEF";
    if (["CDM", "CM", "CAM", "RM", "LM"].includes(pos)) return "MID";
    return "ATT";
  }

  function teamStrength(profile) {
    const phases = [
      profile.attack || 78,
      profile.midfield || 78,
      profile.defense || 78,
      profile.goalkeeper || profile.defense || 78
    ];
    const mean = phases.reduce((sum, value) => sum + value, 0) / phases.length;
    const min = Math.min(...phases);
    const blended = mean * 0.82 + min * 0.18;
    const anchored = Math.max(blended, (profile.overall || mean) * 0.92);
    return clamp(anchored, 40, 99);
  }

  function createLeagueSchedule(names) {
    const order = names.slice();
    const matches = [];
    const size = order.length;
    for (let half = 0; half < 2; half += 1) {
      for (let round = 0; round < size - 1; round += 1) {
        for (let index = 0; index < size / 2; index += 1) {
          let home = order[index];
          let away = order[size - 1 - index];
          if (half === 1) {
            const swap = home;
            home = away;
            away = swap;
          }
          if (!home || !away || home === away) continue;
          matches.push({ home, away });
        }
        const last = order.pop();
        order.splice(1, 0, last);
      }
    }
    return matches;
  }

  function createLeagueTable(names) {
    const table = {};
    names.forEach((name) => {
      table[name] = {
        name,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
        isUser: name === "我的球队"
      };
    });
    return table;
  }

  function buildProfileMap(game, names) {
    const season = game.seasonRange?.end || game.season || "2025-26";
    const map = {};
    names.forEach((name) => {
      if (name === "我的球队") {
        const userProfile = calcTeamProfile(game);
        map[name] = {
          ...userProfile,
          attack: clamp(userProfile.attack + 3, 40, 99),
          midfield: clamp(userProfile.midfield + 2, 40, 99),
          defense: clamp(userProfile.defense + 2, 40, 99),
          goalkeeper: clamp(userProfile.goalkeeper + 2, 40, 99),
          overall: clamp(userProfile.overall + 3, 40, 99)
        };
        return;
      }
      const club = clubsForLeague(game.league, season).find((item) => item.name === name);
      map[name] = club
        ? calcClubProfile(club)
        : { attack: 78, midfield: 78, defense: 78, goalkeeper: 78, overall: 78 };
    });
    return map;
  }

  function eloExpected(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  function createEloMap(profileMap) {
    const map = {};
    Object.entries(profileMap).forEach(([name, profile]) => {
      map[name] = 1000 + Math.round((teamStrength(profile) - 75) * 25);
    });
    return map;
  }
  function simulateLeagueResult(homeProfile, awayProfile, rng, homeName, eloHome, eloAway) {
    const hasElo = Number.isFinite(eloHome) && Number.isFinite(eloAway);
    const homeStrength = teamStrength(homeProfile);
    const awayStrength = teamStrength(awayProfile);
    const baseDiff = homeStrength - awayStrength + 1;
    const strengthExpected = clamp(1 / (1 + Math.pow(10, -baseDiff / 8)), 0.06, 0.88);
    const expectedHome = hasElo
      ? clamp(eloExpected(eloHome, eloAway) * 0.7 + strengthExpected * 0.3, 0.06, 0.94)
      : strengthExpected;
    const diff = hasElo ? eloHome - eloAway : baseDiff;
    const winChance = clamp(expectedHome, 0.06, 0.88);
    const drawChance = clamp(0.3 - Math.abs(diff) * 0.008, 0.15, 0.34);
    const roll = rng();
    const result = roll < winChance ? "H" : roll < winChance + drawChance ? "D" : "A";
    const expectedFor = clamp(
      0.85
        + (homeProfile.attack - awayProfile.defense) * 0.055
        + (homeProfile.midfield - awayProfile.midfield) * 0.02,
      0.4,
      2.8
    );
    const expectedAgainst = clamp(
      0.8
        + (awayProfile.attack - homeProfile.defense) * 0.05
        + (awayProfile.midfield - homeProfile.midfield) * 0.02
        - (homeProfile.goalkeeper - 80) * 0.018,
      0.35,
      2.6
    );
    let gf = clamp(poisson(expectedFor, rng), 0, 7);
    let ga = clamp(poisson(expectedAgainst, rng), 0, 7);
    if (result === "D") {
      const avg = Math.round((gf + ga) / 2);
      gf = avg;
      ga = avg;
    } else if (result === "H" && gf <= ga) {
      gf = ga + 1;
    } else if (result === "A" && ga <= gf) {
      ga = gf + 1;
    }
    let newEloHome = eloHome;
    let newEloAway = eloAway;
    if (hasElo) {
      const actualHome = result === "H" ? 1 : result === "D" ? 0.5 : 0;
      const k = 18;
      newEloHome = eloHome + k * (actualHome - expectedHome);
      newEloAway = eloAway + k * ((1 - actualHome) - (1 - expectedHome));
    }
    return { homeName, gf, ga, result, newEloHome, newEloAway };
  }

  function applyLeagueResult(table, homeName, awayName, gf, ga) {
    const home = table[homeName];
    const away = table[awayName];
    if (!home || !away) return;
    home.played += 1;
    away.played += 1;
    home.goalsFor += gf;
    home.goalsAgainst += ga;
    away.goalsFor += ga;
    away.goalsAgainst += gf;
    if (gf > ga) {
      home.wins += 1;
      home.points += 3;
      away.losses += 1;
    } else if (gf === ga) {
      home.draws += 1;
      away.draws += 1;
      home.points += 1;
      away.points += 1;
    } else {
      home.losses += 1;
      away.wins += 1;
      away.points += 3;
    }
    home.goalDiff = home.goalsFor - home.goalsAgainst;
    away.goalDiff = away.goalsFor - away.goalsAgainst;
  }

  function simulateAIMatches(schedule, profileMap, rng, table, eloMap) {
    schedule.forEach((match) => {
      if (match.home === "我的球队" || match.away === "我的球队") return;
      const result = simulateLeagueResult(
        profileMap[match.home],
        profileMap[match.away],
        rng,
        match.home,
        eloMap[match.home],
        eloMap[match.away]
      );
      eloMap[match.home] = result.newEloHome;
      eloMap[match.away] = result.newEloAway;
      applyLeagueResult(table, match.home, match.away, result.gf, result.ga);
    });
  }

  function simulateSeason() {
    const game = state.game;
    if (!game || game.draftedPlayers.length < 11) {
      toast("先填满 11 个位置。");
      return;
    }
    if (game.simulation) {
      toast("模拟正在进行中。");
      return;
    }
    if (!game.league) {
      renderLeagueChoice();
      toast("先选择你要加入的联赛。");
      document.querySelector("#leagueChoice")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const teamRating = calcTeamRating(game);
    const profile = calcTeamProfile(game);
    const teamNames = [...new Set(getLeagueTeams(game))];
    const profileMap = buildProfileMap(game, teamNames);
    const schedule = createLeagueSchedule(teamNames);
    const table = createLeagueTable(teamNames);
    const eloMap = createEloMap(profileMap);
    const seed = hashSeed(`${game.id}|${game.slots.map((s) => s.player.id).join(",")}`);
    const rng = makeRng(seed);
    simulateAIMatches(schedule, profileMap, rng, table, eloMap);
    const userMatches = schedule.filter((match) => match.home === "我的球队" || match.away === "我的球队");
    if (userMatches.some((match) => match.home === match.away)) {
      toast("赛程生成异常，请刷新后重新开始模拟。");
      return;
    }
    const simulation = {
      game,
      teamRating,
      profile,
      profileMap,
      eloMap,
      schedule,
      table,
      userMatches,
      rng,
      matchCount: userMatches.length,
      index: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      matches: [],
      scorers: new Map(),
      playerStats: new Map()
    };
    game.simulation = simulation;
    ui.leagueChoice.classList.add("hidden");
    document.querySelector(".game-layout")?.classList.add("hidden");
    ui.simulationPanel.classList.remove("hidden");
    ui.simulateBtn.disabled = true;
    renderSimulationStep(simulation);
    simulateNextMatch(simulation);
  }

  function simulateNextMatch(sim) {
    if (sim.index >= sim.matchCount) {
      finishSimulation(sim);
      return;
    }
    const game = sim.game;
    const match = simulateOneMatch(sim);
    const fixture = sim.userMatches[sim.index - 1];
    if (fixture) applyLeagueResult(sim.table, fixture.home, fixture.away, match.homeGoals, match.awayGoals);
    sim.matches.push(match);
    sim.wins += match.result === "W" ? 1 : 0;
    sim.draws += match.result === "D" ? 1 : 0;
    sim.losses += match.result === "L" ? 1 : 0;
    sim.goalsFor += match.gf;
    sim.goalsAgainst += match.ga;
    (match.scorerStats || match.scorers || []).forEach((scorer) => {
      if (!scorer || typeof scorer === "string") return;
      const stat = sim.playerStats.get(scorer.id) || { id: scorer.id, name: scorer.name, apps: 0, goals: 0, assists: 0 };
      stat.goals += 1;
      sim.playerStats.set(scorer.id, stat);
      sim.scorers.set(scorer.name, (sim.scorers.get(scorer.name) || 0) + 1);
    });
    (match.assists || []).forEach((assist) => {
      if (!assist) return;
      const stat = sim.playerStats.get(assist.id) || { id: assist.id, name: assist.name, apps: 0, goals: 0, assists: 0 };
      stat.assists += 1;
      sim.playerStats.set(assist.id, stat);
    });
    game.slots.forEach((slot) => {
      if (!slot.player) return;
      const stat = sim.playerStats.get(slot.player.id) || { id: slot.player.id, name: slot.player.name, apps: 0, goals: 0, assists: 0 };
      stat.apps += 1;
      sim.playerStats.set(slot.player.id, stat);
    });
    renderSimulationStep(sim);
    setTimeout(() => simulateNextMatch(sim), 600);
  }

  function simulateOneMatch(sim) {
    const index = sim.index;
    const fixture = sim.userMatches[index];
    const homeIsUser = fixture.home === "我的球队";
    const opponentName = homeIsUser ? fixture.away : fixture.home;
    const userProfile = sim.profileMap["我的球队"] || sim.profile;
    const opponentProfile = sim.profileMap[opponentName] || { attack: 78, midfield: 78, defense: 78, goalkeeper: 78, overall: 78 };
    const raw = simulateLeagueResult(
      homeIsUser ? userProfile : opponentProfile,
      homeIsUser ? opponentProfile : userProfile,
      sim.rng,
      fixture.home,
      sim.eloMap[fixture.home],
      sim.eloMap[fixture.away]
    );
    sim.eloMap[fixture.home] = raw.newEloHome;
    sim.eloMap[fixture.away] = raw.newEloAway;
    const gf = homeIsUser ? raw.gf : raw.ga;
    const ga = homeIsUser ? raw.ga : raw.gf;
    const result = homeIsUser
      ? (raw.result === "H" ? "W" : raw.result === "D" ? "D" : "L")
      : (raw.result === "H" ? "L" : raw.result === "D" ? "D" : "W");
    const scorerStats = assignScorers(gf, sim.game.slots, sim.rng);
    const assistStats = assignAssists(
      gf,
      sim.game.slots,
      sim.rng,
      scorerStats.map((scorer) => scorer.id)
    );
    sim.index += 1;
    return {
      round: index + 1,
      opponent: opponentName,
      opponentStrength: teamStrength(opponentProfile),
      home: homeIsUser,
      homeGoals: raw.gf,
      awayGoals: raw.ga,
      gf,
      ga,
      result,
      scorers: scorerStats.map((scorer) => scorer.name),
      scorerStats,
      assists: assistStats.map((assist) => assist ? { id: assist.id, name: assist.name } : null)
    };
  }

  function renderSimulationStep(sim) {
    ui.simulationProgress.textContent = `${sim.matches.length}/${sim.matchCount}`;
    ui.simulationCurrent.innerHTML = "";
    if (sim.matches.length) {
      const match = sim.matches[sim.matches.length - 1];
      const box = el("div", "sim-match-current", "");
      box.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      box.appendChild(el("span", "match-round", `R${match.round}`));
      box.appendChild(el("strong", "", `${match.home ? "主队" : "客队"} vs ${match.opponent}`));
      box.appendChild(el("span", "match-score", `${match.gf}-${match.ga}`));
      box.appendChild(el("small", "", match.scorers.length ? `进球：${match.scorers.join("、")}` : "无进球"));
      ui.simulationCurrent.appendChild(box);
    }
    ui.simulationLatest.innerHTML = "";
    sim.matches.slice(-8).reverse().forEach((match) => {
      const row = el("div", "sim-match-row", "");
      row.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      row.appendChild(el("span", "match-round", `R${match.round}`));
      row.appendChild(el("span", "", `${match.home ? "主" : "客"} ${match.gf}-${match.ga} ${match.opponent}`));
      ui.simulationLatest.appendChild(row);
    });
  }

  function finishSimulation(sim) {
    const game = sim.game;
    const points = sim.wins * 3 + sim.draws;
    const maxFinish = leagueTeamCount(game.league);
    let finish = rankFromPoints(points, maxFinish);
    const topScorer = [...sim.scorers.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const playerStats = buildPlayerStats(sim);
    const leagueTable = buildLeagueTable(game, {
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish
    }, sim);
    finish = leagueTable.find((row) => row.isUser)?.position || finish;
    const europeQualification = getEuropeanQualification(game, finish);
    const achievements = collectAchievements({
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish,
      teamRating: sim.teamRating
    });
    game.result = {
      matches: sim.matches,
      wins: sim.wins,
      draws: sim.draws,
      losses: sim.losses,
      goalsFor: sim.goalsFor,
      goalsAgainst: sim.goalsAgainst,
      points,
      finish,
      teamRating: sim.teamRating,
      seed: hashSeed(`${game.id}|${game.slots.map((s) => s.player.id).join(",")}`),
      topScorer,
      achievements,
      playerStats,
      leagueTable,
      europeQualification
    };
    game.phase = "complete";
    game.simulation = null;
    saveGame();
    addRun(game);
    renderHomeHistory();
    renderResult(game);
  }

  function buildPlayerStats(sim) {
    const rateById = new Map();
    sim.game.slots.forEach((slot) => {
      if (slot.player) rateById.set(slot.player.id, slot.player.rate || 0);
    });
    return [...sim.playerStats.values()]
      .map((stat) => ({
        ...stat,
        rate: rateById.get(stat.id) || 0,
        score: stat.goals * 5 + stat.assists * 2 + stat.apps * 0.12 + (rateById.get(stat.id) || 0) / 10
      }))
      .sort((a, b) => b.score - a.score);
  }

  function buildLeagueTable(game, summary, sim) {
    if (sim?.table) {
      return Object.values(sim.table)
        .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor)
        .map((row, index) => ({ ...row, position: index + 1 }));
    }
    const size = leagueTeamCount(game.league);
    const played = (size - 1) * 2;
    const rng = makeRng(hashSeed(`table-${game.id}`));
    const pool = getLeagueTeams(game).filter((name) => name !== "我的球队");
    while (pool.length < size - 1) pool.push(`对手 ${pool.length + 1}`);
    const rated = pool.map((name) => {
      const club = clubsForLeague(game.league, game.seasonRange?.end || "2025-26").find((item) => item.name === name);
      const profile = club ? calcClubProfile(club) : { overall: 78 };
      return { name, rating: profile.overall || 78 };
    }).sort((a, b) => b.rating - a.rating);
    const finish = summary.finish || rankFromPoints(summary.points, size);
    const aboveCount = Math.max(0, finish - 1);
    const belowCount = Math.max(0, size - finish);
    const rows = [];
    for (let index = 0; index < aboveCount; index += 1) {
      const gap = (aboveCount - index) * 4;
      const points = clamp(summary.points + gap + (rng() * 2 - 1), 20, played * 3);
      rows.push(makeTableRow(rated[index].name, points, played, rng, rated[index].rating));
    }
    for (let index = 0; index < belowCount; index += 1) {
      const gap = (index + 1) * 4;
      const points = clamp(summary.points - gap + (rng() * 2 - 1), 10, played * 3);
      rows.push(makeTableRow(rated[aboveCount + index].name, points, played, rng, rated[aboveCount + index].rating));
    }
    rows.push({
      name: "我的球队",
      played,
      wins: summary.wins,
      draws: summary.draws,
      losses: summary.losses,
      goalsFor: summary.goalsFor,
      goalsAgainst: summary.goalsAgainst,
      goalDiff: summary.goalsFor - summary.goalsAgainst,
      points: summary.points,
      isUser: true,
      rating: calcTeamProfile(game).overall
    });
    rows.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
    return rows.map((row, index) => ({ ...row, position: index + 1 }));
  }

  function makeTableRow(name, points, played, rng, strength) {
    points = clamp(points, 0, played * 3);
    const draws = clamp(5 + Math.floor(rng() * 8), 3, Math.max(3, played - 1));
    let wins = clamp(Math.round((points - draws) / 3), 0, played - draws);
    if (wins * 3 + draws > points) wins = Math.max(0, wins - 1);
    const losses = played - wins - draws;
    points = wins * 3 + draws;
    const goalsFor = clamp(Math.round((wins * 2.3 + draws * 1.0) + (strength - 75) * 0.25 + rng() * 12), 18, 95);
    const goalsAgainst = clamp(Math.round((losses * 1.6 + draws * 0.9) + (82 - strength) * 0.18 + rng() * 10), 18, 90);
    return {
      name,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      points,
      isUser: false,
      rating: strength
    };
  }

  function getEuropeanQualification(game, finish) {
    const isBigFour = ["eng", "esp", "ita", "ger"].includes(game.league);
    const allocation = {
      ucl: isBigFour ? 5 : 4,
      uel: 2,
      uecl: 1
    };
    let competition = null;
    if (finish <= allocation.ucl) competition = "UCL";
    else if (finish <= allocation.ucl + allocation.uel) competition = "UEL";
    else if (finish <= allocation.ucl + allocation.uel + allocation.uecl) competition = "UECL";
    const names = { UCL: "欧洲冠军联赛", UEL: "欧联杯", UECL: "欧协联" };
    return {
      qualified: Boolean(competition),
      competition,
      competitionName: competition ? names[competition] : "未获得欧战资格",
      finish,
      allocation
    };
  }

  function buildOpponents(game) {
    const season = game.seasonRange?.end || game.season || "2025-26";
    const pool = getLeagueTeams(game).filter((name) => name !== "我的球队");
    const filler = [
      "欧洲联队", "南美全明星", "非洲联队", "亚洲明星队", "北美联队", "世界联队",
      "传奇十一人", "青年军", "冠军联队", "欧陆豪门", "美洲冠军", "海湾之星",
      "太平洋联队", "伊比利亚明星", "地中海联队", "大西洋联队", "北欧劲旅", "东欧联队", "中东联队"
    ];
    const opponentCount = leagueTeamCount(game.league) - 1;
    while (pool.length < opponentCount) pool.push(filler[pool.length % filler.length]);
    const rng = makeRng(hashSeed(`opponents-${game.id}`));
    return shuffleWithRng([...new Set(pool)].slice(0, 60), rng).slice(0, opponentCount)
      .map((name) => {
        const club = clubsForLeague(game.league, season).find((item) => item.name === name);
        const profile = club ? calcClubProfile(club) : { attack: 78, defense: 78, overall: 78 };
        return {
          name,
          strength: profile.overall || 78,
          attack: profile.attack || 78,
          defense: profile.defense || 78
        };
      });
  }

  function calcClubProfile(club) {
    const units = { ATT: [], MID: [], DEF: [], GK: [] };
    (club.players || []).forEach((player) => {
      const pos = Array.isArray(player.pos) ? player.pos[0] : player.pos;
      const unit = pos === "GK" ? "GK" : ["RB", "CB", "LB", "RWB", "LWB"].includes(pos) ? "DEF" : ["CDM", "CM", "CAM", "RM", "LM"].includes(pos) ? "MID" : "ATT";
      units[unit].push(Number(player.rate || 0));
    });
    const topAvg = (list, count) => {
      const values = list.slice().sort((a, b) => b - a).slice(0, count);
      return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 78;
    };
    const attack = topAvg([...units.ATT, ...units.MID], 5);
    const midfield = topAvg(units.MID, 4);
    const defense = topAvg([...units.DEF, ...units.GK], 5);
    const goalkeeper = topAvg(units.GK, 1);
    return {
      attack: clamp(attack, 40, 99),
      midfield: clamp(midfield, 40, 99),
      defense: clamp(defense, 40, 99),
      goalkeeper: clamp(goalkeeper, 40, 99),
      overall: clamp(Math.round(attack * 0.38 + midfield * 0.22 + defense * 0.26 + goalkeeper * 0.14), 40, 99)
    };
  }

  function runSeason(game, teamRating, opponents, seed) {
    const rng = makeRng(seed);
    const matches = [];
    const scorers = new Map();
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (let index = 0; index < 38; index += 1) {
      const opponent = opponents[index % opponents.length];
      const home = index % 2 === 0;
      const delta = teamRating - opponent.strength + (home ? 2 : -2);
      const winProb = clamp(0.35 + delta * 0.045, 0.06, 0.93);
      const drawProb = clamp(0.22 - Math.abs(delta) * 0.01, 0.08, 0.3);
      const roll = rng();
      const result = roll < winProb ? "W" : roll < winProb + drawProb ? "D" : "L";
      const expectedFor = clamp(0.78 + (teamRating - 78) * 0.08 + (home ? 0.25 : 0) - (opponent.strength - 80) * 0.03, 0.35, 2.6);
      const expectedAgainst = clamp(0.9 - (teamRating - 78) * 0.06 + (opponent.strength - 80) * 0.035 + (home ? -0.15 : 0.15), 0.3, 2.4);
      let gf = clamp(poisson(expectedFor, rng), 0, 7);
      let ga = clamp(poisson(expectedAgainst, rng), 0, 7);
      if (result === "D") {
        const avg = Math.round((gf + ga) / 2);
        gf = avg;
        ga = avg;
      } else if (result === "W" && gf <= ga) {
        gf = ga + 1;
      } else if (result === "L" && ga <= gf) {
        ga = gf + 1;
      }
      const scorerNames = assignScorers(gf, game.slots, rng);
      scorerNames.forEach((player) => scorers.set(player.name, (scorers.get(player.name) || 0) + 1));
      wins += result === "W" ? 1 : 0;
      draws += result === "D" ? 1 : 0;
      losses += result === "L" ? 1 : 0;
      goalsFor += gf;
      goalsAgainst += ga;
      matches.push({
        round: index + 1,
        opponent: opponent.name,
        opponentStrength: opponent.strength,
        home,
        gf,
        ga,
        result,
        scorers: scorerNames.map((player) => player.name)
      });
    }

    const points = wins * 3 + draws;
    const finish = clamp(Math.round(1 + (100 - points) / 5.5 + (rng() * 2 - 1)), 1, 20);
    const topScorer = [...scorers.entries()].sort((a, b) => b[1] - a[1])[0] || null;
    const achievements = collectAchievements({ wins, draws, losses, goalsFor, goalsAgainst, points, finish, teamRating });

    return {
      matches,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points,
      finish,
      teamRating,
      seed,
      topScorer,
      achievements
    };
  }

  function poisson(lambda, rng) {
    if (lambda <= 0) return 0;
    const limit = Math.exp(-lambda);
    let p = 1;
    let k = 0;
    do {
      k += 1;
      p *= rng();
    } while (p > limit);
    return k - 1;
  }

  function assignScorers(goalCount, slots, rng) {
    const candidates = slots
      .filter((slot) => slot.player)
      .map((slot) => {
        const unit = positionUnit(slot.pos);
        const weight = unit === "ATT" ? 2.2 : unit === "MID" ? 0.85 : unit === "DEF" ? 0.06 : 0.02;
        return { id: slot.player.id, name: slot.player.name, weight: weight * (slot.player.rate / 85) };
      });
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    const scorers = [];
    for (let i = 0; i < goalCount; i += 1) {
      if (!candidates.length || totalWeight <= 0) {
        scorers.push({ id: "unknown", name: "无名英雄" });
        continue;
      }
      let roll = rng() * totalWeight;
      let scorerIndex = candidates.length - 1;
      for (let index = 0; index < candidates.length; index += 1) {
        roll -= candidates[index].weight;
        if (roll <= 0) {
          scorerIndex = index;
          break;
        }
      }
      scorers.push(candidates[scorerIndex]);
    }
    return scorers;
  }

  function assignAssists(goalCount, slots, rng, scorerIds) {
    const candidates = slots
      .filter((slot) => slot.player && !scorerIds.includes(slot.player.id))
      .map((slot) => {
        const unit = positionUnit(slot.pos);
        const weight = unit === "MID" ? 1.5 : unit === "ATT" ? 1.2 : unit === "DEF" ? 0.25 : 0.02;
        return { id: slot.player.id, name: slot.player.name, weight: weight * (slot.player.rate / 85) };
      });
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    const assists = [];
    for (let i = 0; i < goalCount; i += 1) {
      if (rng() < 0.38 || !candidates.length || totalWeight <= 0) {
        assists.push(null);
        continue;
      }
      let roll = rng() * totalWeight;
      let assistIndex = candidates.length - 1;
      for (let index = 0; index < candidates.length; index += 1) {
        roll -= candidates[index].weight;
        if (roll <= 0) {
          assistIndex = index;
          break;
        }
      }
      assists.push(candidates[assistIndex]);
    }
    return assists;
  }

  function collectAchievements(result) {
    const list = [];
    if (result.wins === result.matches?.length) list.push("完美赛季");
    if (result.losses === 0 && result.wins < result.matches?.length) list.push("不败赛季");
    if (result.finish === 1) list.push("联赛冠军");
    if (result.finish <= 4) list.push("进入欧冠区");
    if (result.goalsFor >= 100) list.push("进球破百");
    if (result.goalsAgainst <= 20) list.push("钢铁防线");
    if (result.goalsAgainst <= 10) list.push("铁幕防守");
    if (result.finish === 1 && result.teamRating <= 84) list.push("黑马夺冠");
    if (result.teamRating >= 90) list.push("世界级阵容");
    return list;
  }

  function renderResult(game) {
    const run = game || state.game;
    if (!run || !run.result) return;
    const result = run.result;
    const leagueName = getLeague(run.league)?.name || run.league || "";
    const seasonText = run.seasonRange?.end || run.season || "";
    $("#resultMatchEyebrow").textContent = `${result.matches.length} 场比赛`;
    $("#resultBadge").textContent = `${run.formation} · ${leagueName || seasonText}`;
    $("#resultRecord").textContent = `${result.wins}-${result.draws}-${result.losses}`;
    $("#resultPoints").textContent = `${result.points} 分`;
    $("#resultScore").textContent = `${result.points} 分 · 第 ${result.finish} 名`;

    const stats = [
      [result.wins, "胜"],
      [result.draws, "平"],
      [result.losses, "负"],
      [result.goalsFor, "进球"],
      [result.goalsAgainst, "失球"],
      [result.goalsFor - result.goalsAgainst, "净胜球"],
      [result.teamRating, "阵容评分"]
    ];
    const statsBox = $("#resultStats");
    statsBox.innerHTML = "";
    stats.forEach(([value, label]) => {
      const item = el("div", "summary-stat", "");
      item.appendChild(el("strong", "", String(value)));
      item.appendChild(el("span", "", label));
      statsBox.appendChild(item);
    });

    const achievements = $("#achievements");
    achievements.innerHTML = "";
    if (result.topScorer) achievements.appendChild(el("span", "achievement", `最佳射手：${result.topScorer[0]} ${result.topScorer[1]} 球`));
    result.achievements.forEach((name) => achievements.appendChild(el("span", "achievement", name)));
    if (!result.achievements.length && !result.topScorer) {
      achievements.appendChild(el("span", "achievement", "完成赛季"));
    }
    renderLeagueTable(result, leagueName);
    renderResultLineup(run);
    renderEurope(result, run);

    const list = $("#matchList");
    list.innerHTML = "";
    result.matches.forEach((match) => {
      const row = el("div", "match-row", "");
      row.classList.add(match.result === "W" ? "result-win" : match.result === "D" ? "result-draw" : "result-loss");
      row.appendChild(el("span", "match-round", `R${match.round}`));
      const teams = el("div", "match-teams", "");
      teams.appendChild(el("span", "", `${match.home ? "主" : "客"} vs ${match.opponent}`));
      teams.appendChild(el("span", "", match.scorers.length ? `进球：${match.scorers.join("、")}` : "无进球"));
      const score = el("div", "match-score", `${match.gf}-${match.ga}`);
      const resultLabel = match.result === "W" ? "胜" : match.result === "D" ? "平" : "负";
      score.appendChild(el("small", "", resultLabel));
      row.append(teams, score);
      list.appendChild(row);
    });
    showView("result");
  }

  function renderLeagueTable(result, leagueName) {
    if (!result.leagueTable || !result.leagueTable.length) {
      ui.resultTablePanel.classList.add("hidden");
      return;
    }
    ui.resultTablePanel.classList.remove("hidden");
    ui.resultTableLeague.textContent = leagueName;
    ui.leagueTable.innerHTML = "";
    const headers = ["排名", "球队", "场次", "胜", "平", "负", "进", "失", "净胜", "积分"];
    const head = el("div", "table-row table-head", "");
    headers.forEach((text) => head.appendChild(el("span", "", text)));
    ui.leagueTable.appendChild(head);
    result.leagueTable.forEach((row) => {
      const tr = el("div", "table-row", "");
      tr.classList.toggle("user-row", row.isUser);
      [row.position, row.name, row.played, row.wins, row.draws, row.losses, row.goalsFor, row.goalsAgainst, row.goalDiff, row.points]
        .forEach((value) => tr.appendChild(el("span", "", String(value))));
      ui.leagueTable.appendChild(tr);
    });
  }

  function renderAwards(result) {
    if (!result.playerStats || !result.playerStats.length) {
      ui.resultStarsPanel.classList.add("hidden");
      return;
    }
    ui.resultStarsPanel.classList.remove("hidden");
    const teamBest = result.playerStats[0];
    const goldenBoot = [...result.playerStats].sort((a, b) => b.goals - a.goals)[0];
    const mostAssists = [...result.playerStats].sort((a, b) => b.assists - a.assists)[0];
    const awards = [
      ["队内最佳球员", teamBest ? `${teamBest.name} · ${teamBest.goals}球 ${teamBest.assists}助` : "--"],
      ["金靴", goldenBoot ? `${goldenBoot.name} · ${goldenBoot.goals}球` : "--"],
      ["最多助攻", mostAssists ? `${mostAssists.name} · ${mostAssists.assists}助` : "--"]
    ];
    ui.awardStats.innerHTML = "";
    awards.forEach(([label, value]) => {
      const card = el("div", "award-card", "");
      card.appendChild(el("span", "", label));
      card.appendChild(el("strong", "", value));
      ui.awardStats.appendChild(card);
    });
    ui.playerStats.innerHTML = "";
    result.playerStats.slice(0, 11).forEach((stat, index) => {
      const row = el("div", "player-stat-row", "");
      row.appendChild(el("span", "player-rank", String(index + 1)));
      row.appendChild(el("strong", "", stat.name));
      row.appendChild(el("span", "", `${stat.apps} 场`));
      row.appendChild(el("span", "", `${stat.goals} 球`));
      row.appendChild(el("span", "", `${stat.assists} 助`));
      ui.playerStats.appendChild(row);
    });
  }

  function renderEurope(result, run) {
    const qual = result.europeQualification;
    if (!qual || !qual.qualified) {
      ui.europePanel.classList.add("hidden");
      return;
    }
    ui.europePanel.classList.remove("hidden");
    ui.europeTitle.textContent = `${qual.competitionName}资格`;
    ui.europeStatus.innerHTML = "";
    const status = el("div", "europe-status-text", "");
    status.appendChild(el("span", "", `联赛第 ${qual.finish} 名`));
    status.appendChild(el("strong", "", qual.competitionName));
    status.appendChild(el("small", "", `名额分配：欧冠 ${qual.allocation.ucl} · 欧联 ${qual.allocation.uel} · 欧协联 ${qual.allocation.uecl}`));
    ui.europeStatus.appendChild(status);
    if (run.europeResult) {
      ui.europeStartBtn.classList.add("hidden");
      renderEuropeanResult(run.europeResult);
    } else {
      ui.europeStartBtn.classList.remove("hidden");
      ui.europeResults.innerHTML = "";
    }
  }

  function startEuropeanTournament() {
    const run = state.viewingRun || state.game;
    const result = run?.result;
    const qual = result?.europeQualification;
    if (!run || !qual || !qual.qualified) return;
    if (run.europeResult) {
      renderEuropeanResult(run.europeResult);
      return;
    }
    ui.europeStartBtn.classList.add("hidden");
    ui.europeResults.innerHTML = "";
    const sim = createEuropeanSimulation(run, qual.competition);
    run.europeSim = sim;
    if (run === state.game) saveGame();
    simulateNextEuropeanStep(sim);
  }

  function createEuropeanSimulation(run, competition) {
    const rng = makeRng(hashSeed(`europe-${run.id}-${competition}`));
    const pool = [
      "Ajax", "PSV", "Feyenoord", "FC Porto", "Benfica", "Sporting CP", "Celtic", "Rangers",
      "Club Brugge", "Anderlecht", "Galatasaray", "Fenerbahçe", "Beşiktaş", "Olympiacos", "PAOK",
      "Red Star", "Dinamo Zagreb", "Salzburg", "Shakhtar", "Dynamo Kyiv", "Copenhagen", "Malmö",
      "Slavia Prague", "Sparta Prague", "Young Boys", "Basel", "Partizan", "APOEL", "Ferencváros",
      "Midtjylland", "Bodø/Glimt", "Ludogorets", "AZ Alkmaar", "Braga", "Trabzonspor", "Slovan Bratislava"
    ];
    const replaced = shuffleWithRng(pool, rng).slice(0, 35);
    const teams = replaced.map((name) => {
      const fallback = europeProfileFromStrength(72 + Math.floor(rng() * 16));
      const profile = (typeof EUROPEAN_CLUB_PROFILES !== "undefined" && EUROPEAN_CLUB_PROFILES[name])
        || fallback;
      const strength = teamStrength(profile);
      return {
        name,
        strength,
        profile,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        isUser: false
      };
    });
    const userProfile = calcTeamProfile(run);
    teams.push({
      name: "我的球队",
      strength: teamStrength(userProfile),
      profile: userProfile,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      isUser: true
    });
    const matchdays = competition === "UECL" ? 6 : 8;
    return {
      run,
      competition,
      rng,
      teams,
      matchdays,
      leagueRounds: buildEuropeanLeagueRounds(teams, matchdays),
      roundIndex: 0,
      matchIndex: 0,
      phase: "league",
      logs: [],
      rounds: [],
      currentStage: null,
      leagueTable: null,
      userStage: "进行中",
      userAlive: true,
      finished: false
    };
  }

  function buildEuropeanLeagueRounds(teams, matchdays) {
    const rounds = [];
    const order = teams.slice();
    for (let round = 0; round < matchdays; round += 1) {
      const matches = [];
      for (let index = 0; index < order.length / 2; index += 1) {
        matches.push({
          home: order[index],
          away: order[order.length - 1 - index]
        });
      }
      rounds.push({ round: round + 1, matches });
      const last = order.pop();
      order.splice(1, 0, last);
    }
    return rounds;
  }

  function simulateNextEuropeanStep(sim) {
    if (sim.finished) return;
    let delay = sim.userAlive ? 160 : 24;
    if (sim.phase === "league") {
      const round = sim.leagueRounds[sim.roundIndex];
      const match = round.matches[sim.matchIndex];
      const played = simulateEuropeanTie(match.home, match.away, sim.rng, false);
      updateEuropeanStats(match.home, played.homeGoals, played.awayGoals);
      updateEuropeanStats(match.away, played.awayGoals, played.homeGoals);
      sim.logs.push({
        stage: `联赛阶段第 ${round.round} 轮`,
        text: `${match.home.name} ${played.homeGoals}-${played.awayGoals} ${match.away.name}`,
        userMatch: match.home.isUser || match.away.isUser
      });
      renderEuropeanStep(sim, sim.logs[sim.logs.length - 1], `${sim.logs.length}/${sim.leagueRounds.length * 18}`);
      sim.matchIndex += 1;
      if (sim.matchIndex >= round.matches.length) {
        sim.matchIndex = 0;
        sim.roundIndex += 1;
        if (sim.roundIndex >= sim.leagueRounds.length) {
          prepareEuropeanKnockout(sim);
        }
      }
    } else if (sim.phase === "knockout") {
      if (!sim.currentStage) {
        finishEuropeanSimulation(sim);
        return;
      }
      const stage = sim.currentStage;
      const tie = stage.ties[stage.tieIndex];
      if (!tie) {
        finishEuropeanSimulation(sim);
        return;
      }
      if (stage.twoLeg && tie.legs.length >= 2) {
        finalizeEuropeanTie(tie, sim.rng);
        logEuropeanTieResolution(sim, stage, tie);
        stage.tieIndex += 1;
        if (stage.tieIndex >= stage.ties.length) {
          advanceEuropeanStage(sim, stage);
        }
      } else {
        const home = tie.legs.length === 0 ? tie.teamA : tie.teamB;
        const away = tie.legs.length === 0 ? tie.teamB : tie.teamA;
        const played = simulateEuropeanTie(home, away, sim.rng, false);
        tie.legs.push(played);
        sim.logs.push({
          stage: stage.name,
          text: `${home.name} ${played.homeGoals}-${played.awayGoals} ${away.name}`,
          userMatch: home.isUser || away.isUser
        });
        renderEuropeanStep(sim, sim.logs[sim.logs.length - 1], `${stage.tieIndex + 1}/${stage.ties.length} 组`);
        if (tie.legs.length >= (stage.twoLeg ? 2 : 1)) {
          finalizeEuropeanTie(tie, sim.rng);
          logEuropeanTieResolution(sim, stage, tie);
          stage.tieIndex += 1;
          if (stage.tieIndex >= stage.ties.length) {
            advanceEuropeanStage(sim, stage);
          }
        }
      }
    }
    setTimeout(() => simulateNextEuropeanStep(sim), delay);
  }

  function prepareEuropeanKnockout(sim) {
    const table = [...sim.teams].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor);
    table.forEach((team, index) => { team.position = index + 1; });
    sim.leagueTable = table;
    const user = table.find((team) => team.isUser);
    if (user && user.position > 24) {
      sim.userStage = "联赛阶段出局";
      sim.userAlive = false;
    } else if (user && user.position > 8) {
      sim.userStage = "进入附加赛";
    } else if (user) {
      sim.userStage = "直接进入16强";
    }
    const playoffTies = [];
    for (let index = 0; index < 8; index += 1) {
      playoffTies.push(createEuropeanTie(table[8 + index], table[23 - index], true));
    }
    sim.currentStage = { name: "附加赛", ties: playoffTies, tieIndex: 0, twoLeg: true };
    sim.phase = "knockout";
  }

  function createEuropeanTie(teamA, teamB, twoLeg) {
    return { teamA, teamB, legs: [], winner: null, twoLeg, aggregateA: 0, aggregateB: 0 };
  }

  function finalizeEuropeanTie(tie, rng) {
    if (tie.twoLeg) {
      tie.aggregateA = tie.legs[0].homeGoals + tie.legs[1].awayGoals;
      tie.aggregateB = tie.legs[0].awayGoals + tie.legs[1].homeGoals;
    } else {
      tie.aggregateA = tie.legs[0].homeGoals;
      tie.aggregateB = tie.legs[0].awayGoals;
    }
    if (tie.aggregateA !== tie.aggregateB) {
      tie.winner = tie.aggregateA > tie.aggregateB ? tie.teamA : tie.teamB;
      return;
    }
    const home = tie.twoLeg ? tie.teamB : tie.teamA;
    const away = tie.twoLeg ? tie.teamA : tie.teamB;
    const extraTime = simulateEuropeanExtraTime(home, away, rng);
    tie.extraTime = extraTime;
    if (extraTime.homeGoals !== extraTime.awayGoals) {
      tie.winner = extraTime.homeGoals > extraTime.awayGoals ? home : away;
      return;
    }
    const penalties = simulateEuropeanPenalties(home, away, rng);
    tie.penalties = penalties;
    tie.winner = penalties.winner;
  }

  function simulateEuropeanExtraTime(teamA, teamB, rng) {
    const ratingDiff = teamA.strength - teamB.strength;
    return {
      homeGoals: clamp(poisson(Math.max(0.15, 0.3 + ratingDiff * 0.025), rng), 0, 3),
      awayGoals: clamp(poisson(Math.max(0.12, 0.25 - ratingDiff * 0.02), rng), 0, 3)
    };
  }

  function simulateEuropeanPenalties(teamA, teamB, rng) {
    let home = 0;
    let away = 0;
    for (let index = 0; index < 5; index += 1) {
      home += rng() < 0.76 ? 1 : 0;
      away += rng() < 0.72 ? 1 : 0;
    }
    while (home === away) {
      home += rng() < 0.76 ? 1 : 0;
      away += rng() < 0.72 ? 1 : 0;
    }
    return {
      home,
      away,
      winner: home > away ? teamA : teamB
    };
  }

  function logEuropeanTieResolution(sim, stage, tie) {
    if (!tie.extraTime && !tie.penalties) return;
    const text = tie.penalties
      ? `点球 ${tie.penalties.home}-${tie.penalties.away}，${tie.winner.name}晋级`
      : `加时 ${tie.extraTime.homeGoals}-${tie.extraTime.awayGoals}，${tie.winner.name}晋级`;
    sim.logs.push({
      stage: stage.name,
      text,
      userMatch: tie.teamA.isUser || tie.teamB.isUser
    });
    renderEuropeanStep(sim, sim.logs[sim.logs.length - 1], `${stage.tieIndex + 1}/${stage.ties.length} 组`);
  }

  function advanceEuropeanStage(sim, completedStage) {
    sim.rounds.push({
      name: completedStage.name,
      ties: completedStage.ties.map((tie) => ({
        home: tie.teamA,
        away: tie.teamB,
        homeGoals: tie.aggregateA,
        awayGoals: tie.aggregateB,
        winner: tie.winner,
        extraTime: tie.extraTime,
        penalties: tie.penalties
      }))
    });
    const winners = completedStage.ties.map((tie) => tie.winner);
    if (completedStage.name === "决赛") {
      sim.userStage = winners.some((team) => team?.isUser) ? "欧洲冠军" : "亚军";
    } else if (!winners.some((team) => team?.isUser)) {
      sim.userAlive = false;
      if (sim.userStage === "进行中") sim.userStage = `${europeStageLabel(completedStage.name)}出局`;
    }
    if (completedStage.name === "附加赛") {
      const r16Ties = sim.leagueTable.slice(0, 8).map((team, index) => createEuropeanTie(team, winners[index], true));
      sim.currentStage = { name: "1/8决赛", ties: r16Ties, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "1/8决赛") {
      shuffleWithRng(winners, sim.rng);
      const qfTies = [];
      for (let index = 0; index < winners.length; index += 2) qfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "1/4决赛", ties: qfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "1/4决赛") {
      shuffleWithRng(winners, sim.rng);
      const sfTies = [];
      for (let index = 0; index < winners.length; index += 2) sfTies.push(createEuropeanTie(winners[index], winners[index + 1], true));
      sim.currentStage = { name: "半决赛", ties: sfTies, tieIndex: 0, twoLeg: true };
    } else if (completedStage.name === "半决赛") {
      sim.currentStage = { name: "决赛", ties: [createEuropeanTie(winners[0], winners[1], false)], tieIndex: 0, twoLeg: false };
    } else if (completedStage.name === "决赛") {
      sim.currentStage = null;
      finishEuropeanSimulation(sim);
    }
  }

  function finishEuropeanSimulation(sim) {
    const user = sim.teams.find((team) => team.isUser);
    const finalStage = sim.rounds[sim.rounds.length - 1];
    const champion = finalStage?.ties?.[0]?.winner || null;
    const info = EUROPE_COMPETITIONS[sim.competition] || { name: sim.competitionName || sim.competition || "欧洲赛事", champion: "欧洲冠军", runnerUp: "欧战结束" };
    if (sim.userStage === "进行中") {
      sim.userStage = champion?.isUser ? info.champion : user ? info.runnerUp : "未参赛";
    }
    sim.run.europeResult = {
      competition: sim.competition,
      competitionName: info.name,
      stage: "决赛",
      userStage: sim.userStage,
      finalResult: sim.userStage,
      champion: champion?.name || null,
      leagueTable: sim.leagueTable,
      rounds: sim.rounds,
      logs: sim.logs
    };
    sim.run.europeSim = null;
    sim.finished = true;
    if (sim.run === state.game) saveGame();
    renderEuropeanResult(sim.run.europeResult);
  }

  function europeStageLabel(stage) {
    return {
      "1/8决赛": "十六强",
      "1/4决赛": "八强",
      "半决赛": "四强",
      "决赛": "决赛",
      "附加赛": "附加赛"
    }[stage] || stage;
  }

  function renderEuropeanStep(sim, step, progressText) {
    ui.europeResults.innerHTML = "";
    const current = el("div", "europe-summary", "");
    current.appendChild(el("strong", "", step.stage));
    if (step.userMatch) {
      current.appendChild(el("span", "", step.text));
    } else {
      current.appendChild(el("span", "", `已完成 ${progressText}`));
    }
    current.appendChild(el("small", "", progressText));
    ui.europeResults.appendChild(current);
    const latest = el("div", "simulation-latest", "");
    const visibleLogs = sim.logs.filter((log) => log.userMatch);
    visibleLogs.slice(-14).reverse().forEach((log) => {
      const row = el("div", "sim-match-row", "");
      row.classList.toggle("user-row", Boolean(log.userMatch));
      row.appendChild(el("span", "", log.stage));
      row.appendChild(el("span", "", log.text));
      latest.appendChild(row);
    });
    ui.europeResults.appendChild(latest);
  }

  function simulateEuropeanTie(teamA, teamB, rng, neutral) {
    const homeProfile = teamA.profile || europeProfileFromStrength(teamA.strength);
    const awayProfile = teamB.profile || europeProfileFromStrength(teamB.strength);
    const result = simulateLeagueResult(homeProfile, awayProfile, rng, teamA.name);
    return {
      home: teamA,
      away: teamB,
      homeGoals: result.gf,
      awayGoals: result.ga,
      winner: result.result === "H" ? teamA : result.result === "A" ? teamB : null,
      neutral
    };
  }

  function europeProfileFromStrength(strength) {
    return {
      attack: clamp(strength - 1, 40, 99),
      midfield: clamp(strength, 40, 99),
      defense: clamp(strength - 1, 40, 99),
      goalkeeper: clamp(strength - 1, 40, 99),
      overall: clamp(strength, 40, 99)
    };
  }

  function simulateTwoLegTie(teamA, teamB, rng) {
    const first = simulateEuropeanTie(teamA, teamB, rng, false);
    const second = simulateEuropeanTie(teamB, teamA, rng, false);
    const aggregateA = first.homeGoals + second.awayGoals;
    const aggregateB = first.awayGoals + second.homeGoals;
    let winner = null;
    if (aggregateA > aggregateB) winner = teamA;
    else if (aggregateB > aggregateA) winner = teamB;
    else winner = rng() < 0.5 ? teamA : teamB;
    return {
      home: teamA,
      away: teamB,
      homeGoals: aggregateA,
      awayGoals: aggregateB,
      winner,
      legs: [first, second]
    };
  }

  function updateEuropeanStats(team, goalsFor, goalsAgainst) {
    if (!team) return;
    team.points += goalsFor > goalsAgainst ? 3 : goalsFor === goalsAgainst ? 1 : 0;
    team.goalsFor += goalsFor;
    team.goalsAgainst += goalsAgainst;
  }

  function renderEuropeanResult(europeResult) {
    ui.europeResults.innerHTML = "";
    const info = EUROPE_COMPETITIONS[europeResult.competition] || { name: europeResult.competitionName || "欧洲赛事", champion: "欧洲冠军", runnerUp: "欧战结束" };
    const summary = el("div", "europe-summary europe-final", "");
    summary.appendChild(el("span", "europe-final-label", `本队${info.name}最终成绩`));
    summary.appendChild(el("strong", "", europeResult.userStage || europeResult.stage || "已完成"));
    if (europeResult.champion) summary.appendChild(el("span", "europe-champion", `${info.name}冠军：${europeResult.champion}`));
    ui.europeResults.appendChild(summary);
    if (europeResult.leagueTable) {
      const details = el("details", "europe-block europe-collapse", "");
      const heading = el("summary", "europe-table-summary", "");
      heading.appendChild(el("h3", "", `${info.name} 36 队联赛阶段积分表`));
      details.appendChild(heading);
      const body = el("div", "europe-table-body", "");
      europeResult.leagueTable.forEach((team) => {
        const row = el("div", "europe-team-row", "");
        row.classList.toggle("user-row", Boolean(team.isUser));
        if (team.isUser) row.classList.add("europe-user-highlight");
        row.appendChild(el("span", "", `${team.position}. ${team.name}`));
        row.appendChild(el("span", "", `${team.points}分 ${team.goalsFor - team.goalsAgainst}净胜`));
        body.appendChild(row);
      });
      details.appendChild(body);
      ui.europeResults.appendChild(details);
    }
    const userLogs = (europeResult.logs || []).filter((log) => log.userMatch);
    if (userLogs.length) {
      const block = el("div", "europe-round", "");
      block.appendChild(el("h3", "", "我的赛果"));
      userLogs.forEach((log) => {
        const row = el("div", "europe-team-row", "");
        row.appendChild(el("span", "", `${log.stage} · ${log.text}`));
        block.appendChild(row);
      });
      ui.europeResults.appendChild(block);
    }
  }

  function addRun(game) {
    const runs = loadRuns();
    runs.unshift({ ...game });
    safeSet(STORAGE_RUNS, runs.slice(0, 20));
  }

  function loadRuns() {
    const raw = Array.isArray(safeGet(STORAGE_RUNS)) ? safeGet(STORAGE_RUNS) : [];
    const clean = raw.filter((run) => !isBadRun(run));
    if (clean.length !== raw.length) safeSet(STORAGE_RUNS, clean);
    return clean;
  }

  function viewRun(run) {
    if (!run?.result || isBadRun(run)) return;
    state.viewingRun = run;
    renderResult(run);
  }

  function goBackFromResult() {
    state.viewingRun = null;
    if (state.game) {
      renderGame();
    } else {
      showView("setup");
    }
  }

  function shareResult() {
    const run = state.viewingRun || state.game;
    if (!run?.result) return;
    const result = run.result;
    const text = `Global 38-0：我用了 ${run.formation} 阵容，${result.wins}-${result.draws}-${result.losses}，${result.points} 分，第 ${result.finish} 名。敢来挑战吗？`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast("战报已复制")).catch(() => toast("复制失败，可以手动复制。"));
    } else {
      toast(text);
    }
  }

  function drawWheel(angle) {
    const canvas = $("#wheelCanvas");
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    ctx.clearRect(0, 0, size, size);
    const leagues = [...state.selectedLeagues].map((id) => getLeague(id)).filter(Boolean);
    if (!leagues.length) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#1a2a23";
      ctx.fill();
      ctx.fillStyle = "#9fb4aa";
      ctx.font = "700 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("请选择联赛", cx, cy);
      return;
    }
    const step = (Math.PI * 2) / leagues.length;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    leagues.forEach((league, index) => {
      const start = -Math.PI / 2 + index * step;
      const end = start + step;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = index % 2 === 0 ? league.color : league.accent;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.save();
      ctx.rotate(start + step / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      ctx.font = "900 17px sans-serif";
      ctx.fillText(league.name, radius - 24, 0);
      ctx.restore();
    });
    ctx.beginPath();
    ctx.arc(0, 0, 62, 0, Math.PI * 2);
    ctx.fillStyle = "#0b1512";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  function hashSeed(value) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function makeRng(seed) {
    let value = seed >>> 0;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function shuffleWithRng(items, rng) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  init();
})();
