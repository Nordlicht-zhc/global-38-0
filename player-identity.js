(() => {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toLowerCase();
  }

  function canonicalClubId(clubId, aliases = {}) {
    if (aliases[clubId]) return clubId;
    for (const [canonical, historicalIds] of Object.entries(aliases)) {
      if (historicalIds.includes(clubId)) return canonical;
    }
    return clubId || "unknown-club";
  }

  function details(player) {
    const parts = String(player?.id || "").split("|");
    return {
      clubId: player?.sourceClubId || parts[1] || "",
      name: player?.name || parts.slice(2).join("|")
    };
  }

  function key(player, aliases = {}) {
    const playerDetails = details(player);
    return `${canonicalClubId(playerDetails.clubId, aliases)}|${normalize(playerDetails.name)}`;
  }

  window.G38PlayerIdentity = { canonicalClubId, key, normalize };
})();
