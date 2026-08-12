const fs = require("fs");
const vm = require("vm");

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync("position-fit.js", "utf8"), context, { filename: "position-fit.js" });

const { canPlaySlot, isForceableMidfielder, midfielderForcedPenalty } = context.window.G38PositionFit;
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(canPlaySlot({ pos: ["CDM"] }, "CM"), "CDM should fit CM normally");
assert(canPlaySlot({ pos: ["CM"] }, "CAM"), "CM should fit CAM normally");
assert(!canPlaySlot({ pos: ["CDM"] }, "CAM"), "CDM should not fit CAM normally");
assert(canPlaySlot({ pos: ["LM"] }, "LW"), "LM should fit LW normally");
assert(canPlaySlot({ pos: ["RW"] }, "RM"), "RW should fit RM normally");
assert(canPlaySlot({ pos: ["LB"] }, "LWB"), "LB should fit LWB normally");
assert(canPlaySlot({ pos: ["LWB"] }, "LB"), "LWB should fit LB normally");
assert(canPlaySlot({ pos: ["RB"] }, "RWB"), "RB should fit RWB normally");
assert(canPlaySlot({ pos: ["RWB"] }, "RB"), "RWB should fit RB normally");
assert(!canPlaySlot({ pos: ["LB"] }, "RWB"), "Fullbacks should not cross sides");
assert(isForceableMidfielder({ pos: ["LM"] }), "LM should be forceable");
assert(!isForceableMidfielder({ pos: ["LW"] }), "A pure LW should not be treated as a forceable midfielder");

assert(midfielderForcedPenalty(["CDM"], "CAM") === 3, "Forced midfield placement should cost 3");
assert(midfielderForcedPenalty(["CM"], "GK") === 50, "Forced goalkeeper placement should cost 50");
assert(midfielderForcedPenalty(["CDM"], "CB") === 5, "CDM to CB should cost 5");
assert(midfielderForcedPenalty(["CAM"], "CB") === 15, "CAM to CB should cost 15");
assert(midfielderForcedPenalty(["LM"], "LWB") === 3, "LM to LWB should cost 3");
assert(midfielderForcedPenalty(["LM"], "RWB") === 16, "LM to opposite RWB should cost 16");
assert(midfielderForcedPenalty(["CAM", "CDM"], "CB") === 5, "Multi-position players should use the best original fit");
assert(midfielderForcedPenalty(["CM"], "ST") === 10, "Forced forward placement should cost 10");

console.log("Position fit rules: PASS");
