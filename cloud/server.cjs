#!/usr/bin/env node
const crypto = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const MAX_BYTES = 520 * 1024 * 1024;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(body));
}

function normalizeEmail(value) { return String(value || "").trim().toLowerCase(); }
function tokenHash(value) { return crypto.createHash("sha256").update(value).digest("hex"); }
function passwordHash(password, salt) { return crypto.scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex"); }

class CloudStore {
  constructor(directory) {
    this.directory = directory;
    this.file = path.join(directory, "cloud.json");
    this.objects = path.join(directory, "objects");
    fs.mkdirSync(this.objects, { recursive: true });
    this.data = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, "utf8")) : { version: 1, users: [], sessions: [], bundles: [] };
    this.data.version = 1;
    this.data.users ||= [];
    this.data.sessions ||= [];
    this.data.bundles ||= [];
  }
  save() { const temporary = `${this.file}.tmp`; fs.writeFileSync(temporary, JSON.stringify(this.data, null, 2), { mode: 0o600 }); fs.renameSync(temporary, this.file); }
  signup(email, password) {
    email = normalizeEmail(email);
    if (!/^\S+@\S+\.\S+$/.test(email)) throw Object.assign(new Error("Enter a valid email address."), { status: 400 });
    if (typeof password !== "string" || password.length < 10) throw Object.assign(new Error("Account password must be at least 10 characters."), { status: 400 });
    if (this.data.users.some((user) => user.email === email)) throw Object.assign(new Error("Account already exists."), { status: 409 });
    const salt = crypto.randomBytes(16).toString("hex");
    const user = { id: crypto.randomUUID(), email, salt, passwordHash: passwordHash(password, salt), createdAt: new Date().toISOString() };
    this.data.users.push(user); this.save();
    return this.session(user);
  }
  login(email, password) {
    const user = this.data.users.find((item) => item.email === normalizeEmail(email));
    const expected = user?.passwordHash || "0".repeat(64);
    const actual = passwordHash(String(password || ""), user?.salt || "invalid-user-salt");
    if (!user || !crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"))) throw Object.assign(new Error("Email or password is incorrect."), { status: 401 });
    return this.session(user);
  }
  session(user) {
    const token = crypto.randomBytes(32).toString("base64url");
    const expiresAt = Date.now() + SESSION_MS;
    this.data.sessions = this.data.sessions.filter((item) => item.expiresAt > Date.now());
    this.data.sessions.push({ tokenHash: tokenHash(token), userId: user.id, expiresAt }); this.save();
    return { token, user: { id: user.id, email: user.email }, expiresAt };
  }
  userFor(token) {
    const session = this.data.sessions.find((item) => item.tokenHash === tokenHash(token || "") && item.expiresAt > Date.now());
    return session && this.data.users.find((user) => user.id === session.userId);
  }
  list(userId) { return this.data.bundles.filter((item) => item.userId === userId).map(({ objectPath, userId: _, ...item }) => item).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  add(userId, name, payload) {
    const id = crypto.randomUUID();
    const objectPath = path.join(this.objects, `${id}.wbcloud`);
    fs.writeFileSync(objectPath, payload, { mode: 0o600, flag: "wx" });
    const record = { id, userId, name: String(name || "WorkBridge bundle").slice(0, 160), size: payload.length, checksum: tokenHash(payload), createdAt: new Date().toISOString(), objectPath };
    this.data.bundles.push(record); this.save();
    const { objectPath: _, userId: __, ...publicRecord } = record;
    return publicRecord;
  }
  get(userId, id) { return this.data.bundles.find((item) => item.id === id && item.userId === userId); }
  delete(userId, id) {
    const index = this.data.bundles.findIndex((item) => item.id === id && item.userId === userId);
    if (index < 0) return false;
    const [record] = this.data.bundles.splice(index, 1);
    if (fs.existsSync(record.objectPath)) fs.rmSync(record.objectPath);
    this.save(); return true;
  }
}

async function readBody(request, limit = 1024 * 1024) {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > limit) throw Object.assign(new Error("Upload is too large."), { status: 413 }); chunks.push(chunk); }
  return Buffer.concat(chunks);
}

function createCloudServer({ directory }) {
  const store = new CloudStore(directory);
  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://localhost");
      if (request.method === "GET" && url.pathname === "/health") return json(response, 200, { ok: true });
      if (request.method === "POST" && ["/v1/auth/signup", "/v1/auth/login"].includes(url.pathname)) {
        const body = JSON.parse((await readBody(request)).toString("utf8"));
        return json(response, 200, url.pathname.endsWith("signup") ? store.signup(body.email, body.password) : store.login(body.email, body.password));
      }
      const authorization = request.headers.authorization || "";
      const user = store.userFor(authorization.startsWith("Bearer ") ? authorization.slice(7) : "");
      if (!user) return json(response, 401, { error: "Sign in required." });
      if (request.method === "GET" && url.pathname === "/v1/bundles") return json(response, 200, store.list(user.id));
      if (request.method === "POST" && url.pathname === "/v1/bundles") {
        const payload = await readBody(request, MAX_BYTES);
        if (!payload.subarray(0, 7).equals(Buffer.from("WBCLD1\n"))) return json(response, 400, { error: "Only encrypted WorkBridge cloud files are accepted." });
        const name = decodeURIComponent(String(request.headers["x-workbridge-name"] || "WorkBridge bundle"));
        return json(response, 201, store.add(user.id, name, payload));
      }
      const match = url.pathname.match(/^\/v1\/bundles\/([a-f0-9-]+)$/);
      if (match && request.method === "GET") {
        const record = store.get(user.id, match[1]);
        if (!record) return json(response, 404, { error: "Cloud file not found." });
        response.writeHead(200, { "content-type": "application/octet-stream", "content-length": record.size, "cache-control": "no-store" });
        return fs.createReadStream(record.objectPath).pipe(response);
      }
      if (match && request.method === "DELETE") return store.delete(user.id, match[1]) ? json(response, 200, { deleted: true }) : json(response, 404, { error: "Cloud file not found." });
      return json(response, 404, { error: "Not found." });
    } catch (error) { return json(response, error.status || 500, { error: error.status ? error.message : "Server error." }); }
  });
}

if (require.main === module) {
  const port = Number(process.env.WORKBRIDGE_CLOUD_PORT || 8787);
  const host = process.env.WORKBRIDGE_CLOUD_HOST || "127.0.0.1";
  const directory = process.env.WORKBRIDGE_CLOUD_DATA || path.join(process.cwd(), "workbridge-cloud-data");
  createCloudServer({ directory }).listen(port, host, () => process.stdout.write(`WorkBridge Cloud listening on http://${host}:${port}\nData: ${directory}\n`));
}

module.exports = { CloudStore, createCloudServer };
