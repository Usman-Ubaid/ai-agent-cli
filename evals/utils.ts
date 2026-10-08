import type { EvalData, MultiTurnEvalData } from "./types.ts";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.ts";
import { tool, type ToolSet } from "ai";
import { z } from "zod";

export const buildPrompt = (
  data: EvalData,
): { system: string; prompt: string } => {
  return {
    system: data.systemPrompt ?? SYSTEM_PROMPT,
    prompt: data.prompt,
  };
};

/**
 * Build mocked tools from data config.
 * Each tool returns its configured mockReturn value.
 */
export const buildMockedTools = (
  mockTools: MultiTurnEvalData["mockTools"],
): ToolSet => {
  const tools: ToolSet = {};

  for (const [name, config] of Object.entries(mockTools)) {
    // Build parameter schema dynamically
    const paramSchema: Record<string, z.ZodString> = {};
    for (const paramName of Object.keys(config.parameters)) {
      paramSchema[paramName] = z.string();
    }

    tools[name] = tool({
      description: config.description,
      inputSchema: z.object(paramSchema),
      execute: async () => config.mockReturn,
    });
  }

  return tools;
};
