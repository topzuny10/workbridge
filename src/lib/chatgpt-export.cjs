const fs = require("node:fs");
const { randomUUID } = require("node:crypto");
const AdmZip = require("adm-zip");

function textFromContent(content) {
  if (!content) return "";
  if (Array.isArray(content.parts)) {
    return content.parts.filter((part) => typeof part === "string").join("\n").trim();
  }
  if (typeof content.text === "string") return content.text.trim();
  return "";
}

function normalizeConversation(conversation) {
  const mapping = conversation.mapping || {};
  const ordered = [];
  const seen = new Set();
  let nodeId = conversation.current_node;

  while (nodeId && mapping[nodeId] && !seen.has(nodeId)) {
    seen.add(nodeId);
    ordered.push(mapping[nodeId]);
    nodeId = mapping[nodeId].parent;
  }
  ordered.reverse();

  if (!ordered.length) {
    ordered.push(...Object.values(mapping).sort((a, b) =>
      Number(a?.message?.create_time || 0) - Number(b?.message?.create_time || 0)));
  }

  const messages = ordered.flatMap((node) => {
    const message = node?.message;
    const role = message?.author?.role;
    const content = textFromContent(message?.content);
    if (!content || !["user", "assistant", "system"].includes(role)) return [];
    return [{
      role,
      content,
      createdAt: message.create_time ? new Date(message.create_time * 1000).toISOString() : null
    }];
  });

  return {
    id: String(conversation.id || conversation.conversation_id || randomUUID()),
    kind: "chatgpt",
    title: String(conversation.title || "제목 없는 대화"),
    createdAt: conversation.create_time ? new Date(conversation.create_time * 1000).toISOString() : null,
    updatedAt: conversation.update_time ? new Date(conversation.update_time * 1000).toISOString() : null,
    cwd: null,
    messages
  };
}

function readChatGptExport(filePath) {
  let raw;
  if (filePath.toLowerCase().endsWith(".zip")) {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries().filter((item) => /(^|\/)conversations(?:-\d+)?\.json$/i.test(item.entryName));
    if (!entries.length) throw new Error("ZIP에서 conversations.json을 찾지 못했습니다.");
    const conversations = entries.flatMap((entry) => JSON.parse(entry.getData().toString("utf8")));
    return conversations.map(normalizeConversation).filter((conversation) => conversation.messages.length);
  } else {
    raw = fs.readFileSync(filePath, "utf8");
  }
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("지원하지 않는 ChatGPT export 형식입니다.");
  return parsed.map(normalizeConversation).filter((conversation) => conversation.messages.length);
}

module.exports = { normalizeConversation, readChatGptExport };
