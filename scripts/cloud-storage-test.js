"use strict";

const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("src/cloud-storage.js", "utf8");
const context = {
  window: { G38CloudConfig: { url: "", publishableKey: "" } },
  console,
  setTimeout,
  clearTimeout
};
vm.createContext(context);
vm.runInContext(source, context);

context.window.G38Cloud.initialize().then((result) => {
  if (result.configured || result.user) throw new Error("Cloud fallback should remain disabled without credentials.");
  console.log("Cloud disabled fallback: PASS");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
