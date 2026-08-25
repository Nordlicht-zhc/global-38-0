(() => {
  "use strict";

  const HISTORY_MATCH_LIMIT = 30;

  function cloneForCloud(value, parentKey = "") {
    if (Array.isArray(value)) {
      return value.map((item) => cloneForCloud(item, parentKey));
    }
    if (!value || typeof value !== "object") return value;

    const clone = {};
    Object.entries(value).forEach(([key, child]) => {
      if (key === "matches" && parentKey === "result" && Array.isArray(child)) {
        clone[key] = child
          .slice(-HISTORY_MATCH_LIMIT)
          .map((match) => cloneForCloud(match, key));
        return;
      }
      clone[key] = cloneForCloud(child, key);
    });
    return clone;
  }

  function hasExcessMatches(value, parentKey = "") {
    if (Array.isArray(value)) {
      return value.some((item) => hasExcessMatches(item, parentKey));
    }
    if (!value || typeof value !== "object") return false;
    return Object.entries(value).some(([key, child]) => (
      (key === "matches" && parentKey === "result" && Array.isArray(child) && child.length > HISTORY_MATCH_LIMIT)
      || hasExcessMatches(child, key)
    ));
  }

  window.G38CloudPayload = Object.freeze({
    HISTORY_MATCH_LIMIT,
    prepare: (payload) => cloneForCloud(payload),
    prepareGame: (game) => cloneForCloud(game),
    prepareRuns: (runs) => cloneForCloud(runs),
    needsTrim: (payload) => hasExcessMatches(payload)
  });
})();
