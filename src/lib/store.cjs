const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { readBundle } = require("./bundle.cjs");

class Store {
  constructor(directory) {
    this.directory = directory;
    this.file = path.join(directory, "workbridge.json");
    this.importsDirectory = path.join(directory, "imports");
    fs.mkdirSync(this.importsDirectory, { recursive: true });
    this.data = fs.existsSync(this.file)
      ? JSON.parse(fs.readFileSync(this.file, "utf8"))
      : { version: 2, imports: [], preferences: { language: "ko", theme: "system", cloudServerUrl: "http://127.0.0.1:8787" } };
    this.data.version = 2;
    this.data.preferences = {
      language: "ko",
      theme: "system",
      cloudServerUrl: "http://127.0.0.1:8787",
      codexPath: null,
      ...(this.data.preferences || {})
    };
    if (!Array.isArray(this.data.imports)) this.data.imports = [];
  }

  #save() {
    const temporary = `${this.file}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(this.data, null, 2));
    fs.renameSync(temporary, this.file);
  }

  importBundle(sourcePath) {
    const manifest = readBundle(sourcePath);
    const existing = this.data.imports.find((item) => {
      if (!manifest.id) return false;
      if (item.bundleId === manifest.id) return true;
      try { return readBundle(item.bundlePath).id === manifest.id; } catch { return false; }
    });
    if (existing) {
      if (!existing.bundleId) {
        existing.bundleId = manifest.id;
        this.#save();
      }
      return { record: structuredClone(existing), alreadyImported: true };
    }
    const id = randomUUID();
    const destination = path.join(this.importsDirectory, `${id}.workbridge`);
    fs.copyFileSync(sourcePath, destination);
    const record = {
      id,
      bundleId: manifest.id,
      bundlePath: destination,
      createdAt: manifest.createdAt,
      importedAt: new Date().toISOString(),
      sourcePlatform: manifest.sourcePlatform,
      chatCount: manifest.chats.length,
      projectCount: manifest.projects.length
    };
    this.data.imports.unshift(record);
    this.#save();
    return { record: structuredClone(record), alreadyImported: false };
  }

  listImports() { return structuredClone(this.data.imports); }

  getPreferences() { return structuredClone(this.data.preferences); }

  setPreferences(preferences) {
    const language = ["ko", "en"].includes(preferences.language) ? preferences.language : "ko";
    const theme = ["system", "black", "light"].includes(preferences.theme) ? preferences.theme : "system";
    const cloudServerUrl = String(preferences.cloudServerUrl || this.data.preferences.cloudServerUrl || "http://127.0.0.1:8787").trim();
    const codexPath = preferences.codexPath === undefined
      ? this.data.preferences.codexPath || null
      : String(preferences.codexPath || "").trim() || null;
    this.data.preferences = { language, theme, cloudServerUrl, codexPath };
    this.#save();
    return this.getPreferences();
  }

  getImport(id) {
    const record = this.data.imports.find((item) => item.id === id);
    if (!record) throw new Error("가져온 묶음을 찾지 못했습니다.");
    return { record: structuredClone(record), manifest: readBundle(record.bundlePath) };
  }

  deleteImport(id) {
    const index = this.data.imports.findIndex((item) => item.id === id);
    if (index < 0) throw new Error("가져온 묶음을 찾지 못했습니다.");
    const [record] = this.data.imports.splice(index, 1);
    if (fs.existsSync(record.bundlePath)) fs.rmSync(record.bundlePath);
    this.#save();
    return structuredClone(record);
  }
}

module.exports = { Store };
