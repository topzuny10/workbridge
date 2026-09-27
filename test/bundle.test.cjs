const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createBundle, readBundle, restoreProject } = require("../src/lib/bundle.cjs");
const { Store } = require("../src/lib/store.cjs");

test("conversation bundle round-trips without credentials", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-"));
  try {
    const bundlePath = path.join(directory, "move.workbridge");
    createBundle({
      destination: bundlePath,
      includeProjects: false,
      chats: [{ id: "1", kind: "chatgpt", title: "대화", cwd: null, messages: [{ role: "user", content: "안녕" }] }]
    });
    const manifest = readBundle(bundlePath);
    assert.equal(manifest.chats[0].messages[0].content, "안녕");
    assert.equal(manifest.projects.length, 0);
    assert.match(manifest.notes[0], /Git 프로젝트는 포함하지 않았습니다/);
    assert.equal(JSON.stringify(manifest).includes("apiKey"), false);

    const store = new Store(path.join(directory, "state"));
    const { record, alreadyImported } = store.importBundle(bundlePath);
    assert.equal(alreadyImported, false);
    assert.equal(store.getImport(record.id).manifest.chats.length, 1);
    const duplicate = store.importBundle(bundlePath);
    assert.equal(duplicate.alreadyImported, true);
    assert.equal(duplicate.record.id, record.id);
    assert.equal(store.listImports().length, 1);
    store.deleteImport(record.id);
    assert.equal(store.listImports().length, 0);
    assert.equal(fs.existsSync(record.bundlePath), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Git project restores commit history and working changes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-git-"));
  try {
    const source = path.join(directory, "sample-project");
    fs.mkdirSync(source);
    execFileSync("git", ["init", "-b", "main", source]);
    execFileSync("git", ["-C", source, "config", "user.email", "test@example.com"]);
    execFileSync("git", ["-C", source, "config", "user.name", "WorkBridge Test"]);
    fs.writeFileSync(path.join(source, "tracked.txt"), "base\n");
    execFileSync("git", ["-C", source, "add", "tracked.txt"]);
    execFileSync("git", ["-C", source, "commit", "-m", "base"]);
    fs.writeFileSync(path.join(source, "tracked.txt"), "base\nchanged\n");

    const bundlePath = path.join(directory, "git.workbridge");
    const manifest = createBundle({
      destination: bundlePath,
      includeProjects: true,
      chats: [{ id: "codex-1", kind: "codex", title: "작업", cwd: source, messages: [] }]
    });
    assert.match(manifest.notes[0], /git bundle --all/);
    const restoredParent = path.join(directory, "restored");
    fs.mkdirSync(restoredParent);
    const restored = restoreProject({
      bundlePath,
      projectId: manifest.projects[0].id,
      destinationParent: restoredParent
    });
    assert.equal(fs.readFileSync(path.join(restored, "tracked.txt"), "utf8"), "base\nchanged\n");
    assert.match(execFileSync("git", ["-C", restored, "log", "-1", "--pretty=%s"], { encoding: "utf8" }), /base/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("legacy state without imports remains readable", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-state-"));
  try {
    fs.writeFileSync(path.join(directory, "workbridge.json"), JSON.stringify({ version: 1, preferences: { language: "en", theme: "light" } }));
    const store = new Store(directory);
    assert.deepEqual(store.listImports(), []);
    assert.equal(store.getPreferences().language, "en");
  } finally { fs.rmSync(directory, { recursive: true, force: true }); }
});
