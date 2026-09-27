const fs = require("node:fs");
const path = require("node:path");
const { decryptBundle, encryptBundle } = require("./cloud-crypto.cjs");

function normalizeServerUrl(value) {
  const url = new URL(String(value || "").trim());
  const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(local && url.protocol === "http:")) throw new Error("Cloud server must use HTTPS. HTTP is allowed only for localhost.");
  return url.href.replace(/\/$/, "");
}

class CloudClient {
  constructor(serverUrl, fetchImplementation = globalThis.fetch) {
    this.serverUrl = normalizeServerUrl(serverUrl);
    this.fetch = fetchImplementation;
    this.token = null;
    this.user = null;
    this.passphrase = null;
  }

  async #request(route, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (this.token) headers.authorization = `Bearer ${this.token}`;
    const response = await this.fetch(`${this.serverUrl}${route}`, { ...options, headers });
    const type = response.headers.get("content-type") || "";
    const result = type.includes("application/json") ? await response.json() : Buffer.from(await response.arrayBuffer());
    if (!response.ok) throw new Error(result?.error || `Cloud request failed (${response.status}).`);
    return result;
  }

  async authenticate(mode, { email, password, passphrase }) {
    if (!['signup', 'login'].includes(mode)) throw new Error("Invalid authentication mode.");
    if (typeof passphrase !== "string" || passphrase.length < 8) throw new Error("Cloud encryption password must be at least 8 characters.");
    const result = await this.#request(`/v1/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    this.token = result.token;
    this.user = result.user;
    this.passphrase = passphrase;
    return result.user;
  }

  logout() { this.token = null; this.user = null; this.passphrase = null; }

  state() { return { authenticated: Boolean(this.token), user: this.user, serverUrl: this.serverUrl }; }

  list() { return this.#request("/v1/bundles"); }

  async upload(bundlePath, name) {
    if (!this.passphrase) throw new Error("Sign in and unlock cloud encryption first.");
    const encrypted = encryptBundle(fs.readFileSync(bundlePath), this.passphrase);
    return this.#request("/v1/bundles", {
      method: "POST",
      headers: { "content-type": "application/octet-stream", "x-workbridge-name": encodeURIComponent(name || path.basename(bundlePath)) },
      body: encrypted
    });
  }

  async download(id, destination) {
    if (!this.passphrase) throw new Error("Sign in and unlock cloud encryption first.");
    const encrypted = await this.#request(`/v1/bundles/${encodeURIComponent(id)}`);
    const temporary = `${destination}.tmp`;
    fs.writeFileSync(temporary, decryptBundle(encrypted, this.passphrase));
    fs.renameSync(temporary, destination);
    return destination;
  }

  delete(id) { return this.#request(`/v1/bundles/${encodeURIComponent(id)}`, { method: "DELETE" }); }
}

module.exports = { CloudClient, normalizeServerUrl };
