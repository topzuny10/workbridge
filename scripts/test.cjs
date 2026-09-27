const fs = require("node:fs");
const path = require("node:path");

const testDirectory = path.join(__dirname, "..", "test");
for (const name of fs.readdirSync(testDirectory).filter((item) => item.endsWith(".test.cjs")).sort()) {
  require(path.join(testDirectory, name));
}
