import "dotenv/config";
import { generateText, type ModelMessage } from "ai";
import { tools } from "./tools/index.ts";
import { executeTool } from "./executeTools.ts";
import { openai } from "@ai-sdk/openai";
import { SYSTEM_PROMPT } from "./system/prompt";
import { type AgentCallbacks } from "../types.ts";

const MODEL_NAME = "gpt-5-mini";

export const runAgent = async (
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
) => {
  const { text, toolCalls } = await generateText({
    model: openai(MODEL_NAME),
    prompt: userMessage,
    instructions: SYSTEM_PROMPT,
    tools,
  });

  console.log(text, toolCalls);

  for (const tc of toolCalls) {
    const result = await executeTool(tc.toolName, tc.input);
    console.log(result);
  }
};

runAgent("What is the current date and time?");
