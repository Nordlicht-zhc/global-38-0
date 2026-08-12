(() => {
  "use strict";

  const midfieldCentrePositions = ["CM", "CDM", "CAM"];
  const midfieldPositions = ["CDM", "CM", "CAM", "RM", "LM"];
  const defensivePositions = ["RB", "CB", "LB", "RWB", "LWB"];
  const midfielderDefensivePenalties = {
    CDM: { CB: 5, LB: 9, RB: 9, LWB: 11, RWB: 11 },
    CM: { CB: 9, LB: 10, RB: 10, LWB: 10, RWB: 10 },
    CAM: { CB: 15, LB: 13, RB: 13, LWB: 12, RWB: 12 },
    LM: { CB: 14, LB: 5, RB: 16, LWB: 3, RWB: 16 },
    RM: { CB: 14, LB: 16, RB: 5, LWB: 16, RWB: 3 }
  };

  function canPlaySlot(player, slotPos) {
    if (!player || !Array.isArray(player.pos)) return false;
    if (player.pos.includes(slotPos)) return true;
    if ((slotPos === "LB" || slotPos === "LWB") && player.pos.some((pos) => pos === "LB" || pos === "LWB")) return true;
    if ((slotPos === "RB" || slotPos === "RWB") && player.pos.some((pos) => pos === "RB" || pos === "RWB")) return true;
    if ((slotPos === "LM" || slotPos === "LW") && player.pos.some((pos) => pos === "LM" || pos === "LW")) return true;
    if ((slotPos === "RM" || slotPos === "RW") && player.pos.some((pos) => pos === "RM" || pos === "RW")) return true;
    if (slotPos === "CM" && player.pos.some((pos) => midfieldCentrePositions.includes(pos))) return true;
    if (player.pos.includes("CM") && (slotPos === "CDM" || slotPos === "CAM")) return true;
    return false;
  }

  function isForceableMidfielder(player) {
    return Boolean(player && Array.isArray(player.pos) && player.pos.some((pos) => midfieldPositions.includes(pos)));
  }

  function midfielderForcedPenalty(playerPositions, slotPos) {
    if (slotPos === "GK") return 50;
    if (midfieldPositions.includes(slotPos)) return 3;
    if (!defensivePositions.includes(slotPos)) return 10;
    const originalPositions = (playerPositions || []).filter((pos) => midfieldPositions.includes(pos));
    return originalPositions.reduce((best, pos) => (
      Math.min(best, midfielderDefensivePenalties[pos]?.[slotPos] ?? 18)
    ), 18);
  }

  window.G38PositionFit = {
    canPlaySlot,
    isForceableMidfielder,
    midfielderForcedPenalty
  };
})();
