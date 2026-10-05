import "dotenv/config";
import { generateText, type ModelMessage, registerTelemetry } from "ai";
import { openai } from "@ai-sdk/openai";
import { getTracer, LaminarAiSdkTelemetry } from "@lmnr-ai/lmnr";
import { tools } from "./tools/index.ts";
import { executeTool } from "./executeTools.ts";
import { SYSTEM_PROMPT } from "./system/prompt.ts";
import { type AgentCallbacks } from "../types.ts";

const MODEL_NAME = "gpt-5-mini";

// export const runAgent = async (
//   userMessage: string,
//   conversationHistory: ModelMessage[],
//   callbacks: AgentCallbacks,
// ) => {
//   const { text, toolCalls } = await generateText({
//     model: openai(MODEL_NAME),
//     prompt: userMessage,
//     instructions: SYSTEM_PROMPT,
//     tools,
//     telemetry: {
//       isEnabled: true,
//       includeToolsContext: getTracer(),
//     },
//   });

//   console.log("done");

//   // for (const tc of toolCalls) {
//   //   const result = await executeTool(tc.toolName, tc.input);
//   //   console.log(result);
//   // }
// };

export async function runAgent(
  userMessage: string,
  conversationHistory: ModelMessage[],
  callbacks: AgentCallbacks,
): Promise<any> {
  const { text } = await generateText({
    model: openai(MODEL_NAME),
    prompt: userMessage,
    system: SYSTEM_PROMPT,
    tools,
  });

  console.log(text);
}

// runAgent("What is the current date and time?");
