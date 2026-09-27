const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { createHash, randomUUID } = require("node:crypto");
const AdmZip = require("adm-zip");

function git(root, args, options = {}) {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: options.encoding || "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function projectForCwd(cwd) {
  if (!cwd || !fs.existsSync(cwd)) return null;
  try {
    const root = git(cwd, ["rev-parse", "--show-toplevel"]).trim();
    return {
      id: createHash("sha256").update(root).digest("hex").slice(0, 16),
      name: path.basename(root),
      sourceRoot: root,
      head: git(root, ["rev-parse", "HEAD"]).trim(),
      branch: git(root, ["branch", "--show-current"]).trim() || null
    };
  } catch {
    return null;
  }
}

function createBundle({ destination, chats, includeProjects = false }) {
  if (!chats.length) throw new Error("선택한 대화가 없습니다.");
  const zip = new AdmZip();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-export-"));
  const projects = [];
  const projectByRoot = new Map();

  try {
    if (includeProjects) {
      for (const chat of chats) {
        const project = projectForCwd(chat.cwd);
        if (!project || projectByRoot.has(project.sourceRoot)) continue;
        projectByRoot.set(project.sourceRoot, project);
        projects.push({ ...project, sourceRoot: undefined });
        const folder = `projects/${project.id}`;
        const bundlePath = path.join(temp, `${project.id}.bundle`);
        execFileSync("git", ["-C", project.sourceRoot, "bundle", "create", bundlePath, "--all"], { maxBuffer: 64 * 1024 * 1024 });
        zip.addLocalFile(bundlePath, folder, "repo.bundle");

        const staged = git(project.sourceRoot, ["diff", "--cached", "--binary", "HEAD"]);
        const unstaged = git(project.sourceRoot, ["diff", "--binary"]);
        if (staged) zip.addFile(`${folder}/staged.patch`, Buffer.from(staged));
        if (unstaged) zip.addFile(`${folder}/unstaged.patch`, Buffer.from(unstaged));
      }
    }

    const transferableChats = chats.map((chat) => {
      const project = includeProjects ? projectForCwd(chat.cwd) : null;
      return { ...chat, projectId: project?.id || null };
    });
    const manifest = {
      format: "workbridge",
      version: 1,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      sourcePlatform: process.platform,
      chats: transferableChats,
      projects,
      notes: includeProjects
        ? ["Git 프로젝트 포함 시 `git bundle --all`로 전체 커밋 기록이 들어갑니다. 커밋된 .env, API 키, 토큰도 포함될 수 있습니다. 미추적 파일은 넣지 않습니다."]
        : ["Git 프로젝트는 포함하지 않았습니다. 미추적 파일과 인증 정보는 넣지 않습니다."]
    };
    zip.addFile("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)));
    zip.writeZip(destination);
    return manifest;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

function readBundle(filePath) {
  const zip = new AdmZip(filePath);
  const entry = zip.getEntry("manifest.json");
  if (!entry) throw new Error("manifest.json이 없는 파일입니다.");
  const manifest = JSON.parse(entry.getData().toString("utf8"));
  if (manifest.format !== "workbridge" || manifest.version !== 1 || !Array.isArray(manifest.chats)) {
    throw new Error("지원하지 않는 WorkBridge 파일입니다.");
  }
  return manifest;
}

function safeProjectName(value, fallback) {
  const cleaned = String(value || "").replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/^\.+|\.+$/g, "").trim();
  return cleaned.slice(0, 80) || fallback;
}

function restoreProject({ bundlePath, projectId, destinationParent }) {
  const zip = new AdmZip(bundlePath);
  const manifest = readBundle(bundlePath);
  const project = manifest.projects.find((item) => item.id === projectId);
  if (!project) throw new Error("묶음에서 프로젝트를 찾지 못했습니다.");
  const target = path.join(destinationParent, safeProjectName(project.name, `project-${project.id}`));
  if (fs.existsSync(target)) throw new Error(`대상 폴더가 이미 존재합니다: ${target}`);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-restore-"));
  try {
    for (const name of ["repo.bundle", "staged.patch", "unstaged.patch"]) {
      const entry = zip.getEntry(`projects/${projectId}/${name}`);
      if (entry) fs.writeFileSync(path.join(temp, name), entry.getData());
    }
    execFileSync("git", ["clone", path.join(temp, "repo.bundle"), target], { stdio: "pipe" });
    if (project.branch) {
      try { git(target, ["checkout", project.branch]); } catch { git(target, ["checkout", "-b", project.branch, project.head]); }
    } else {
      git(target, ["checkout", "--detach", project.head]);
    }
    const staged = path.join(temp, "staged.patch");
    const unstaged = path.join(temp, "unstaged.patch");
    if (fs.existsSync(staged) && fs.statSync(staged).size) execFileSync("git", ["-C", target, "apply", "--index", staged]);
    if (fs.existsSync(unstaged) && fs.statSync(unstaged).size) execFileSync("git", ["-C", target, "apply", unstaged]);
    return target;
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

module.exports = { createBundle, projectForCwd, readBundle, restoreProject };
