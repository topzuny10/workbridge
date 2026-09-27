const { execFileSync, spawn } = require("node:child_process");
const readline = require("node:readline");
const fs = require("node:fs");
const path = require("node:path");

const serverText = {
  ko: {
    notFound: "Codex 실행 파일을 자동으로 찾지 못했습니다. Codex 데스크톱 앱 또는 CLI가 설치되어 있는지 확인하세요.",
    exited: "Codex app-server가 종료되었습니다 ({code}).", failed: "Codex 요청 실패", timeout: "{method} 요청 시간이 초과되었습니다.",
    movedSuffix: "이전됨", continuation: "다른 환경에서 이전된 작업입니다. {path} 파일의 기존 대화와 작업 문맥을 읽고, 내용을 보존한 상태로 대기하세요. 파일을 수정하지 마세요.", defaultTitle: "Codex 작업"
  },
  en: {
    notFound: "The Codex executable could not be detected. Make sure the Codex desktop app or CLI is installed.",
    exited: "Codex app-server exited ({code}).", failed: "Codex request failed", timeout: "The {method} request timed out.",
    movedSuffix: "Transferred", continuation: "This task was transferred from another environment. Read the existing conversation and work context in {path}, preserve that context, and wait for further instructions. Do not modify any files.", defaultTitle: "Codex task"
  }
};

function serverT(language, key, values = {}) {
  return (serverText[language]?.[key] || serverText.ko[key] || key).replace(/\{(\w+)\}/g, (_match, name) => values[name] ?? "");
}

function isExecutable(candidate, platform = process.platform) {
  if (!candidate) return false;
  try {
    fs.accessSync(candidate, platform === "win32" ? fs.constants.F_OK : fs.constants.X_OK);
    return true;
  } catch { return false; }
}

function candidateCodexPaths(environment = process.env, platform = process.platform) {
  const executable = platform === "win32" ? "codex.exe" : "codex";
  const candidates = [environment.WORKBRIDGE_CODEX_PATH];
  const home = environment.HOME || environment.USERPROFILE;
  if (platform === "linux") {
    // Prefer the desktop app's bundled server. PATH can contain an older Snap CLI
    // backed by a different task store, which makes valid desktop tasks look empty.
    if (home) {
      candidates.push(
        path.join(home, ".local", "share", "chatgpt", "resources", "codex"),
        path.join(home, ".local", "share", "codex", "resources", "codex")
      );
    }
    candidates.push(
      "/usr/lib/chatgpt/resources/codex",
      "/usr/lib/codex/resources/codex",
      "/usr/local/lib/chatgpt/resources/codex",
      "/opt/ChatGPT/resources/codex",
      "/opt/Codex/resources/codex"
    );
    if (home) candidates.push(path.join(home, ".local", "bin", "codex"), path.join(home, ".npm-global", "bin", "codex"), path.join(home, ".volta", "bin", "codex"), path.join(home, ".bun", "bin", "codex"));
  } else if (platform === "darwin") {
    if (home) {
      candidates.push(
        path.join(home, "Applications", "Codex.app", "Contents", "Resources", "codex"),
        path.join(home, "Applications", "ChatGPT.app", "Contents", "Resources", "codex")
      );
    }
    candidates.push(
      "/Applications/Codex.app/Contents/Resources/codex",
      "/Applications/ChatGPT.app/Contents/Resources/codex",
      "/opt/homebrew/bin/codex",
      "/usr/local/bin/codex"
    );
    if (home) candidates.push(path.join(home, ".local", "bin", "codex"), path.join(home, ".npm-global", "bin", "codex"), path.join(home, ".volta", "bin", "codex"), path.join(home, ".bun", "bin", "codex"));
  } else if (platform === "win32") {
    const roots = [environment.LOCALAPPDATA, environment.ProgramFiles, environment["ProgramFiles(x86)"]].filter(Boolean);
    for (const root of roots) {
      candidates.push(
        path.join(root, "Programs", "Codex", "resources", "codex.exe"),
        path.join(root, "Programs", "ChatGPT", "resources", "codex.exe"),
        path.join(root, "Codex", "resources", "codex.exe"),
        path.join(root, "ChatGPT", "resources", "codex.exe")
      );
    }
    if (environment.LOCALAPPDATA) {
      candidates.push(path.join(environment.LOCALAPPDATA, "Microsoft", "WindowsApps", "codex.exe"));
    }
  }
  const delimiter = platform === "win32" ? ";" : ":";
  for (const directory of String(environment.PATH || "").split(delimiter)) {
    if (directory && directory !== "/snap/bin") candidates.push(path.join(directory, executable));
  }
  if (platform === "linux") candidates.push("/snap/bin/codex");
  return [...new Set(candidates.filter(Boolean))];
}

function resolveFromLoginShell(environment, platform) {
  if (!["linux", "darwin"].includes(platform)) return null;
  const shell = environment.SHELL || (platform === "darwin" ? "/bin/zsh" : "/bin/bash");
  if (!isExecutable(shell, platform)) return null;
  try {
    const output = execFileSync(shell, ["-lc", "command -v codex"], {
      encoding: "utf8",
      env: environment,
      timeout: 3000
    });
    return output.split(/\r?\n/).map((line) => line.trim()).find((line) => path.isAbsolute(line) && isExecutable(line, platform)) || null;
  } catch { return null; }
}

function resolveCodexCommand(environment = process.env, platform = process.platform, language = "ko") {
  const command = candidateCodexPaths(environment, platform).find((candidate) => isExecutable(candidate, platform))
    || resolveFromLoginShell(environment, platform);
  if (!command) {
    throw new Error(serverT(language, "notFound"));
  }
  return command;
}

class AppServerClient {
  constructor(command, language = "ko") {
    this.language = language;
    this.command = command || resolveCodexCommand(process.env, process.platform, language);
    this.process = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  async start() {
    if (this.process && !this.process.killed) return;
    this.process = spawn(this.command, ["app-server"], { stdio: ["pipe", "pipe", "pipe"] });
    this.process.on("error", (error) => this.#rejectAll(error));
    this.process.on("exit", (code) => this.#rejectAll(new Error(serverT(this.language, "exited", { code }))));
    readline.createInterface({ input: this.process.stdout }).on("line", (line) => this.#handleLine(line));

    await this.request("initialize", {
      clientInfo: { name: "workbridge", title: "WorkBridge", version: "0.1.0" },
      capabilities: { experimentalApi: true }
    });
    this.notify("initialized", {});
  }

  #handleLine(line) {
    let message;
    try { message = JSON.parse(line); } catch { return; }
    if (message.id === undefined) return;
    const pending = this.pending.get(message.id);
    if (!pending) return;
    this.pending.delete(message.id);
    clearTimeout(pending.timer);
    if (message.error) pending.reject(new Error(message.error.message || serverT(this.language, "failed")));
    else pending.resolve(message.result);
  }

  #rejectAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }

  request(method, params = {}, timeoutMs = 20000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(serverT(this.language, "timeout", { method })));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.process.stdin.write(`${JSON.stringify({ method, id, params })}\n`);
    });
  }

  notify(method, params = {}) {
    this.process.stdin.write(`${JSON.stringify({ method, params })}\n`);
  }

  async listThreads() {
    await this.start();
    const threads = [];
    let cursor;
    do {
      const result = await this.request("thread/list", { limit: 100, cursor });
      threads.push(...(result.data || []));
      cursor = result.nextCursor || null;
    } while (cursor && threads.length < 1000);
    return threads;
  }

  async readThread(threadId) {
    await this.start();
    const result = await this.request("thread/read", { threadId, includeTurns: true }, 30000);
    return result.thread;
  }

  async deleteThread(threadId) {
    await this.start();
    await this.request("thread/delete", { threadId }, 30000);
  }

  async createContinuation({ title, cwd, transcriptPath }) {
    await this.start();
    const started = await this.request("thread/start", { cwd, serviceName: "workbridge" }, 30000);
    const threadId = started.thread.id;
    await this.request("thread/name/set", { threadId, name: `${title} (${serverT(this.language, "movedSuffix")})` });
    await this.request("turn/start", {
      threadId,
      input: [{
        type: "text",
        text: serverT(this.language, "continuation", { path: transcriptPath })
      }]
    }, 30000);
    return threadId;
  }

  close() {
    if (this.process && !this.process.killed) this.process.kill();
  }
}

function extractText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).filter(Boolean).join("\n");
  if (typeof value !== "object") return "";
  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;
  if (value.content) return extractText(value.content);
  if (value.message) return extractText(value.message);
  return "";
}

function normalizeThread(thread, language = "ko") {
  const messages = [];
  for (const turn of thread.turns || []) {
    for (const item of turn.items || []) {
      const type = String(item.type || "").toLowerCase();
      let role;
      if (type.includes("user")) role = "user";
      else if (type.includes("agent") || type.includes("assistant")) role = "assistant";
      else continue;
      const content = extractText(item).trim();
      if (content) messages.push({ role, content, createdAt: item.createdAt || null });
    }
  }
  return {
    id: thread.id,
    kind: "codex",
    title: thread.name || thread.preview || serverT(language, "defaultTitle"),
    createdAt: thread.createdAt ? new Date(thread.createdAt * 1000).toISOString() : null,
    updatedAt: thread.updatedAt ? new Date(thread.updatedAt * 1000).toISOString() : null,
    cwd: thread.cwd || null,
    gitInfo: thread.gitInfo || null,
    messages
  };
}

module.exports = { AppServerClient, candidateCodexPaths, normalizeThread, resolveCodexCommand };
