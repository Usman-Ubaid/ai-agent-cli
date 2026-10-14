import { dateTime } from "./dateTime.ts";
import { deleteFiles, listFiles, readFile, writeFile } from "./file.ts";
import { webSearch } from "./webSearch.ts";

export const tools = {
  dateTime,
  readFile,
  writeFile,
  listFiles,
  deleteFiles,
  webSearch,
};

export { readFile, listFiles, deleteFiles, writeFile } from "./file.ts";
export { webSearch } from "./webSearch.ts";

export const fileTools = {
  readFile,
  writeFile,
  listFiles,
  deleteFiles,
};
