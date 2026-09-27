const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { candidateCodexPaths, resolveCodexCommand } = require("../src/lib/app-server.cjs");

test("Codex command honors an explicit executable path", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-codex-"));
  const executable = path.join(directory, "codex");
  try {
    fs.writeFileSync(executable, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(executable, 0o755);
    assert.equal(resolveCodexCommand({ WORKBRIDGE_CODEX_PATH: executable, PATH: "" }, "linux"), executable);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Codex command resolves an executable from PATH", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-path-"));
  const executable = path.join(directory, "codex.exe");
  try {
    fs.writeFileSync(executable, "#!/bin/sh\nexit 0\n");
    fs.chmodSync(executable, 0o755);
    assert.equal(resolveCodexCommand({ PATH: directory }, "win32"), executable);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Codex desktop executable is preferred over an older PATH CLI", () => {
  const candidates = candidateCodexPaths({ HOME: "/home/alex", PATH: "/snap/bin:/usr/local/bin" }, "linux");
  assert.ok(candidates.indexOf("/usr/lib/chatgpt/resources/codex") < candidates.indexOf("/snap/bin/codex"));
  assert.ok(candidates.indexOf("/usr/local/bin/codex") < candidates.indexOf("/snap/bin/codex"));
});

test("Codex candidates include per-user and OS desktop app locations", () => {
  const linux = candidateCodexPaths({ HOME: "/home/alex", PATH: "" }, "linux");
  const mac = candidateCodexPaths({ HOME: "/Users/alex", PATH: "" }, "darwin");
  assert.ok(linux.includes("/home/alex/.local/bin/codex"));
  assert.ok(linux.includes("/usr/lib/chatgpt/resources/codex"));
  assert.ok(mac.includes("/Users/alex/Applications/Codex.app/Contents/Resources/codex"));
  assert.ok(mac.includes("/Applications/ChatGPT.app/Contents/Resources/codex"));
});

test("Codex command can be discovered through the user's login shell", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-shell-"));
  const executable = path.join(directory, "codex");
  const shell = path.join(directory, "user-shell");
  try {
    fs.writeFileSync(executable, "#!/bin/sh\nexit 0\n");
    fs.writeFileSync(shell, `#!/bin/sh\nprintf '%s\\n' '${executable}'\n`);
    fs.chmodSync(executable, 0o755);
    fs.chmodSync(shell, 0o755);
    assert.equal(resolveCodexCommand({ HOME: directory, PATH: "", SHELL: shell }, "darwin"), executable);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("Codex detection errors follow the selected language", () => {
  assert.throws(
    () => resolveCodexCommand({ HOME: "/path/that/does/not/exist", PATH: "", SHELL: "/missing/shell" }, "darwin", "en"),
    /could not be detected/
  );
});
