const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeConversation } = require("../src/lib/chatgpt-export.cjs");

test("ChatGPT mapping follows the selected branch in order", () => {
  const conversation = normalizeConversation({
    id: "chat-1",
    title: "선택한 대화",
    current_node: "a2",
    mapping: {
      root: { parent: null },
      u1: { parent: "root", message: { author: { role: "user" }, content: { parts: ["질문"] }, create_time: 1 } },
      a2: { parent: "u1", message: { author: { role: "assistant" }, content: { parts: ["답변"] }, create_time: 2 } },
      branch: { parent: "u1", message: { author: { role: "assistant" }, content: { parts: ["선택되지 않은 답"] }, create_time: 3 } }
    }
  });
  assert.deepEqual(conversation.messages.map((message) => message.content), ["질문", "답변"]);
});
