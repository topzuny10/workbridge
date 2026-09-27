const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow } = require("electron");

app.whenReady().then(async () => {
  const window = new BrowserWindow({ width: 1024, height: 1024, show: false, webPreferences: { offscreen: true } });
  await window.loadFile(path.join(__dirname, "..", "build", "icon.svg"));
  const image = await window.webContents.capturePage();
  fs.writeFileSync(path.join(__dirname, "..", "build", "icon.png"), image.toPNG());
  app.quit();
});
