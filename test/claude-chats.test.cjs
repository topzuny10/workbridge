const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { listClaudeChats, readClaudeChat } = require("../src/lib/claude-chats.cjs");

test("Claude Code JSONL sessions map local tasks like Codex work", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-claude-"));
  try {
    const project = path.join(directory, "-tmp-sample-project");
    fs.mkdirSync(project, { recursive: true });
    const session = path.join(project, "11111111-2222-3333-4444-555555555555.jsonl");
    fs.writeFileSync(session, [
      JSON.stringify({ type: "user", cwd: "/tmp/sample-project", timestamp: "2026-09-27T01:00:00.000Z", message: { role: "user", content: "Fix the export layout" } }),
      JSON.stringify({ type: "assistant", cwd: "/tmp/sample-project", timestamp: "2026-09-27T01:01:00.000Z", message: { role: "assistant", content: [{ type: "text", text: "I will resize the card." }, { type: "tool_use", name: "Edit" }] } }),
      JSON.stringify({ type: "user", cwd: "/tmp/sample-project", message: { role: "user", content: [{ type: "tool_result", content: "private tool output" }] } })
    ].join("\n"));
    const listed = listClaudeChats({ projectsDir: directory, language: "en" });
    assert.equal(listed.length, 1);
    assert.equal(listed[0].kind, "claude");
    assert.equal(listed[0].title, "Fix the export layout");
    assert.equal(listed[0].cwd, "/tmp/sample-project");
    const full = readClaudeChat(listed[0], "en");
    assert.equal(full.messages.length, 2);
    assert.equal(full.messages[1].content, "I will resize the card.");
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
