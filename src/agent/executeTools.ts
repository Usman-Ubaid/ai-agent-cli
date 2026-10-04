import { tools } from "./tools/index.ts";

export type ToolName = keyof typeof tools;

export const executeTool = async (name: string, args: any) => {
  const tool = tools[name as ToolName];

  if (!tool) {
    return "Unknown tool. This does not exist";
  }

  const execute = tool.execute;

  if (!execute) {
    return "This is not a registered tool";
  }

  const result = await execute(args, {
    toolCallId: "",
    messages: [],
    context: {},
  });

  return String(result);
};
