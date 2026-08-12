const assert = require("assert");
const core = require("../simulation-core.js");

const seed = core.hashSeed("g38-random-regression");
const first = core.makeRng(seed);
const second = core.makeRng(seed);
const sequenceA = Array.from({ length: 1000 }, () => first());
const sequenceB = Array.from({ length: 1000 }, () => second());
assert.deepStrictEqual(sequenceA, sequenceB, "Equal seeds must produce equal sequences.");

let persistedState = seed;
const resumedValues = [];
for (let index = 0; index < 1000; index += 1) {
  persistedState = core.nextRandomState(persistedState);
  resumedValues.push(persistedState / 4294967296);
}
assert.deepStrictEqual(sequenceA, resumedValues, "Persisted state must resume the same sequence.");

const distribution = core.makeRng(core.hashSeed("g38-random-distribution"));
const buckets = Array(10).fill(0);
for (let index = 0; index < 100000; index += 1) buckets[Math.floor(distribution() * buckets.length)] += 1;
buckets.forEach((count, index) => {
  assert(Math.abs(count - 10000) < 500, `Bucket ${index} is unexpectedly imbalanced: ${count}.`);
});

const challengeSchedule = [
  { home: "AI A", away: "AI B" },
  { home: "AI C", away: "AI D" },
  { home: "AI A", away: "我的球队" },
  { home: "AI B", away: "AI C" },
  { home: "我的球队", away: "AI D" }
];
const simulatedAiFixtures = [];
let scheduleIndex = core.advanceAiFixtures(
  challengeSchedule,
  0,
  (fixture) => simulatedAiFixtures.push(fixture),
  { endIndex: 2 }
);
assert.strictEqual(scheduleIndex, 2, "The transfer checkpoint must stop AI fixture advancement.");
scheduleIndex = core.advanceAiFixtures(
  challengeSchedule,
  scheduleIndex,
  (fixture) => simulatedAiFixtures.push(fixture)
);
assert.strictEqual(scheduleIndex, 2, "After an automatic transfer skip, advancement must stop at the next user fixture.");
scheduleIndex += 1;
scheduleIndex = core.advanceAiFixtures(
  challengeSchedule,
  scheduleIndex,
  (fixture) => simulatedAiFixtures.push(fixture)
);
assert.strictEqual(scheduleIndex, 4, "AI fixtures after the checkpoint must not consume a user match.");
assert.strictEqual(simulatedAiFixtures.length, 3, "Every AI-only fixture before the next user match must be simulated exactly once.");

console.log("Seed replay: PASS");
console.log("Persisted-state resume: PASS");
console.log("Challenge transfer resume: PASS");
console.log(`Distribution buckets: ${buckets.join(", ")}`);
