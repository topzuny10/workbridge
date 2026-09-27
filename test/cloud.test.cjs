const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { CloudClient, normalizeServerUrl } = require("../src/lib/cloud-client.cjs");
const { decryptBundle, encryptBundle } = require("../src/lib/cloud-crypto.cjs");
const { createCloudServer } = require("../cloud/server.cjs");

test("cloud encryption round-trips and rejects the wrong password", () => {
  const source = Buffer.from("private conversation content");
  const encrypted = encryptBundle(source, "correct horse battery staple");
  assert.equal(encrypted.includes(source), false);
  assert.deepEqual(decryptBundle(encrypted, "correct horse battery staple"), source);
  assert.throws(() => decryptBundle(encrypted, "wrong password"), /could not be decrypted/);
});

test("cloud URL requires HTTPS except on localhost", () => {
  assert.equal(normalizeServerUrl("http://127.0.0.1:8787/"), "http://127.0.0.1:8787");
  assert.equal(normalizeServerUrl("https://cloud.example.com/"), "https://cloud.example.com");
  assert.throws(() => normalizeServerUrl("http://cloud.example.com"), /must use HTTPS/);
});

test("account can upload, list, download, and delete an encrypted bundle", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "workbridge-cloud-"));
  const server = createCloudServer({ directory });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = server.address().port;
    const client = new CloudClient(`http://127.0.0.1:${port}`);
    await client.authenticate("signup", { email: "user@example.com", password: "account-password", passphrase: "vault-password" });
    const bundlePath = path.join(directory, "sample.workbridge");
    fs.writeFileSync(bundlePath, "bundle bytes");
    const uploaded = await client.upload(bundlePath, "Mac conversations");
    assert.equal((await client.list()).length, 1);
    const downloadPath = path.join(directory, "download.workbridge");
    await client.download(uploaded.id, downloadPath);
    assert.equal(fs.readFileSync(downloadPath, "utf8"), "bundle bytes");
    await client.delete(uploaded.id);
    assert.equal((await client.list()).length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
