import {
  generateText,
  stepCountIs,
  tool,
  type ModelMessage,
  type ToolSet,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import type {
  EvalData,
  SingleTurnResult,
  MultiTurnEvalData,
  MultiTurnResult,
} from "./types.ts";
import { buildMockedTools, buildPrompt } from "./utils.ts";
import { SYSTEM_PROMPT } from "../src/agent/system/prompt.ts";

const TOOL_DEFINITIONS: Record<
  string,
  { description: string; parameters: z.ZodObject<z.ZodRawShape> }
> = {
  readFile: {
    description: "Read the contents of the file at the specified path.",
    parameters: z.object({
      path: z.string().describe("the path to the file that you want to read"),
    }),
  },
  writeFile: {
    description: "Write give content to the file at the specified path.",
    parameters: z.object({
      path: z
        .string()
        .describe("the path to the file that you want to write to"),

      content: z.string().describe("the content you want to write to the file"),
    }),
  },
  listFiles: {
    description: "List all the files in a directory.",
    parameters: z.object({
      path: z
        .string()
        .describe(
          "the path of the directory in which you want to list the files",
        ),
    }),
  },
  deleteFile: {
    description: "Delete a file at a specified path",
    parameters: z.object({
      path: z.string().describe("the path to the file that you want to delete"),
    }),
  },
  runCommand: {
    description: "Execute a shell command and return its output",
    parameters: z.object({
      path: z.string().describe("the shell command to execute"),
    }),
  },
};

export const singleTurnExecutorWithMocks = async (data: EvalData) => {
  const prompt = buildPrompt(data);
  const tools: ToolSet = {};

  for (const toolName of data.tools) {
    const def = TOOL_DEFINITIONS[toolName];

    if (def) {
      tools[toolName] = tool({
        description: def.description,
        inputSchema: def.parameters,
      });
    }
  }

  const { toolCalls } = await generateText({
    model: openai(data.config?.model ?? "gpt-5-mini"),
    ...prompt,
    tools,
    stopWhen: stepCountIs(1),
    temperature: data.config?.temperature,
  });

  const calls = toolCalls.map((tc) => ({
    toolName: tc.toolName,
    args: "args" in tc ? tc.args : {},
  }));

  const toolNames = toolCalls.map((tc) => tc.toolName);

  return {
    toolCalls,
    toolNames,
    selectedAny: toolNames.length > 0,
  };
};

/**
 * Multi-turn executor with mocked tools.
 * Runs a complete agent loop with tools returning fixed values.
 */

export const multiTurnWithMocks = async (data: MultiTurnEvalData) => {
  const tools = buildMockedTools(data.mockTools);

  const messages: ModelMessage[] = data.messages ?? [
    {
      role: "user",
      content: data.prompt!,
    },
  ];

  const result = await generateText({
    model: openai(data.config?.model ?? "gpt-5-mini"),
    messages,
    instructions: {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    tools,
    stopWhen: stepCountIs(data.config?.maxSteps ?? 20),
  });

  const allToolsCalls: string[] = [];
  const steps = result.steps.map((step) => {
    const stepToolCalls = (step.toolCalls ?? []).map((tc) => {
      allToolsCalls.push(tc.toolName);
      return {
        toolName: tc.toolName,
        args: "args" in tc ? tc.args : {},
      };
    });

    const stepToolResults = (step.staticToolResults ?? []).map((tr) => ({
      toolName: tr.toolName,
      result: "results" in tr ? tr.results : tr,
    }));

    return {
      toolCalls: step.toolCalls.length > 0 ? stepToolCalls : undefined,
      toolResults: stepToolResults.length > 0 ? stepToolResults : undefined,
      text: step.text || undefined,
    };
  });

  const toolsUsed = [new Set(allToolsCalls)];

  return {
    text: result.text,
    steps,
    toolsUsed,
    toolCallOrder: allToolsCalls,
  };
};
