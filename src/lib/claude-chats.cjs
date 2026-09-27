const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

function claudeProjectsDir(environment = process.env, homeDirectory = os.homedir()) {
  return environment.CLAUDE_PROJECTS_DIR || path.join(homeDirectory, ".claude", "projects");
}

function textFrom(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFrom).filter(Boolean).join("\n");
  if (typeof value !== "object") return "";
  if (value.type && !["text", "input_text", "output_text"].includes(value.type)) return "";
  if (typeof value.text === "string") return value.text;
  if (typeof value.content !== "undefined") return textFrom(value.content);
  return "";
}

function cleanContent(value) {
  return String(value || "")
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, "")
    .replace(/<local-command-caveat>[\s\S]*?<\/local-command-caveat>/gi, "")
    .trim();
}

function roleFrom(entry) {
  if (entry?.isMeta) return null;
  const role = String(entry?.message?.role || entry?.role || entry?.type || "").toLowerCase();
  if (role === "user" || role === "human") return "user";
  if (role === "assistant") return "assistant";
  return null;
}

function parseTranscript(filePath) {
  const messages = [];
  let cwd = null;
  let firstTimestamp = null;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\n+/)) {
    if (!line.trim()) continue;
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    cwd ||= typeof entry.cwd === "string" && entry.cwd ? entry.cwd : null;
    firstTimestamp ||= entry.timestamp || entry.createdAt || null;
    const role = roleFrom(entry);
    if (!role) continue;
    const content = cleanContent(textFrom(entry.message?.content ?? entry.content));
    if (!content) continue;
    messages.push({ role, content, createdAt: entry.timestamp || entry.createdAt || null });
  }
  return { messages, cwd, firstTimestamp };
}

function titleFrom(messages, fallback) {
  const first = messages.find((message) => message.role === "user")?.content || messages[0]?.content || "";
  const line = first.split(/\n/).map((item) => item.trim()).find(Boolean) || fallback;
  return line.replace(/\s+/g, " ").slice(0, 80);
}

function listClaudeChats({ projectsDir = claudeProjectsDir(), language = "ko" } = {}) {
  if (!fs.existsSync(projectsDir)) return [];
  const fallback = language === "en" ? "Claude Code task" : "Claude Code 작업";
  const chats = [];
  for (const projectName of fs.readdirSync(projectsDir)) {
    const projectDir = path.join(projectsDir, projectName);
    let files;
    try {
      if (!fs.statSync(projectDir).isDirectory()) continue;
      files = fs.readdirSync(projectDir).filter((name) => name.endsWith(".jsonl"));
    } catch { continue; }
    for (const name of files) {
      const transcriptPath = path.join(projectDir, name);
      try {
        const parsed = parseTranscript(transcriptPath);
        if (!parsed.messages.length) continue;
        const stat = fs.statSync(transcriptPath);
        chats.push({
          id: `claude-${path.basename(name, ".jsonl")}`,
          kind: "claude",
          title: titleFrom(parsed.messages, fallback),
          createdAt: parsed.firstTimestamp || stat.birthtime.toISOString(),
          updatedAt: stat.mtime.toISOString(),
          cwd: parsed.cwd,
          messages: [],
          unloaded: true,
          transcriptPath
        });
      } catch { continue; }
    }
  }
  return chats.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function readClaudeChat(chat, language = "ko") {
  const fallback = language === "en" ? "Claude Code task" : "Claude Code 작업";
  const parsed = parseTranscript(chat.transcriptPath);
  return { ...chat, title: titleFrom(parsed.messages, chat.title || fallback), cwd: parsed.cwd || chat.cwd, messages: parsed.messages, unloaded: false };
}

module.exports = { claudeProjectsDir, listClaudeChats, parseTranscript, readClaudeChat };
