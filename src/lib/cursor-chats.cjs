const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function cursorProjectsDir(environment = process.env) {
  return environment.CURSOR_PROJECTS_DIR || path.join(os.homedir(), ".cursor", "projects");
}

function textFrom(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFrom).filter(Boolean).join("\n");
  if (typeof value !== "object") return "";
  if (typeof value.text === "string") return value.text;
  if (typeof value.content !== "undefined") return textFrom(value.content);
  if (value.message) return textFrom(value.message);
  return "";
}

function roleFrom(entry) {
  const role = String(entry?.role || entry?.type || entry?.kind || "").toLowerCase();
  if (!role || role.includes("system") || role.includes("tool") || role.includes("thinking")) return null;
  if (role.includes("user")) return "user";
  if (role.includes("assistant") || role.includes("agent")) return "assistant";
  return null;
}

function parseTranscript(filePath) {
  const messages = [];
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\n+/)) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    const role = roleFrom(entry);
    if (!role) continue;
    const content = textFrom(entry.message || entry).trim();
    if (!content) continue;
    messages.push({ role, content, createdAt: entry.createdAt || entry.timestamp || null });
  }
  return messages;
}

function titleFrom(messages, fallback) {
  const first = messages.find((message) => message.role === "user")?.content || messages[0]?.content || "";
  const line = first.split(/\n/).map((item) => item.trim()).find(Boolean) || fallback;
  return line.replace(/\s+/g, " ").slice(0, 80);
}

function workspaceCwd(projectDir) {
  const file = path.join(projectDir, "workspace.json");
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const candidate = data.folder || data.workspacePath || data.workspaceUri || data.folderUri || "";
    if (typeof candidate !== "string" || !candidate) return null;
    return decodeURIComponent(candidate.replace(/^file:\/\//, ""));
  } catch {
    return null;
  }
}

function listTranscriptFiles(projectDir) {
  const folder = path.join(projectDir, "agent-transcripts");
  if (!fs.existsSync(folder)) return [];
  const files = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".jsonl")) files.push(path.join(folder, entry.name));
    if (!entry.isDirectory()) continue;
    const nested = path.join(folder, entry.name);
    for (const name of fs.readdirSync(nested)) {
      if (name.endsWith(".jsonl")) files.push(path.join(nested, name));
    }
  }
  return files;
}

function listCursorChats({ projectsDir = cursorProjectsDir(), language = "ko" } = {}) {
  if (!fs.existsSync(projectsDir)) return [];
  const fallback = language === "en" ? "Cursor chat" : "Cursor 작업";
  const chats = [];
  for (const name of fs.readdirSync(projectsDir)) {
    const projectDir = path.join(projectsDir, name);
    if (!fs.statSync(projectDir).isDirectory()) continue;
    const cwd = workspaceCwd(projectDir);
    for (const filePath of listTranscriptFiles(projectDir)) {
      const id = path.basename(filePath, ".jsonl");
      const stat = fs.statSync(filePath);
      let title = fallback;
      try {
        const preview = parseTranscript(filePath);
        if (!preview.length) continue;
        title = titleFrom(preview, fallback);
      } catch {
        continue;
      }
      chats.push({
        id: `cursor-${id}`,
        kind: "cursor",
        title,
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString(),
        cwd,
        messages: [],
        unloaded: true,
        transcriptPath: filePath
      });
    }
  }
  return chats.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function readCursorChat(chat, language = "ko") {
  const fallback = language === "en" ? "Cursor chat" : "Cursor 작업";
  const messages = parseTranscript(chat.transcriptPath);
  return {
    ...chat,
    title: titleFrom(messages, chat.title || fallback),
    messages,
    unloaded: false
  };
}

module.exports = { cursorProjectsDir, listCursorChats, readCursorChat, parseTranscript };
