const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { app, BrowserWindow, Menu, clipboard, dialog, ipcMain, shell } = require("electron");
const { AppServerClient, normalizeThread, resolveCodexCommand } = require("./lib/app-server.cjs");
const { readChatGptExport } = require("./lib/chatgpt-export.cjs");
const { listClaudeChats, readClaudeChat } = require("./lib/claude-chats.cjs");
const { listCursorChats, readCursorChat } = require("./lib/cursor-chats.cjs");
const { createBundle, restoreProject } = require("./lib/bundle.cjs");
const { CloudClient } = require("./lib/cloud-client.cjs");
const { Store } = require("./lib/store.cjs");

let store;
let appServer;
let detectedCodexPath = null;
let cloudClient = null;
let sourceChats = new Map();
const restoredProjects = new Map();

const menuText = {
  ko: {
    file: "파일", edit: "편집", view: "보기", window: "윈도우", settings: "설정", help: "도움말", quit: "종료", undo: "실행 취소", redo: "다시 실행",
    cut: "잘라내기", copy: "복사", paste: "붙여넣기", selectAll: "전체 선택", reload: "새로고침", forceReload: "강제 새로고침", devTools: "개발자 도구",
    resetZoom: "기본 크기", zoomIn: "확대", zoomOut: "축소", fullscreen: "전체 화면", minimize: "최소화", zoom: "확대/복원", close: "닫기"
  },
  en: {
    file: "File", edit: "Edit", view: "View", window: "Window", settings: "Settings", help: "Help", quit: "Quit", undo: "Undo", redo: "Redo",
    cut: "Cut", copy: "Copy", paste: "Paste", selectAll: "Select All", reload: "Reload", forceReload: "Force Reload", devTools: "Developer Tools",
    resetZoom: "Actual Size", zoomIn: "Zoom In", zoomOut: "Zoom Out", fullscreen: "Full Screen", minimize: "Minimize", zoom: "Zoom", close: "Close"
  }
};

const mainText = {
  ko: {
    chatgptExport: "ChatGPT 데이터 export 선택", chatgptExportFilter: "ChatGPT export", saveBundle: "이동 묶음 저장", bundleFilter: "WorkBridge 묶음",
    importBundle: "WorkBridge 묶음 가져오기", restoreFolder: "프로젝트를 복원할 상위 폴더 선택", codexFolder: "Codex 작업 폴더 선택", chatNotFound: "대화를 찾지 못했습니다.",
    user: "사용자", assistant: "도우미", system: "시스템", defaultCodexTitle: "Codex 작업", chatgptContinuation: "다음은 다른 환경에서 이전한 대화입니다. 이 문맥을 유지해 이어가세요.",
    providerExport: "대화 데이터 export 선택", providerFilter: "대화 export", deleteExportTitle: "내보낸 묶음 삭제", deleteExportQuestion: "선택한 .workbridge 파일을 영구 삭제할까요?", deleteImportTitle: "가져온 묶음 삭제", deleteImportQuestion: "가져온 묶음과 앱에 저장된 복사본을 삭제할까요?", deleteCloudTitle: "클라우드 파일 삭제", deleteCloudQuestion: "암호화된 클라우드 파일을 영구 삭제할까요?", deleteSourceUnsupported: "현재 원본 영구 삭제는 Codex 작업만 지원합니다.", invalidCodexPath: "실행 가능한 Codex 파일 경로가 아닙니다.", delete: "삭제", cancel: "취소"
  },
  en: {
    chatgptExport: "Select ChatGPT data export", chatgptExportFilter: "ChatGPT export", saveBundle: "Save transfer bundle", bundleFilter: "WorkBridge bundle",
    importBundle: "Import WorkBridge bundle", restoreFolder: "Select a parent folder for the restored project", codexFolder: "Select a Codex project folder", chatNotFound: "Conversation not found.",
    user: "User", assistant: "Assistant", system: "System", defaultCodexTitle: "Codex task", chatgptContinuation: "The following conversation was transferred from another environment. Continue while preserving this context.",
    providerExport: "Select conversation data export", providerFilter: "Conversation export", deleteExportTitle: "Delete exported bundle", deleteExportQuestion: "Permanently delete the selected .workbridge file?", deleteImportTitle: "Delete imported bundle", deleteImportQuestion: "Delete the imported bundle and the copy stored by the app?", deleteCloudTitle: "Delete cloud file", deleteCloudQuestion: "Permanently delete the encrypted cloud file?", deleteSourceUnsupported: "Permanent source deletion currently supports Codex tasks only.", invalidCodexPath: "This is not an executable Codex file path.", delete: "Delete", cancel: "Cancel"
  }
};

function mainT(key) {
  const language = store?.getPreferences().language || "ko";
  return mainText[language]?.[key] || mainText.ko[key] || key;
}

function buildMenu() {
  const labels = menuText[store?.getPreferences().language] || menuText.ko;
  const template = [
    { label: labels.file, submenu: [{ label: labels.quit, role: "quit" }] },
    { label: labels.edit, submenu: [{ label: labels.undo, role: "undo" }, { label: labels.redo, role: "redo" }, { type: "separator" }, { label: labels.cut, role: "cut" }, { label: labels.copy, role: "copy" }, { label: labels.paste, role: "paste" }, { label: labels.selectAll, role: "selectAll" }] },
    { label: labels.view, submenu: [{ label: labels.reload, role: "reload" }, { label: labels.forceReload, role: "forceReload" }, { label: labels.devTools, role: "toggleDevTools" }, { type: "separator" }, { label: labels.resetZoom, role: "resetZoom" }, { label: labels.zoomIn, role: "zoomIn" }, { label: labels.zoomOut, role: "zoomOut" }, { type: "separator" }, { label: labels.fullscreen, role: "togglefullscreen" }] },
    { label: labels.window, submenu: [{ label: labels.minimize, role: "minimize" }, { label: labels.zoom, role: "zoom" }, { label: labels.close, role: "close" }] },
    { label: labels.settings, submenu: [{ label: labels.settings, accelerator: "CmdOrCtrl+Shift+S", click: () => BrowserWindow.getFocusedWindow()?.webContents.send("settings:open") }] },
    { label: labels.help, submenu: [] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function publicChat(chat) {
  return {
    id: chat.id,
    kind: chat.kind,
    title: chat.title,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    cwd: chat.cwd,
    messageCount: chat.messages?.length || 0,
    preview: chat.messages?.find((message) => message.role === "user")?.content?.slice(0, 180) || ""
  };
}

function transcript(chat) {
  return chat.messages.map((message) => {
    const label = message.role === "user" ? mainT("user") : message.role === "assistant" ? mainT("assistant") : mainT("system");
    return `## ${label}\n\n${message.content}`;
  }).join("\n\n---\n\n");
}

function safeFolderName(value, fallback) {
  const cleaned = String(value || "").replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/^\.+|\.+$/g, "").trim();
  return cleaned.slice(0, 80) || fallback;
}

function continuationWorkspace(record, manifest, chat) {
  const root = path.join(app.getPath("documents"), "WorkBridge", record.id);
  fs.mkdirSync(root, { recursive: true });
  if (chat.projectId) {
    const project = manifest.projects.find((item) => item.id === chat.projectId);
    if (project) {
      const target = path.join(root, safeFolderName(project.name, `project-${project.id}`));
      if (!fs.existsSync(target)) restoreProject({ bundlePath: record.bundlePath, projectId: project.id, destinationParent: root });
      restoredProjects.set(`${record.id}:${project.id}`, target);
      return target;
    }
  }
  const target = path.join(root, safeFolderName(chat.title, `chat-${String(chat.id).slice(0, 12)}`));
  fs.mkdirSync(target, { recursive: true });
  return target;
}

async function loadCodexThreads() {
  if (!appServer) {
    appServer = new AppServerClient(detectedCodexPath || store.getPreferences().codexPath || undefined, store.getPreferences().language);
    detectedCodexPath = appServer.command;
  }
  const threads = await appServer.listThreads();
  for (const thread of threads) {
    sourceChats.set(thread.id, {
      id: thread.id,
      kind: "codex",
      title: thread.name || thread.preview || mainT("defaultCodexTitle"),
      createdAt: thread.createdAt ? new Date(thread.createdAt * 1000).toISOString() : null,
      updatedAt: thread.updatedAt ? new Date(thread.updatedAt * 1000).toISOString() : null,
      cwd: thread.cwd || null,
      messages: [],
      unloaded: true
    });
  }
  return threads.map((thread) => publicChat(sourceChats.get(thread.id)));
}

async function hydrateChat(chat) {
  if (chat.kind === "codex" && chat.unloaded) {
    const full = normalizeThread(await appServer.readThread(chat.id), store.getPreferences().language);
    sourceChats.set(chat.id, full);
    return full;
  }
  if (chat.kind === "cursor" && chat.unloaded) {
    const full = readCursorChat(chat, store.getPreferences().language);
    sourceChats.set(chat.id, full);
    return full;
  }
  if (chat.kind === "claude" && chat.unloaded) {
    const full = readClaudeChat(chat, store.getPreferences().language);
    sourceChats.set(chat.id, full);
    return full;
  }
  return chat;
}

function registerIpc() {
  ipcMain.handle("state:get", () => ({ imports: store.listImports(), preferences: store.getPreferences(), detectedCodexPath, cloud: cloudClient?.state() || { authenticated: false, user: null, serverUrl: store.getPreferences().cloudServerUrl } }));
  ipcMain.handle("preferences:set", (_event, preferences) => {
    const previousCloudUrl = store.getPreferences().cloudServerUrl;
    const saved = store.setPreferences(preferences);
    if (saved.cloudServerUrl !== previousCloudUrl) cloudClient = null;
    appServer?.close();
    appServer = null;
    buildMenu();
    return saved;
  });
  ipcMain.handle("codex:detect", () => {
    detectedCodexPath = resolveCodexCommand(process.env, process.platform, store.getPreferences().language);
    store.setPreferences({ ...store.getPreferences(), codexPath: detectedCodexPath });
    appServer?.close();
    appServer = null;
    return { path: detectedCodexPath };
  });
  ipcMain.handle("codex:set-path", (_event, value) => {
    const candidate = path.resolve(String(value || "").trim());
    try {
      fs.accessSync(candidate, process.platform === "win32" ? fs.constants.F_OK : fs.constants.X_OK);
    } catch {
      throw new Error(mainT("invalidCodexPath"));
    }
    detectedCodexPath = candidate;
    store.setPreferences({ ...store.getPreferences(), codexPath: candidate });
    appServer?.close();
    appServer = null;
    return { path: candidate };
  });
  ipcMain.handle("source:codex", () => loadCodexThreads());
  ipcMain.handle("source:cursor", () => {
    const chats = listCursorChats({ language: store.getPreferences().language });
    for (const chat of chats) sourceChats.set(chat.id, chat);
    return chats.map(publicChat);
  });
  ipcMain.handle("source:claude", () => {
    const chats = listClaudeChats({ language: store.getPreferences().language });
    for (const chat of chats) sourceChats.set(chat.id, chat);
    return chats.map(publicChat);
  });
  ipcMain.handle("source:chatgpt", async () => {
    const result = await dialog.showOpenDialog({
      title: mainT("chatgptExport"),
      properties: ["openFile"],
      filters: [{ name: mainT("chatgptExportFilter"), extensions: ["zip", "json"] }]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const chats = readChatGptExport(result.filePaths[0]);
    for (const chat of chats) sourceChats.set(chat.id, chat);
    return chats.map(publicChat);
  });
  ipcMain.handle("source:list", () => [...sourceChats.values()].map(publicChat));
  ipcMain.handle("source:delete", async (_event, chatIds) => {
    const chats = [...new Set(chatIds || [])].map((id) => sourceChats.get(id)).filter(Boolean);
    if (!chats.length) return { deletedIds: [] };
    if (chats.some((chat) => chat.kind !== "codex")) throw new Error(mainT("deleteSourceUnsupported"));
    appServer ||= new AppServerClient(detectedCodexPath || store.getPreferences().codexPath || undefined, store.getPreferences().language);
    for (const chat of chats) {
      await appServer.deleteThread(chat.id);
      sourceChats.delete(chat.id);
    }
    return { deletedIds: chats.map((chat) => chat.id) };
  });
  ipcMain.handle("source:read", async (_event, chatId) => {
    const chat = sourceChats.get(chatId);
    if (!chat) throw new Error(mainT("chatNotFound"));
    return hydrateChat(chat);
  });
  ipcMain.handle("bundle:create", async (_event, { chatIds, includeProjects }) => {
    const result = await dialog.showSaveDialog({
      title: mainT("saveBundle"),
      defaultPath: `WorkBridge-${new Date().toISOString().slice(0, 10)}.workbridge`,
      filters: [{ name: mainT("bundleFilter"), extensions: ["workbridge"] }]
    });
    if (result.canceled || !result.filePath) return null;
    const chats = [];
    for (const id of chatIds) {
      const chat = sourceChats.get(id);
      if (chat) chats.push(await hydrateChat(chat));
    }
    const manifest = createBundle({ destination: result.filePath, chats, includeProjects });
    return { path: result.filePath, chatCount: manifest.chats.length, projectCount: manifest.projects.length };
  });
  ipcMain.handle("cloud:authenticate", async (_event, { mode, email, password, passphrase }) => {
    const client = new CloudClient(store.getPreferences().cloudServerUrl);
    const user = await client.authenticate(mode, { email, password, passphrase });
    cloudClient = client;
    return { user, state: client.state(), bundles: await client.list() };
  });
  ipcMain.handle("cloud:logout", () => {
    cloudClient?.logout();
    cloudClient = null;
    return { authenticated: false, user: null, serverUrl: store.getPreferences().cloudServerUrl };
  });
  ipcMain.handle("cloud:list", () => {
    if (!cloudClient) throw new Error("Cloud sign-in required.");
    return cloudClient.list();
  });
  ipcMain.handle("cloud:upload", async (_event, { chatIds, includeProjects }) => {
    if (!cloudClient) throw new Error("Cloud sign-in required.");
    const chats = [];
    for (const id of chatIds) {
      const chat = sourceChats.get(id);
      if (chat) chats.push(await hydrateChat(chat));
    }
    if (!chats.length) throw new Error(mainT("chatNotFound"));
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-cloud-"));
    const bundlePath = path.join(temporaryDirectory, "upload.workbridge");
    try {
      const manifest = createBundle({ destination: bundlePath, chats, includeProjects });
      const record = await cloudClient.upload(bundlePath, `${chats.length} chats · ${new Date().toISOString().slice(0, 10)}`);
      return { record, chatCount: manifest.chats.length, projectCount: manifest.projects.length, bundles: await cloudClient.list() };
    } finally { fs.rmSync(temporaryDirectory, { recursive: true, force: true }); }
  });
  ipcMain.handle("cloud:download", async (_event, cloudId) => {
    if (!cloudClient) throw new Error("Cloud sign-in required.");
    const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-cloud-"));
    const bundlePath = path.join(temporaryDirectory, "download.workbridge");
    try {
      await cloudClient.download(cloudId, bundlePath);
      const { record, alreadyImported } = store.importBundle(bundlePath);
      return { record, alreadyImported, imports: store.listImports() };
    } finally { fs.rmSync(temporaryDirectory, { recursive: true, force: true }); }
  });
  ipcMain.handle("cloud:delete", async (_event, cloudId) => {
    if (!cloudClient) throw new Error("Cloud sign-in required.");
    const confirmation = await dialog.showMessageBox({ type: "warning", title: mainT("deleteCloudTitle"), message: mainT("deleteCloudQuestion"), buttons: [mainT("cancel"), mainT("delete")], defaultId: 0, cancelId: 0 });
    if (confirmation.response !== 1) return null;
    await cloudClient.delete(cloudId);
    return { bundles: await cloudClient.list() };
  });
  ipcMain.handle("bundle:import", async () => {
    const result = await dialog.showOpenDialog({
      title: mainT("importBundle"),
      properties: ["openFile"],
      filters: [{ name: mainT("bundleFilter"), extensions: ["workbridge"] }]
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const { record, alreadyImported } = store.importBundle(result.filePaths[0]);
    return { record, alreadyImported, imports: store.listImports() };
  });
  ipcMain.handle("bundle:delete-export", async () => {
    const selected = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "WorkBridge", extensions: ["workbridge"] }] });
    if (selected.canceled || !selected.filePaths[0]) return null;
    const filePath = selected.filePaths[0];
    const confirmation = await dialog.showMessageBox({ type: "warning", title: mainT("deleteExportTitle"), message: mainT("deleteExportQuestion"), buttons: [mainT("cancel"), mainT("delete")], defaultId: 0, cancelId: 0 });
    if (confirmation.response !== 1) return null;
    fs.rmSync(filePath);
    return { path: filePath };
  });
  ipcMain.handle("import:read", (_event, importId) => store.getImport(importId));
  ipcMain.handle("import:delete", async (_event, importId) => {
    const confirmation = await dialog.showMessageBox({ type: "warning", title: mainT("deleteImportTitle"), message: mainT("deleteImportQuestion"), buttons: [mainT("cancel"), mainT("delete")], defaultId: 0, cancelId: 0 });
    if (confirmation.response !== 1) return null;
    store.deleteImport(importId);
    return { imports: store.listImports() };
  });
  ipcMain.handle("project:restore", async (_event, { importId, projectId }) => {
    const selected = await dialog.showOpenDialog({
      title: mainT("restoreFolder"),
      properties: ["openDirectory", "createDirectory"]
    });
    if (selected.canceled || !selected.filePaths[0]) return null;
    const { record } = store.getImport(importId);
    const target = restoreProject({ bundlePath: record.bundlePath, projectId, destinationParent: selected.filePaths[0] });
    restoredProjects.set(`${importId}:${projectId}`, target);
    return target;
  });
  ipcMain.handle("chat:continue-codex", async (_event, { importId, chatId }) => {
    const { record, manifest } = store.getImport(importId);
    const chat = manifest.chats.find((item) => item.id === chatId);
    if (!chat) throw new Error(mainT("chatNotFound"));
    const cwd = chat.projectId && restoredProjects.get(`${importId}:${chat.projectId}`)
      || continuationWorkspace(record, manifest, chat);
    const contextDirectory = path.join(cwd, ".workbridge");
    fs.mkdirSync(contextDirectory, { recursive: true });
    const safeId = String(chat.id).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80);
    const transcriptPath = path.join(contextDirectory, `${safeId}.md`);
    fs.writeFileSync(transcriptPath, `# ${chat.title}\n\n${transcript(chat)}\n`, "utf8");
    appServer ||= new AppServerClient(detectedCodexPath || undefined, store.getPreferences().language);
    const threadId = await appServer.createContinuation({ title: chat.title, cwd, transcriptPath });
    await shell.openExternal(`codex://threads/${encodeURIComponent(threadId)}`);
    return { threadId, transcriptPath, workspacePath: cwd, codexPath: appServer.command };
  });
  ipcMain.handle("chat:continue-web", async (_event, { importId, chatId }) => {
    const { manifest } = store.getImport(importId);
    const chat = manifest.chats.find((item) => item.id === chatId);
    if (!chat) throw new Error(mainT("chatNotFound"));
    clipboard.writeText(`${mainT("chatgptContinuation")}\n\n# ${chat.title}\n\n${transcript(chat)}`);
    const urls = { chatgpt: "https://chatgpt.com/", cursor: "https://cursor.com/" };
    await shell.openExternal(urls[chat.kind] || urls.chatgpt);
    return { provider: chat.kind };
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1380,
    height: 880,
    minWidth: 980,
    minHeight: 680,
    backgroundColor: "#f3f3ef",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.loadFile(path.join(__dirname, "renderer", "index.html"));
}

app.whenReady().then(() => {
  store = new Store(app.getPath("userData"));
  detectedCodexPath = store.getPreferences().codexPath || null;
  registerIpc();
  buildMenu();
  createWindow();
  app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
});

app.on("before-quit", () => appServer?.close());
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
