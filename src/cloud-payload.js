(() => {
  "use strict";

  const HISTORY_MATCH_LIMIT = 30;

  function cloneForCloud(value, parentKey = "", ancestors = new WeakSet()) {
    if (typeof value === "function" || typeof value === "symbol") return undefined;
    if (Array.isArray(value)) {
      if (ancestors.has(value)) return [];
      ancestors.add(value);
      const clone = value.map((item) => cloneForCloud(item, parentKey, ancestors));
      ancestors.delete(value);
      return clone;
    }
    if (!value || typeof value !== "object") return value;
    if (ancestors.has(value)) return undefined;

    ancestors.add(value);
    const clone = {};
    Object.entries(value).forEach(([key, child]) => {
      if (key === "matches" && parentKey === "result" && Array.isArray(child)) {
        clone[key] = child
          .slice(-HISTORY_MATCH_LIMIT)
          .map((match) => cloneForCloud(match, key, ancestors));
        return;
      }
      const clonedChild = cloneForCloud(child, key, ancestors);
      if (clonedChild !== undefined) clone[key] = clonedChild;
    });
    ancestors.delete(value);
    return clone;
  }

  function hasExcessMatches(value, parentKey = "", ancestors = new WeakSet()) {
    if (Array.isArray(value)) {
      if (ancestors.has(value)) return false;
      ancestors.add(value);
      const result = value.some((item) => hasExcessMatches(item, parentKey, ancestors));
      ancestors.delete(value);
      return result;
    }
    if (!value || typeof value !== "object") return false;
    if (ancestors.has(value)) return false;
    ancestors.add(value);
    const result = Object.entries(value).some(([key, child]) => (
      (key === "matches" && parentKey === "result" && Array.isArray(child) && child.length > HISTORY_MATCH_LIMIT)
      || hasExcessMatches(child, key, ancestors)
    ));
    ancestors.delete(value);
    return result;
  }

  window.G38CloudPayload = Object.freeze({
    HISTORY_MATCH_LIMIT,
    prepare: (payload) => cloneForCloud(payload),
    prepareGame: (game) => cloneForCloud(game),
    prepareRuns: (runs) => cloneForCloud(runs),
    needsTrim: (payload) => hasExcessMatches(payload)
  });
})();
