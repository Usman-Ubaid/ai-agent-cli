import { dateTime } from "./dateTime.ts";
import { deleteFiles, listFiles, readFile, writeFile } from "./file.ts";

export const tools = { dateTime, readFile, writeFile, listFiles, deleteFiles };

export { readFile, listFiles, deleteFiles, writeFile } from "./file.ts";

export const fileTools = {
  readFile,
  writeFile,
  listFiles,
  deleteFiles,
};
