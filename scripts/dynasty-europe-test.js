const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const core = require("../src/simulation-core.js");

const context = {};
vm.createContext(context);
["src/data.js", "src/big-five.js", "src/big-five-italy.js", "src/big-five-germany.js", "src/big-five-france.js", "src/european-clubs.js", "src/season-standings.js"].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context);
});
vm.runInContext(
  "globalThis.__data = { clubs: CLUBS, entries: EUROPE_2026_27, associations: EUROPEAN_CLUB_ASSOCIATIONS, coefficients: EUROPEAN_ASSOCIATION_COEFFICIENTS, standings: HISTORICAL_STANDINGS };",
  context
);

const data = context.__data;
const bigFive = new Set(["eng", "esp", "ita", "ger", "fra"]);
const competitions = ["UCL", "UEL", "UECL"];
const seasons = ["1994-95", "2003-04", "2015-16", "2023-24"];
const nonBigFiveTargets = { UCL: 12, UEL: 18, UECL: 24 };
const seededNonBigFiveAssociations = { UCL: 10, UEL: 15, UECL: 20 };

function buildBigFiveSlotPlan(pools, competition) {
  const associations = Object.keys(pools).filter((association) => bigFive.has(association));
  const coefficients = Object.fromEntries(associations.map((association) => [
    association,
    data.coefficients[association] || data.coefficients.other
  ]));
  const offsets = Object.fromEntries(associations.map((association) => [association, 0]));
  let selectedSlots = null;
  competitions.forEach((currentCompetition) => {
    const availablePools = Object.fromEntries(associations.map((association) => [
      association,
      pools[association].slice(offsets[association])
    ]));
    const slots = core.allocateWeightedAssociationSlots(
      availablePools,
      coefficients,
      35 - nonBigFiveTargets[currentCompetition],
      associations.length
    );
    if (currentCompetition === competition) {
      selectedSlots = { slots, offsets: { ...offsets } };
    }
    associations.forEach((association) => {
      offsets[association] += Number(slots[association] || 0);
    });
  });
  return selectedSlots || { slots: {}, offsets };
}

function associationForEntry(entry) {
  if (entry.association) return entry.association;
  if (entry.id && data.clubs[entry.id]?.league) return data.clubs[entry.id].league;
  return data.associations[entry.profile || entry.name] || "other";
}

function buildPools(season, competition) {
  const pools = {};
  const add = (association, name) => {
    pools[association] ||= [];
    if (!pools[association].some((candidate) => candidate.name === name)) {
      pools[association].push({ name, association });
    }
  };
  bigFive.forEach((association) => {
    (data.standings[season][association] || []).forEach((name) => add(association, name));
  });
  (data.entries[competition] || []).forEach((entry) => {
    const association = associationForEntry(entry);
    if (!bigFive.has(association)) add(association, entry.name);
  });
  return pools;
}

seasons.forEach((season) => {
  const seasonSelections = {};
  competitions.forEach((competition) => {
    const pools = buildPools(season, competition);
    const selected = [];
    const bigFivePlan = buildBigFiveSlotPlan(pools, competition);
    const selectGroup = (associations, totalSlots, seededCount, rankOffsets = {}) => {
      const groupPools = Object.fromEntries(associations.map((association) => [
        association,
        pools[association].slice(Number(rankOffsets[association] || 0))
      ]));
      const coefficients = Object.fromEntries(associations.map((association) => [
        association,
        data.coefficients[association] || data.coefficients.other
      ]));
      const slots = core.allocateWeightedAssociationSlots(groupPools, coefficients, totalSlots, seededCount);
      Object.entries(slots).forEach(([association, count]) => {
        selected.push(...groupPools[association].slice(0, count));
      });
    };
    const bigFiveAssociations = Object.keys(pools).filter((association) => bigFive.has(association));
    const nonBigFiveAssociations = Object.keys(pools).filter((association) => !bigFive.has(association));
    selectGroup(
      bigFiveAssociations,
      35 - nonBigFiveTargets[competition],
      bigFiveAssociations.length,
      bigFivePlan.offsets
    );
    selectGroup(
      nonBigFiveAssociations,
      nonBigFiveTargets[competition],
      Math.min(nonBigFiveAssociations.length, seededNonBigFiveAssociations[competition])
    );
    const selectedNames = selected.map((candidate) => candidate.name);
    const nonBigFiveCount = selected.filter((candidate) => !bigFive.has(candidate.association)).length;
    assert.strictEqual(selected.length, 35, `${season} ${competition} should select 35 clubs.`);
    assert.strictEqual(new Set(selectedNames).size, 35, `${season} ${competition} has duplicate clubs.`);
    assert.strictEqual(nonBigFiveCount, nonBigFiveTargets[competition],
      `${season} ${competition} should reserve ${nonBigFiveTargets[competition]} non-Big-Five clubs.`);
    seasonSelections[competition] = new Set(selectedNames);
    competitions.filter((otherCompetition) => otherCompetition !== competition && seasonSelections[otherCompetition])
      .forEach((otherCompetition) => {
        const overlap = [...seasonSelections[competition]].filter((name) => seasonSelections[otherCompetition].has(name));
        assert.strictEqual(overlap.length, 0,
          `${season} ${competition} overlaps ${otherCompetition}: ${overlap.join(", ")}`);
      });
    console.log(`${season} ${competition}: PASS (${nonBigFiveCount} non-Big-Five clubs)`);
  });
});

const sampleSlots = core.allocateWeightedAssociationSlots(
  { high: [1, 2, 3], mid: [1, 2], low: [1, 2] },
  { high: 100, mid: 60, low: 20 },
  5,
  2
);
assert.strictEqual(sampleSlots.high + sampleSlots.mid + sampleSlots.low, 5, "Weighted allocation should fill all slots.");
assert(sampleSlots.high >= sampleSlots.mid, "Higher coefficients should not receive fewer slots than lower coefficients.");
console.log("Weighted association allocation: PASS");
