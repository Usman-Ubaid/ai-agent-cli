import type { EvalData } from "./types.ts";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.ts";

export const buildPrompt = (
  data: EvalData,
): { system: string; prompt: string } => {
  return {
    system: data.systemPrompt ?? SYSTEM_PROMPT,
    prompt: data.prompt,
  };
};
