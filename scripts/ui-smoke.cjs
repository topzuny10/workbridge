const fs = require("node:fs");
const path = require("node:path");
const { app, BrowserWindow, ipcMain } = require("electron");

app.whenReady().then(async () => {
  const language = process.env.WORKBRIDGE_SMOKE_LANGUAGE || "ko";
  ipcMain.handle("state:get", () => ({ imports: [], preferences: { language, theme: "system", cloudServerUrl: "https://cloud.example.com" }, detectedCodexPath: null, cloud: { authenticated: false, user: null, serverUrl: "https://cloud.example.com" } }));
  ipcMain.handle("preferences:set", (_event, preferences) => preferences);
  ipcMain.handle("codex:detect", () => ({ path: "/usr/lib/chatgpt/resources/codex" }));
  const window = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false,
    webPreferences: { preload: path.join(__dirname, "..", "src", "preload.cjs"), contextIsolation: true, nodeIntegration: false }
  });
  await window.loadFile(path.join(__dirname, "..", "src", "renderer", "index.html"));
  if (process.env.WORKBRIDGE_SMOKE_VIEW === "sidebar") {
    await window.webContents.executeJavaScript("if (document.documentElement.dataset.sidebar !== 'collapsed') document.querySelector('#toggle-sidebar').click(); true");
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW === "cloud") {
    await window.webContents.executeJavaScript("document.querySelector('[data-view=cloud]').click(); document.querySelector('#transcript button')?.click(); true");
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW === "delete") {
    await window.webContents.executeJavaScript("document.querySelector('#delete-selected').disabled = false; document.querySelector('#delete-selected').click(); true");
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW === "source") {
    // Source picker is the initial view.
  } else {
    window.webContents.send("settings:open");
  }
  await new Promise((resolve) => setTimeout(resolve, 350));
  if (process.env.WORKBRIDGE_SMOKE_DETECT === "1") {
    await window.webContents.executeJavaScript("document.querySelector('#detect-codex').click(); true");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const detectedPath = await window.webContents.executeJavaScript("document.querySelector('#codex-path').value");
    if (!detectedPath.endsWith("/codex")) throw new Error("Codex path was not shown after detection");
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (process.env.WORKBRIDGE_SMOKE_VIEW === "sidebar") {
    const collapsed = await window.webContents.executeJavaScript("document.documentElement.dataset.sidebar === 'collapsed'");
    if (!collapsed) throw new Error("Sidebar did not collapse");
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW === "delete") {
    const dialogState = await window.webContents.executeJavaScript(`(() => {
      const dialog = document.querySelector('#delete-backdrop');
      const warning = document.querySelector('#delete-warning');
      const button = document.querySelector('#confirm-delete');
      return { hidden: dialog.hidden, warning: warning.textContent, warningColor: getComputedStyle(warning).color, buttonColor: getComputedStyle(button).backgroundColor };
    })()`);
    if (dialogState.hidden || !dialogState.warning || dialogState.warningColor === dialogState.buttonColor) throw new Error(`Delete dialog did not render correctly: ${JSON.stringify(dialogState)}`);
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW === "source") {
    const overflow = await window.webContents.executeJavaScript(`[...document.querySelectorAll('.source-card')].some((card) => {
      const cardRect = card.getBoundingClientRect();
      const textRect = card.lastElementChild.getBoundingClientRect();
      return textRect.right > cardRect.right || textRect.bottom > cardRect.bottom;
    })`);
    if (overflow) throw new Error("Source card text overflowed its bounds");
  } else if (process.env.WORKBRIDGE_SMOKE_VIEW !== "cloud") {
    const settingsState = await window.webContents.executeJavaScript(`(() => {
      const node = document.querySelector('#settings-backdrop');
      const rect = node.getBoundingClientRect();
      return { hidden: node.hidden, display: getComputedStyle(node).display, width: rect.width, height: rect.height };
    })()`);
    if (settingsState.hidden || settingsState.display === "none" || settingsState.width < 400) throw new Error(`Settings dialog did not open: ${JSON.stringify(settingsState)}`);
  }
  const image = await window.webContents.capturePage();
  fs.writeFileSync(process.env.WORKBRIDGE_SCREENSHOT || path.join(__dirname, "ui-smoke.png"), image.toPNG());
  app.quit();
});
