import "dotenv/config";
import { type ModelMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { LaminarAiSdkTelemetry } from "@lmnr-ai/lmnr";
import { tools } from "./tools/index.ts";
import { executeTool } from "./executeTools.ts";
import { SYSTEM_PROMPT } from "./system/prompt.ts";
import { type AgentCallbacks, type ToolCallInfo } from "../types.ts";
import { filterCompatibleMessages } from "./system/filterMessages.ts";

const MODEL_NAME = "gpt-5-mini";

export async function runAgent(
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
): Promise<ModelMessage[]> {
  const workingHistoy = filterCompatibleMessages(conversationHistory);

  const messages: ModelMessage[] = [
    ...workingHistoy,
    { role: "user", content: userMessage },
  ];

  let fullResponse = "";

  while (true) {
    let streamError: unknown;
    const result = streamText({
      model: openai(MODEL_NAME),
      instructions: SYSTEM_PROMPT,
      messages,
      tools,
      onError: ({ error }) => {
        streamError = error;
      },
      telemetry: {
        isEnabled: true,
        integrations: new LaminarAiSdkTelemetry(),
      },
    });

    const toolCalls: ToolCallInfo[] = [];
    let currentText = "";

    try {
      for await (const chunk of result.stream) {
        if (chunk.type === "text-delta") {
          currentText += chunk.text;
          callbacks.onToken(chunk.text);
        }

        if (chunk.type === "tool-call") {
          const input = "input" in chunk ? chunk.input : {};
          toolCalls.push({
            toolCallId: chunk.toolCallId,
            toolName: chunk.toolName,
            args: input as any,
          });
          callbacks.onToolCallStart(chunk.toolName, input);
        }
      }
    } catch (error) {
      throw streamError ?? error;
    }

    if (streamError !== undefined) {
      throw streamError instanceof Error
        ? streamError
        : new Error(String(streamError));
    }

    fullResponse += currentText;

    const finishReason = await result.finishReason;
    if (finishReason !== "tool-calls" || toolCalls.length === 0) {
      const responseMessages = (await result.finalStep).response;
      messages.push(...responseMessages.messages);
      break;
    }

    const responseMessages = (await result.finalStep).response;
    messages.push(...responseMessages.messages);

    for (const tc of toolCalls) {
      const result = await executeTool(tc.toolName, tc.args);

      callbacks.onToolCallEnd(tc.toolName, result);

      messages.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: tc.toolCallId,
            toolName: tc.toolName,
            output: { type: "text", value: "result" },
          },
        ],
      });
    }
  }

  callbacks.onComplete(fullResponse);
  return messages;
}
