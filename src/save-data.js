(() => {
  "use strict";

  const HISTORY_MATCH_LIMIT = 30;

  function cloneForSave(value, parentKey = "", ancestors = new WeakSet()) {
    if (typeof value === "function" || typeof value === "symbol") return undefined;
    if (Array.isArray(value)) {
      if (ancestors.has(value)) return [];
      ancestors.add(value);
      const clone = value.map((item) => cloneForSave(item, parentKey, ancestors));
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
          .map((match) => cloneForSave(match, key, ancestors));
        return;
      }
      const clonedChild = cloneForSave(child, key, ancestors);
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

  window.G38SaveData = Object.freeze({
    HISTORY_MATCH_LIMIT,
    prepare: (payload) => cloneForSave(payload),
    prepareGame: (game) => cloneForSave(game),
    prepareRuns: (runs) => cloneForSave(runs),
    needsTrim: (payload) => hasExcessMatches(payload)
  });
})();
