const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { listCursorChats, readCursorChat } = require("../src/lib/cursor-chats.cjs");

test("Cursor agent transcripts map local tasks like Codex work", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-cursor-"));
  try {
    const project = path.join(directory, "sample-project");
    fs.mkdirSync(path.join(project, "agent-transcripts", "thread"), { recursive: true });
    fs.writeFileSync(path.join(project, "workspace.json"), JSON.stringify({ folder: `file://${path.join(directory, "repo")}` }));
    const id = "11111111-2222-3333-4444-555555555555";
    fs.writeFileSync(path.join(project, "agent-transcripts", "thread", `${id}.jsonl`), [
      JSON.stringify({ role: "user", message: { content: [{ type: "text", text: "Fix the export cards" }] } }),
      JSON.stringify({ role: "assistant", message: { content: [{ type: "text", text: "I will update the source picker." }] } }),
      JSON.stringify({ role: "system", message: { content: "ignore" } })
    ].join("\n"));
    const listed = listCursorChats({ projectsDir: directory, language: "en" });
    assert.equal(listed.length, 1);
    assert.equal(listed[0].kind, "cursor");
    assert.equal(listed[0].title, "Fix the export cards");
    assert.equal(listed[0].unloaded, true);
    assert.equal(listed[0].cwd, path.join(directory, "repo"));
    const full = readCursorChat(listed[0], "en");
    assert.equal(full.messages.length, 2);
    assert.equal(full.messages[0].role, "user");
    assert.equal(full.messages[1].content, "I will update the source picker.");
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
