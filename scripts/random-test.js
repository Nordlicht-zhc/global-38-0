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

console.log("Seed replay: PASS");
console.log("Persisted-state resume: PASS");
console.log(`Distribution buckets: ${buckets.join(", ")}`);
