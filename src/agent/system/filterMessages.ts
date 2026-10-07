import type { ModelMessage } from "ai";
/**
 * Filter conversation history to only include compatible message formats.
 * Provider tools (like webSearch) may return messages with formats that
 * cause issues when passed back to subsequent API calls.
 */
export const filterCompatibleMessages = (
  messages: ModelMessage[],
): ModelMessage[] => {
  return messages.flatMap((msg): ModelMessage[] => {
    if (msg.role === "user") {
      return [msg];
    }

    if (msg.role === "assistant") {
      if (typeof msg.content === "string") {
        return msg.content.trim()
          ? [{ role: "assistant", content: msg.content }]
          : [];
      }

      const textContent = msg.content.flatMap((part) =>
        part.type === "text" && part.text.trim()
          ? [{ type: "text" as const, text: part.text }]
          : [],
      );
      return textContent.length > 0
        ? [{ role: "assistant", content: textContent }]
        : [];
    }

    return [];
  });
};
