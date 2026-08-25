(() => {
  "use strict";

  const CURRENT_SEASON = "2025-26";
  const cache = new Map();
  const pending = new Map();
  let standingsPromise = null;
  window.G38_HISTORY_DATA = window.G38_HISTORY_DATA || {};

  if (typeof SEASON_PLAYERS !== "undefined" && SEASON_PLAYERS[CURRENT_SEASON]) {
    cache.set(CURRENT_SEASON, SEASON_PLAYERS[CURRENT_SEASON]);
  }

  function getSeasonData(season = CURRENT_SEASON) {
    return cache.get(season) || cache.get(CURRENT_SEASON) || { source: "", clubs: [] };
  }

  function hasSeasonData(season) {
    return cache.has(season);
  }

  async function loadSeasonData(season = CURRENT_SEASON) {
    if (cache.has(season)) return cache.get(season);
    if (pending.has(season)) return pending.get(season);

    const request = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `history-data/${encodeURIComponent(season)}.js`;
      script.async = true;
      script.onload = () => resolve(window.G38_HISTORY_DATA[season]);
      script.onerror = () => reject(new Error(`Season ${season} could not be loaded`));
      document.head.appendChild(script);
    })
      .then((data) => {
        if (!data || !Array.isArray(data.clubs)) throw new Error(`Season ${season} has invalid data`);
        cache.set(season, data);
        delete window.G38_HISTORY_DATA[season];
        return data;
      })
      .finally(() => pending.delete(season));

    pending.set(season, request);
    return request;
  }

  async function loadSeasonRange(seasons, concurrency = 4) {
    const queue = [...new Set(seasons)].filter((season) => !cache.has(season));
    let cursor = 0;
    async function worker() {
      while (cursor < queue.length) {
        const season = queue[cursor];
        cursor += 1;
        await loadSeasonData(season);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()));
    return seasons.map((season) => getSeasonData(season));
  }

  function loadHistoricalStandings() {
    if (typeof HISTORICAL_STANDINGS !== "undefined") {
      return Promise.resolve(HISTORICAL_STANDINGS);
    }
    if (standingsPromise) return standingsPromise;
    standingsPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "src/season-standings.js?v=20260821-02";
      script.async = true;
      script.onload = () => {
        if (typeof HISTORICAL_STANDINGS === "undefined") {
          reject(new Error("Historical standings were not initialized"));
          return;
        }
        resolve(HISTORICAL_STANDINGS);
      };
      script.onerror = () => reject(new Error("Historical standings could not be loaded"));
      document.head.appendChild(script);
    }).catch((error) => {
      standingsPromise = null;
      throw error;
    });
    return standingsPromise;
  }

  window.G38SeasonData = {
    currentSeason: CURRENT_SEASON,
    getSeasonData,
    hasSeasonData,
    loadSeasonData,
    loadSeasonRange,
    loadHistoricalStandings
  };
})();
