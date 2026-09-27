const crypto = require("node:crypto");

const MAGIC = Buffer.from("WBCLD1\n", "ascii");
const MAX_PLAINTEXT_BYTES = 512 * 1024 * 1024;

function deriveKey(passphrase, salt) {
  if (typeof passphrase !== "string" || passphrase.length < 8) throw new Error("Cloud encryption password must be at least 8 characters.");
  return crypto.scryptSync(passphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

function encryptBundle(buffer, passphrase) {
  if (!Buffer.isBuffer(buffer)) buffer = Buffer.from(buffer);
  if (buffer.length > MAX_PLAINTEXT_BYTES) throw new Error("Bundle exceeds the 512 MB cloud limit.");
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(passphrase, salt), iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const header = Buffer.from(JSON.stringify({ version: 1, kdf: "scrypt", cipher: "aes-256-gcm", salt: salt.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64") }), "utf8");
  const headerLength = Buffer.alloc(4);
  headerLength.writeUInt32BE(header.length);
  return Buffer.concat([MAGIC, headerLength, header, ciphertext]);
}

function decryptBundle(payload, passphrase) {
  if (!Buffer.isBuffer(payload)) payload = Buffer.from(payload);
  if (payload.length < MAGIC.length + 4 || !payload.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error("Invalid WorkBridge cloud file.");
  const headerLength = payload.readUInt32BE(MAGIC.length);
  const headerStart = MAGIC.length + 4;
  const bodyStart = headerStart + headerLength;
  if (headerLength < 2 || bodyStart > payload.length) throw new Error("Invalid WorkBridge cloud header.");
  const header = JSON.parse(payload.subarray(headerStart, bodyStart).toString("utf8"));
  if (header.version !== 1 || header.kdf !== "scrypt" || header.cipher !== "aes-256-gcm") throw new Error("Unsupported WorkBridge cloud format.");
  try {
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(passphrase, Buffer.from(header.salt, "base64")), Buffer.from(header.iv, "base64"));
    decipher.setAuthTag(Buffer.from(header.tag, "base64"));
    return Buffer.concat([decipher.update(payload.subarray(bodyStart)), decipher.final()]);
  } catch (error) {
    if (error.message.includes("password must")) throw error;
    throw new Error("Cloud file could not be decrypted. Check the encryption password.");
  }
}

module.exports = { decryptBundle, encryptBundle };
